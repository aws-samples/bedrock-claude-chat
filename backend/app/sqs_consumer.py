import json

from app.routes.schemas.conversation import (
    ChatInput,
    ChatOutput,
    Conversation,
    MessageOutput,
)
from app.routes.schemas.published_api import (
    ChatInputWithoutBotId,
    ChatOutputWithoutBotId,
)
from app.usecases.chat import chat, fetch_conversation
from app.user import User
from fastapi import APIRouter, HTTPException, Request


def handler(event, context):
    """SQS consumer.
    This is used for async invocation for published api.
    """
    for record in event["Records"]:
        message_body = json.loads(record["body"])
        chat_input = ChatInput(**message_body)
        user_id = f"PUBLISHED_API#{chat_input.bot_id}"

        chat_result = chat(user_id=user_id, chat_input=chat_input)
        print(chat_result)

    return {"statusCode": 200, "body": json.dumps("Processing completed")}
