import json
import logging
import os
import traceback
from datetime import datetime
from decimal import Decimal as decimal

import boto3
from anthropic.types import ContentBlockDeltaEvent
from anthropic.types import Message as AnthropicMessage
from anthropic.types import MessageDeltaEvent, MessageStopEvent
from app.auth import verify_token
from app.bedrock import calculate_price, compose_args
from app.repositories.conversation import RecordNotFoundError, store_conversation
from app.repositories.models.conversation import ChunkModel, ContentModel, MessageModel
from app.routes.schemas.conversation import ChatInputWithToken
from app.usecases.bot import modify_bot_last_used_time
from app.usecases.chat import (
    get_bedrock_response,
    insert_knowledge,
    prepare_conversation,
    trace_to_root,
)
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

    is_anthropic = is_anthropic_model(args["model"])

    args_generation_config = {
        "max_tokens": args["max_tokens"],
        "top_k": args["top_k"],
        "top_p": args["top_p"],
        "temperature": args["temperature"],
        "stop_sequences": args["stop_sequences"],
    }

    # logger.debug(f"Invoking bedrock with args: {args}")
    logger.info(f"Invoking bedrock with Generation Config: {args_generation_config}")

    try:
        if is_anthropic:
            response = client.messages.create(**args)
        else:
            # Invoke bedrock streaming api
            response = get_bedrock_response(args)
    except Exception as e:
        logger.error(f"Failed to invoke bedrock: {e}")
        return {"statusCode": 500, "body": "Failed to invoke bedrock."}

    completions: list[str] = []
    last_data_to_send: bytes
    if is_anthropic:
        for event in response:
            # NOTE: following is the example of event sequence:
            # MessageStartEvent(message=Message(id='compl_01GwmkwncsptaeBopeaR4eWE', content=[], model='claude-instant-1.2', role='assistant', stop_reason=None, stop_sequence=None, type='message', usage=Usage(input_tokens=21, output_tokens=1)), type='message_start')
            # ContentBlockStartEvent(content_block=ContentBlock(text='', type='text'), index=0, type='content_block_start')
            # ...
            # ContentBlockDeltaEvent(delta=TextDelta(text='です', type='text_delta'), index=0, type='content_block_delta')
            # ContentBlockStopEvent(index=0, type='content_block_stop')
            # MessageDeltaEvent(delta=Delta(stop_reason='end_turn', stop_sequence=None), type='message_delta', usage=MessageDeltaUsage(output_tokens=26))
            # MessageStopEvent(type='message_stop', amazon-bedrock-invocationMetrics={'inputTokenCount': 21, 'outputTokenCount': 25, 'invocationLatency': 621, 'firstByteLatency': 279})

            if isinstance(event, ContentBlockDeltaEvent):
                completions.append(event.delta.text)
                try:
                    # Send completion
                    data_to_send = json.dumps(
                        dict(
                            status="STREAMING",
                            completion=event.delta.text,
                        )
                    ).encode("utf-8")
                    gatewayapi.post_to_connection(
                        ConnectionId=connection_id, Data=data_to_send
                    )
                except Exception as e:
                    logger.error(f"Failed to post message: {str(e)}")
                    return {
                        "statusCode": 500,
                        "body": "Failed to send message to connection.",
                    }
            elif isinstance(event, MessageDeltaEvent):
                logger.debug(f"Received message delta event: {event.delta}")
                last_data_to_send = json.dumps(
                    dict(
                        completion="",
                        stop_reason=event.delta.stop_reason,
                    )
                ).encode("utf-8")
            elif isinstance(event, MessageStopEvent):
                # Persist conversation before finish streaming so that front-end can avoid 404 issue
                concatenated = "".join(completions)

                # Used chunks for RAG generation
                used_chunks = None
                if bot and bot.display_retrieved_chunks:
                    used_chunks = [
                        ChunkModel(content=r.content, source=r.source, rank=r.rank)
                        for r in filter_used_results(concatenated, search_results)
                    ]

                # Append entire completion as the last message
                assistant_msg_id = str(ULID())
                message = MessageModel(
                    role="assistant",
                    content=[
                        ContentModel(
                            content_type="text", body=concatenated, media_type=None
                        )
                    ],
                    model=chat_input.message.model,
                    children=[],
                    parent=user_msg_id,
                    create_time=get_current_time(),
                    feedback=None,
                    used_chunks=used_chunks,
                )
                conversation.message_map[assistant_msg_id] = message
                # Append children to parent
                conversation.message_map[user_msg_id].children.append(assistant_msg_id)
                conversation.last_message_id = assistant_msg_id

                # Update total pricing
                metrics = event.model_dump()["amazon-bedrock-invocationMetrics"]
                input_token_count = metrics.get("inputTokenCount")
                output_token_count = metrics.get("outputTokenCount")

                logger.debug(
                    f"Input token count: {input_token_count}, output token count: {output_token_count}"
                )

                price = calculate_price(
                    chat_input.message.model, input_token_count, output_token_count
                )
                conversation.total_price += price

                store_conversation(user_id, conversation)
            else:
                continue
    else:
        used_chunks = None
        for event in response.get("body"):
            chunk = event.get("chunk")
            if chunk:
                msg_chunk = json.loads(chunk.get("bytes").decode())
                is_stop = msg_chunk["outputs"][0]["stop_reason"]
                if not is_stop:
                    msg = msg_chunk["outputs"][0]["text"]
                    completions.append(msg)
                    data_to_send = json.dumps(
                        dict(
                            status="STREAMING",
                            completion=msg,
                        )
                    ).encode("utf-8")
                    gatewayapi.post_to_connection(
                        ConnectionId=connection_id, Data=data_to_send
                    )
                else:
                    last_data_to_send = json.dumps(
                        dict(completion="", stop_reason=is_stop)
                    ).encode("utf-8")

                    concatenated = "".join(completions)
                    # Used chunks for RAG generation
                    if bot and bot.display_retrieved_chunks:
                        used_chunks = [
                            ChunkModel(content=r.content, source=r.source, rank=r.rank)
                            for r in filter_used_results(concatenated, search_results)
                        ]
                    assistant_msg_id = str(ULID())
                    message = MessageModel(
                        role="assistant",
                        content=[
                            ContentModel(
                                content_type="text", body=concatenated, media_type=None
                            )
                        ],
                        model=chat_input.message.model,
                        children=[],
                        parent=user_msg_id,
                        create_time=get_current_time(),
                        feedback=None,
                        used_chunks=used_chunks,
                    )
                    conversation.message_map[assistant_msg_id] = message
                    # Append children to parent
                    conversation.message_map[user_msg_id].children.append(
                        assistant_msg_id
                    )
                    conversation.last_message_id = assistant_msg_id

                    # Update total pricing
                    metrics = msg_chunk["amazon-bedrock-invocationMetrics"]
                    input_token_count = metrics.get("inputTokenCount")
                    output_token_count = metrics.get("outputTokenCount")

                    logger.debug(
                        f"Input token count: {input_token_count}, output token count: {output_token_count}"
                    )

                    price = calculate_price(
                        chat_input.message.model, input_token_count, output_token_count
                    )
                    conversation.total_price += price

                    store_conversation(user_id, conversation)

    # Send last completion after saving conversation
    try:
        logger.debug(f"Sending last completion: {last_data_to_send.decode('utf-8')}")
        gatewayapi.post_to_connection(
            ConnectionId=connection_id, Data=last_data_to_send
        )
    except Exception as e:
        logger.error(f"Failed to post message: {str(e)}")
        return {
            "statusCode": 500,
            "body": "Failed to send message to connection.",
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
