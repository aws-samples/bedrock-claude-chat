import json
import logging
from datetime import datetime

import boto3
from app.auth import verify_token
from app.config import SEARCH_CONFIG
from app.repositories.conversation import RecordNotFoundError, store_conversation
from app.repositories.model import ContentModel, MessageModel
from app.route_schema import ChatInputWithToken
from app.usecases.bot import modify_bot_last_used_time
from app.usecases.chat import get_invoke_payload, insert_knowledge, prepare_conversation
from app.utils import get_bedrock_client, get_current_time
from app.vector_search import SearchResult, search_related_docs
from ulid import ULID

client = get_bedrock_client()

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)


def generate_chunk(stream) -> bytes:
    if stream:
        for event in stream:
            chunk = event.get("chunk")
            if chunk:
                chunk_bytes = chunk.get("bytes")
                yield chunk_bytes


def handler(event, context):
    print(f"Received event: {event}")
    # Extracting the SNS message and its details
    # NOTE: All notification messages will contain a single published message.
    # See `Reliability` section of: https://aws.amazon.com/sns/faqs/
    sns_message = event["Records"][0]["Sns"]["Message"]
    message_content = json.loads(sns_message)

    route_key = message_content["requestContext"]["routeKey"]

    connection_id = message_content["requestContext"]["connectionId"]
    domain_name = message_content["requestContext"]["domainName"]
    stage = message_content["requestContext"]["stage"]
    message = message_content["body"]
    endpoint_url = f"https://{domain_name}/{stage}"
    gatewayapi = boto3.client("apigatewaymanagementapi", endpoint_url=endpoint_url)

    chat_input = ChatInputWithToken(**json.loads(message))
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
                ConnectionId=connection_id, Data="Bot not found.".encode("utf-8")
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
        query = conversation.message_map[user_msg_id].content.body
        results = search_related_docs(
            bot_id=bot.id, limit=SEARCH_CONFIG["max_results"], query=query
        )
        logger.info(f"Search results from vector store: {results}")

        # Insert contexts to instruction
        conversation_with_context = insert_knowledge(conversation, results)
        message_map = conversation_with_context.message_map

    payload = get_invoke_payload(message_map, chat_input)

    try:
        # Invoke bedrock streaming api
        response = client.invoke_model_with_response_stream(
            body=payload["body"],
            modelId=payload["model_id"],
            accept=payload["accept"],
            contentType=payload["content_type"],
        )
    except Exception as e:
        print(f"Failed to invoke bedrock: {e}")
        return {"statusCode": 500, "body": "Failed to invoke bedrock."}

    stream = response.get("body")
    completions = []
    for chunk in generate_chunk(stream):
        chunk_data = json.loads(chunk.decode("utf-8"))
        completions.append(chunk_data["completion"])
        if "stop_reason" in chunk_data and chunk_data["stop_reason"] is not None:
            # Persist conversation before finish streaming so that front-end can avoid 404 issue
            concatenated = "".join(completions)
            # Append entire completion as the last message
            assistant_msg_id = str(ULID())
            message = MessageModel(
                role="assistant",
                content=ContentModel(content_type="text", body=concatenated),
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
        try:
            # Send completion
            gatewayapi.post_to_connection(ConnectionId=connection_id, Data=chunk)
        except Exception as e:
            print(f"Failed to post message: {str(e)}")
            return {"statusCode": 500, "body": "Failed to send message to connection."}

    # Update bot last used time
    if chat_input.bot_id:
        logger.info("Bot id is provided. Updating bot last used time.")
        modify_bot_last_used_time(user_id, chat_input.bot_id)

    return {"statusCode": 200, "body": json.dumps({"conversationId": conversation.id})}
