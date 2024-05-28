import json
import logging
import os
import traceback
from datetime import datetime
from decimal import Decimal as decimal

import boto3
from app.agents.agent import AgentExecutor, create_react_agent, format_log_to_str
from app.agents.handlers.apigw_websocket import ApigwWebsocketCallbackHandler
from app.agents.handlers.token_count import get_token_count_callback
from app.agents.handlers.used_chunk import get_used_chunk_callback
from app.agents.langchain import BedrockLLM
from app.agents.tools.knowledge import AnswerWithKnowledgeTool
from app.agents.tools.rdb_sql.tool import get_sql_tools
from app.agents.tools.weather import today_weather_tool
from app.auth import verify_token
from app.bedrock import compose_args
from app.repositories.conversation import RecordNotFoundError, store_conversation
from app.repositories.models.conversation import ChunkModel, ContentModel, MessageModel
from app.routes.schemas.conversation import ChatInputWithToken
from app.stream import OnStopInput, get_stream_handler_type
from app.usecases.bot import modify_bot_last_used_time
from app.usecases.chat import insert_knowledge, prepare_conversation, trace_to_root
from app.utils import get_anthropic_client, get_current_time, is_anthropic_model
from app.vector_search import filter_used_results, search_related_docs
from boto3.dynamodb.conditions import Key
from ulid import ULID

WEBSOCKET_SESSION_TABLE_NAME = os.environ["WEBSOCKET_SESSION_TABLE_NAME"]

client = get_anthropic_client()
dynamodb_client = boto3.resource("dynamodb")
table = dynamodb_client.Table(WEBSOCKET_SESSION_TABLE_NAME)

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


def process_chat_input(
    chat_input: ChatInputWithToken, gatewayapi, connection_id: str
) -> dict:
    """Process chat input and send the message to the client."""
    logger.info(f"Received chat input: {chat_input}")

    try:
        # Verify JWT token
        decoded = verify_token(chat_input.token)
    except Exception as e:
        logger.error(f"Invalid token: {e}")
        return {"statusCode": 403, "body": "Invalid token."}

    user_id = decoded["sub"]
    try:
        user_msg_id, conversation, bot = prepare_conversation(user_id, chat_input)
    except RecordNotFoundError:
        if chat_input.bot_id:
            gatewayapi.post_to_connection(
                ConnectionId=connection_id,
                Data=json.dumps(
                    dict(
                        status="ERROR",
                        reason="bot_not_found",
                    )
                ).encode("utf-8"),
            )
            return {"statusCode": 404, "body": f"bot {chat_input.bot_id} not found."}
        else:
            return {"statusCode": 400, "body": "Invalid request."}

    if bot and bot.is_agent_enabled():
        logger.info("Bot has agent tools. Using agent for response.")
        llm = BedrockLLM.from_model(model=chat_input.message.model)

        # TODO: remove SQL tool (?)
        tools = get_sql_tools(llm)  # RDB Query Tool
        tools.append(today_weather_tool)  # Weather Tool

        if bot and bot.has_knowledge():
            logger.info("Bot has knowledge. Adding answer with knowledge tool.")
            answer_with_knowledge_tool = AnswerWithKnowledgeTool.from_bot(
                bot=bot,
                llm=llm,
            )
            tools.append(answer_with_knowledge_tool)

        logger.info(f"Tools: {tools}")
        agent = create_react_agent(
            model=chat_input.message.model,
            tools=tools,
            generation_config=bot.generation_params,
        )
        executor = AgentExecutor(
            name="Agent Executor",
            agent=agent,
            tools=tools,
            return_intermediate_steps=True,
            callbacks=[],
            verbose=False,
            max_iterations=15,
            max_execution_time=None,
            early_stopping_method="force",
            handle_parsing_errors=True,
        )

        price = 0.0
        used_chunks = None
        thinking_log = None
        with get_token_count_callback() as token_cb, get_used_chunk_callback() as chunk_cb:
            response = executor.invoke(
                {
                    "input": chat_input.message.content[0].body,
                },
                config={
                    "callbacks": [
                        ApigwWebsocketCallbackHandler(gatewayapi, connection_id),
                        token_cb,
                        chunk_cb,
                    ],
                },
            )
            price = token_cb.total_cost
            if bot.display_retrieved_chunks:
                used_chunks = chunk_cb.used_chunks
            thinking_log = format_log_to_str(response.get("intermediate_steps", []))

        # Append entire completion as the last message
        assistant_msg_id = str(ULID())
        message = MessageModel(
            role="assistant",
            content=[
                ContentModel(
                    content_type="text", body=response["output"], media_type=None
                )
            ],
            model=chat_input.message.model,
            children=[],
            parent=user_msg_id,
            create_time=get_current_time(),
            feedback=None,
            used_chunks=used_chunks,
            thinking_log=thinking_log,
        )
        conversation.message_map[assistant_msg_id] = message
        # Append children to parent
        conversation.message_map[user_msg_id].children.append(assistant_msg_id)
        conversation.last_message_id = assistant_msg_id

        conversation.total_price += price

        # Store conversation before finish streaming so that front-end can avoid 404 issue
        store_conversation(user_id, conversation)

        # Send signal so that frontend can close the connection
        last_data_to_send = json.dumps(
            dict(status="STREAMING_END", completion="", stop_reason="agent_finish")
        ).encode("utf-8")
        gatewayapi.post_to_connection(
            ConnectionId=connection_id, Data=last_data_to_send
        )

        return {"statusCode": 200, "body": "Message sent."}

    message_map = conversation.message_map
    search_results = []
    if bot and bot.has_knowledge():
        gatewayapi.post_to_connection(
            ConnectionId=connection_id,
            Data=json.dumps(
                dict(
                    status="FETCHING_KNOWLEDGE",
                )
            ).encode("utf-8"),
        )

        # Fetch most related documents from vector store
        # NOTE: Currently embedding not support multi-modal. For now, use the last text content.
        query = conversation.message_map[user_msg_id].content[-1].body
        search_results = search_related_docs(
            bot_id=bot.id, limit=bot.search_params.max_results, query=query
        )
        logger.info(f"Search results from vector store: {search_results}")

        # Insert contexts to instruction
        conversation_with_context = insert_knowledge(
            conversation, search_results, display_citation=bot.display_retrieved_chunks
        )
        message_map = conversation_with_context.message_map

    messages = trace_to_root(
        node_id=chat_input.message.parent_message_id,
        message_map=message_map,
    )
    messages.append(chat_input.message)  # type: ignore

    args = compose_args(
        messages,
        chat_input.message.model,
        instruction=(
            message_map["instruction"].content[0].body
            if "instruction" in message_map
            else None
        ),
        stream=True,
        generation_params=(bot.generation_params if bot else None),
    )

    def on_stream(token: str, **kwargs) -> None:
        # Send completion
        data_to_send = json.dumps(dict(status="STREAMING", completion=token)).encode(
            "utf-8"
        )
        gatewayapi.post_to_connection(ConnectionId=connection_id, Data=data_to_send)

    def on_stop(arg: OnStopInput, **kwargs) -> None:
        used_chunks = None
        if bot and bot.display_retrieved_chunks:
            used_chunks = [
                ChunkModel(content=r.content, source=r.source, rank=r.rank)
                for r in filter_used_results(arg.full_token, search_results)
            ]

        # Append entire completion as the last message
        assistant_msg_id = str(ULID())
        message = MessageModel(
            role="assistant",
            content=[
                ContentModel(content_type="text", body=arg.full_token, media_type=None)
            ],
            model=chat_input.message.model,
            children=[],
            parent=user_msg_id,
            create_time=get_current_time(),
            feedback=None,
            used_chunks=used_chunks,
            thinking_log=None,
        )
        conversation.message_map[assistant_msg_id] = message
        # Append children to parent
        conversation.message_map[user_msg_id].children.append(assistant_msg_id)
        conversation.last_message_id = assistant_msg_id

        conversation.total_price += arg.price

        # Store conversation before finish streaming so that front-end can avoid 404 issue
        store_conversation(user_id, conversation)

        last_data_to_send = json.dumps(
            dict(status="STREAMING_END", completion="", stop_reason=arg.stop_reason)
        ).encode("utf-8")
        gatewayapi.post_to_connection(
            ConnectionId=connection_id, Data=last_data_to_send
        )

    stream_handler = get_stream_handler_type(chat_input.message.model)(
        model=chat_input.message.model,
        on_stream=on_stream,
        on_stop=on_stop,
    )
    try:
        for _ in stream_handler.run(args):
            # `StreamHandler.run` returns a generator, so need to iterate
            ...
    except Exception as e:
        logger.error(f"Failed to run stream handler: {e}")
        return {
            "statusCode": 500,
            "body": "Failed to run stream handler.",
        }

    # Update bot last used time
    if chat_input.bot_id:
        logger.info("Bot id is provided. Updating bot last used time.")
        modify_bot_last_used_time(user_id, chat_input.bot_id)

    return {"statusCode": 200, "body": "Message sent."}


def handler(event, context):
    logger.info(f"Received event: {event}")
    route_key = event["requestContext"]["routeKey"]

    if route_key == "$connect":
        return {"statusCode": 200, "body": "Connected."}
    elif route_key == "$disconnect":
        return {"statusCode": 200, "body": "Disconnected."}

    connection_id = event["requestContext"]["connectionId"]
    domain_name = event["requestContext"]["domainName"]
    stage = event["requestContext"]["stage"]
    endpoint_url = f"https://{domain_name}/{stage}"
    gatewayapi = boto3.client("apigatewaymanagementapi", endpoint_url=endpoint_url)

    now = datetime.now()
    expire = int(now.timestamp()) + 60 * 2  # 2 minute from now
    body = event["body"]

    try:
        # API Gateway (websocket) has hard limit of 32KB per message, so if the message is larger than that,
        # need to concatenate chunks and send as a single full message.
        # To do that, we store the chunks in DynamoDB and when the message is complete, send it to SNS.
        # The life cycle of the message is as follows:
        # 1. Client sends `START` message to the WebSocket API.
        # 2. This handler receives the `Session started` message.
        # 3. Client sends message parts to the WebSocket API.
        # 4. This handler receives the message parts and appends them to the item in DynamoDB with index.
        # 5. Client sends `END` message to the WebSocket API.
        # 6. This handler receives the `END` message, concatenates the parts and sends the message to Bedrock.
        if body == "START":
            return {"statusCode": 200, "body": "Session started."}
        elif body == "END":
            # Concatenate the message parts
            message_parts = []
            last_evaluated_key = None

            while True:
                if last_evaluated_key:
                    response = table.query(
                        KeyConditionExpression=Key("ConnectionId").eq(connection_id),
                        ExclusiveStartKey=last_evaluated_key,
                    )
                else:
                    response = table.query(
                        KeyConditionExpression=Key("ConnectionId").eq(connection_id)
                    )

                message_parts.extend(response["Items"])

                if "LastEvaluatedKey" in response:
                    last_evaluated_key = response["LastEvaluatedKey"]
                else:
                    break

            logger.info(f"Number of message chunks: {len(message_parts)}")
            full_message = "".join(item["MessagePart"] for item in message_parts)

            # Process the concatenated full message
            chat_input = ChatInputWithToken(**json.loads(full_message))
            return process_chat_input(chat_input, gatewayapi, connection_id)
        else:
            # Store the message part of full message
            message_json = json.loads(body)
            part_index = message_json["index"]
            message_part = message_json["part"]

            # Store the message part with its index
            table.put_item(
                Item={
                    "ConnectionId": connection_id,
                    "MessagePartId": decimal(part_index),
                    "MessagePart": message_part,
                    "expire": expire,
                }
            )
            return {"statusCode": 200, "body": "Message part received."}

    except Exception as e:
        logger.error(f"Operation failed: {e}")
        logger.error("".join(traceback.format_tb(e.__traceback__)))
        gatewayapi.post_to_connection(
            ConnectionId=connection_id,
            Data=json.dumps({"status": "ERROR", "reason": str(e)}).encode("utf-8"),
        )
        return {"statusCode": 500, "body": str(e)}
