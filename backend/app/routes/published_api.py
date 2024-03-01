from app.repositories.apigateway import find_api_key_by_id
from app.routes.schemas.conversation import ChatInput, ChatOutput, Conversation
from app.routes.schemas.published_api import ChatInputWithoutBotId
from app.usecases.chat import chat, fetch_conversation, propose_conversation_title
from app.user import User
from fastapi import APIRouter, Request

router = APIRouter(tags=["published_api"])


@router.get("/health")
def health():
    """For health check"""
    return {"status": "ok"}


@router.post("/conversation", response_model=ChatOutput)
def post_message(request: Request, chat_input: ChatInputWithoutBotId):
    """Send chat message"""
    current_user: User = request.state.current_user

    chat_input_dict = chat_input.model_dump()
    # Note that user id is equal to bot id
    chat_input_dict["bot_id"] = current_user.id

    output = chat(user_id=current_user.id, chat_input=ChatInput(**chat_input_dict))
    return output


@router.get("/conversation/{conversation_id}", response_model=Conversation)
def get_conversation(request: Request, conversation_id: str):
    """Get a conversation history"""
    current_user: User = request.state.current_user

    output = fetch_conversation(current_user.id, conversation_id)
    return output
