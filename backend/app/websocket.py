import json
import logging
import os
from datetime import datetime
from decimal import Decimal as decimal

import boto3
from anthropic.types import ContentBlockDeltaEvent, MessageDeltaEvent, MessageStopEvent
from app.auth import verify_token
from app.bedrock import compose_args_for_anthropic_client, get_model_id
from app.config import GENERATION_CONFIG, SEARCH_CONFIG
from app.repositories.conversation import RecordNotFoundError, store_conversation
from app.repositories.model import ContentModel, MessageModel
from app.route_schema import ChatInputWithToken
from app.usecases.bot import modify_bot_last_used_time
from app.usecases.chat import insert_knowledge, prepare_conversation, trace_to_root
from app.utils import get_anthropic_client, get_current_time
from app.vector_search import SearchResult, search_related_docs
from boto3.dynamodb.conditions import Key
from botocore.exceptions import ClientError
from ulid import ULID

WEBSOCKET_SESSION_TABLE_NAME = os.environ["WEBSOCKET_SESSION_TABLE_NAME"]


client = get_anthropic_client()
dynamodb_client = boto3.resource("dynamodb")
table = dynamodb_client.Table(WEBSOCKET_SESSION_TABLE_NAME)

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)


def get_rag_query(conversation, user_msg_id, chat_input):
    """Get query for RAG model."""
    query = ""

    model_id = chat_input.message.model

    messages = trace_to_root(
        node_id=chat_input.message.parent_message_id,
        message_map=conversation.message_map,
    )

    formatted_conversation = ""
    for message in messages:
        if message.role == "user":
            formatted_conversation += f"User: {message.content[-1].body}\n\n"
        if message.role == "assistant":
            formatted_conversation += f"Assistant: {message.content[-1].body}\n\n"
    formatted_conversation += f"User: {chat_input.message.content[-1].body}\n\n"

    # Ask the model what product are we taling about
    no_product_response = "<NO_PRODUCT>"
    template = """
        Based on the following conversation:
        {}

        What is the relevant information to give to the search engine?
        """.format(formatted_conversation)

    print(f"Formatted conversation: {formatted_conversation}")
    print(f"Model id: {model_id}")
    print(f"Template: {template}")

    # Invoke Bedrock
    args = compose_args_for_anthropic_client(
        [
            MessageModel(
                role="user",
                content=[ContentModel(content_type="text", body=template, media_type=None)],
                model=model_id,
                children=[],
                parent=None,
                create_time=get_current_time(),
            ),
        ],
        model_id,
        instruction= """
        You are extracting relevant information from the conversation to give to the search engine.
        If there are multiple products, provide the name of the product that is mentioned last.
        If there is no specific product, give as much details about what the user is looking for.

        Format answer as: "<product_name>" or "<product_details>".

        <examples>
            <example>
                <input>
                    User: Id like to buy in iphone.
                    Assistant: Sure, which model are you interested in?
                    User: I am interested in iPhone 13.
                </input>
                <output>
                    "iPhone 13"
                </output>
            </example>
            <example>
                <input>
                    User: I am interested in a tshirt.
                    Assistant: Okay, I'd be happy to help you find a t-shirt! To narrow down the options, could you provide some more details? What style of t-shirt are you looking for - casual, athletic, graphic print? Do you have a preferred fit like slim, relaxed, or loose? And what size would you need? Any particular colors or designs you're interested in? The more specifics you can give me, the better I can suggest some relevant options from the available products
                    User: casual, black, vneck, slim, L.
                </input>
                <output>
                    "Black casual vneck large tshirt"
                </output>
            </example>
            <example>
                <input>
                    User: I am interested in a tshirt.
                    Assistant: Sure, which color are you interested in?
                    User: black.
                    Assistant: Here are 3 options
                    1. Adidas black tshirt XL
                    2. Nike black tshirt L
                    3. Puma black tshirt M
                    User: I am interested in the first one.
                </input>
                <output>
                    "Adidas black tshirt XL"
                </output>
        </examples>
        """.format(no_product_response),
        stream=False,
    )
    print(f"Invoking bedrock with args: {args}")
    try:
        # Invoke bedrock api
        response = client.messages.create(**args)
        print(f"Response from bedrock: {response}")
        if (
            response.content[0].type == "text" and
            no_product_response in response.content[0].text
        ):
            # Use the last user message as the query
            query = conversation.message_map[user_msg_id].content[-1].body
        else:
            # Use the product name returned by the LLM
            query = response.content[0].text
        return query
    except Exception as e:
        print(f"Failed to invoke bedrock: {e}")
        # Use the last user message as the query
        return (
            conversation
            .message_map[user_msg_id]
            .content[-1]
            .body.strip('>').strip('<')
        )


def process_chat_input(
    chat_input: ChatInputWithToken, gatewayapi, connection_id: str
) -> dict:
    """Process chat input and send the message to the client."""
    logger.info(f"Received chat input: {chat_input}")

    try:
        # Verify JWT token
        decoded = verify_token(chat_input.token)
    except Exception as e:
        print(f"Invalid token: {e}")
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
    if (
        bot
        and len(bot.knowledge.source_urls)
        + len(bot.knowledge.sitemap_urls)
        + len(bot.knowledge.filenames)
        > 0
    ):
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
        # query = conversation.message_map[user_msg_id].content[-1].body
        query = get_rag_query(
            conversation,
            user_msg_id,
            chat_input
        )
        print(f"Query for RAG model: {query}")
        results = search_related_docs(
            bot_id=bot.id, limit=SEARCH_CONFIG["max_results"], query=query
        )
        logger.info(f"Search results from vector store: {results}")

        # Insert contexts to instruction
        conversation_with_context = insert_knowledge(conversation, results)
        message_map = conversation_with_context.message_map

    messages = trace_to_root(
        node_id=chat_input.message.parent_message_id,
        message_map=message_map,
    )
    messages.append(chat_input.message)  # type: ignore

    # Invoke Bedrock
    args = compose_args_for_anthropic_client(
        messages,
        chat_input.message.model,
        instruction=(
            message_map["instruction"].content[0].body
            if "instruction" in message_map
            else None
        ),
        stream=True,
    )
    # logger.debug(f"Invoking bedrock with args: {args}")
    try:
        # Invoke bedrock streaming api
        response = client.messages.create(**args)
    except Exception as e:
        print(f"Failed to invoke bedrock: {e}")
        return {"statusCode": 500, "body": "Failed to invoke bedrock."}

    completions = []
    last_data_to_send = {}
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
                print(f"Failed to post message: {str(e)}")
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
            )
            conversation.message_map[assistant_msg_id] = message
            # Append children to parent
            conversation.message_map[user_msg_id].children.append(assistant_msg_id)
            conversation.last_message_id = assistant_msg_id

            store_conversation(user_id, conversation)

            # TODO: implement cost calculation
            metrics = event.model_dump()["amazon-bedrock-invocationMetrics"]
            input_token_count = metrics.get("inputTokenCount")
            output_token_count = metrics.get("outputTokenCount")
            logger.debug(f"Input token count: {input_token_count}")
            logger.debug(f"Output token count: {output_token_count}")
        else:
            continue

    # Send last completion after saving conversation
    try:
        logger.debug(f"Sending last completion: {last_data_to_send}")
        gatewayapi.post_to_connection(
            ConnectionId=connection_id, Data=last_data_to_send
        )
    except Exception as e:
        print(f"Failed to post message: {str(e)}")
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
    print(f"Received event: {event}")
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
    expire = int(now.timestamp()) + (2 * 60 * 60)  # 2 hours from now
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
            response = table.query(
                KeyConditionExpression=Key("ConnectionId").eq(connection_id)
            )
            message_parts = response["Items"]
            logger.debug(f"Message parts: {message_parts}")
            full_message = "".join(item["MessagePart"] for item in message_parts)
            logger.debug(f"Full message: {full_message}")

            response = table.query(
                KeyConditionExpression=Key("ConnectionId").eq(connection_id)
            )
            for item in response["Items"]:
                table.delete_item(
                    Key={
                        "ConnectionId": item["ConnectionId"],
                        "MessagePartId": item["MessagePartId"],
                    }
                )

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
        gatewayapi.post_to_connection(
            ConnectionId=connection_id,
            Data=json.dumps({"status": "ERROR", "reason": str(e)}).encode("utf-8"),
        )
        return {"statusCode": 500, "body": str(e)}
