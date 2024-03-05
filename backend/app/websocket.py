import json
import logging
from datetime import datetime

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
from ulid import ULID

client = get_anthropic_client()

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)


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
        # NOTE: Currently embedding not support multi-modal. For now, use the last content.
        query = conversation.message_map[user_msg_id].content[-1].body
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
        messages, chat_input.message.model, stream=True
    )

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

    return {"statusCode": 200, "body": json.dumps({"conversationId": conversation.id})}
