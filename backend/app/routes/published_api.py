from time import sleep

from app.repositories.apigateway import find_api_key_by_id
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
from fastapi import APIRouter, Request

router = APIRouter(tags=["published_api"])


@router.get("/health")
def health():
    """For health check"""
    return {"status": "ok"}


@router.post("/conversation", response_model=ChatOutputWithoutBotId)
def post_message(request: Request, chat_input: ChatInputWithoutBotId):
    """Send chat message"""
    current_user: User = request.state.current_user

    chat_input_dict = chat_input.model_dump()
    # Note that user id is equal to bot id
    chat_input_dict["bot_id"] = current_user.id

    output = chat(user_id=current_user.id, chat_input=ChatInput(**chat_input_dict))
    return ChatOutputWithoutBotId(
        conversation_id=output.conversation_id,
        message=output.message,
        create_time=output.create_time,
    )


@router.get("/conversation/{conversation_id}", response_model=Conversation)
def get_conversation(request: Request, conversation_id: str):
    """Get a conversation history"""
    current_user: User = request.state.current_user

    output = fetch_conversation(current_user.id, conversation_id)
    return output


@router.get(
    "/conversation/{conversation_id}/latest-bot-response",
    response_model=ChatOutputWithoutBotId,
)
def get_latest_response(request: Request, conversation_id: str):
    """Get the latest response of a conversation"""
    current_user: User = request.state.current_user

    conversation = fetch_conversation(current_user.id, conversation_id)
    last_message_id = conversation.last_message_id
    return ChatOutputWithoutBotId(
        conversation_id=conversation_id,
        message=conversation.message_map[last_message_id],
        create_time=conversation.create_time,
    )
