from typing import Literal, Union

from app.repositories.apigateway import find_api_key_by_id
from app.repositories.conversation import (
    change_conversation_title,
    delete_conversation_by_id,
    delete_conversation_by_user_id,
    find_conversation_by_id,
    find_conversation_by_user_id,
)
from app.repositories.custom_bot import (
    find_all_bots_by_user_id,
    find_private_bot_by_id,
    find_private_bots_by_user_id,
    update_bot_visibility,
)
from app.route_schema import (
    ApiKeyOutput,
    BotInput,
    BotMetaOutput,
    BotModifyInput,
    BotOutput,
    BotPinnedInput,
    BotPresignedUrlOutput,
    BotPublishInput,
    BotPublishOutput,
    BotSummaryOutput,
    BotSwitchVisibilityInput,
    ChatInput,
    ChatOutput,
    Content,
    Conversation,
    ConversationMetaOutput,
    Knowledge,
    MessageOutput,
    NewTitleInput,
    ProposedTitle,
)
from app.usecases.bot import (
    create_bot_publication,
    create_new_api_key,
    create_new_bot,
    fetch_api_key,
    fetch_bot_publication,
    fetch_bot_summary,
    issue_presigned_url,
    modify_owned_bot,
    modify_pin_status,
    remove_api_key,
    remove_bot_by_id,
    remove_bot_publication,
    remove_uploaded_file,
)
from app.usecases.chat import chat, fetch_conversation, propose_conversation_title
from app.user import User
from fastapi import APIRouter, Request

router = APIRouter(tags=["conversation"])


@router.get("/health")
def health():
    """For health check"""
    return {"status": "ok"}


@router.post("/conversation", response_model=ChatOutput)
def post_message(request: Request, chat_input: ChatInput):
    """Send chat message"""
    current_user: User = request.state.current_user

    output = chat(user_id=current_user.id, chat_input=chat_input)
    return output


@router.get("/conversation/{conversation_id}", response_model=Conversation)
def get_conversation(request: Request, conversation_id: str):
    """Get a conversation history"""
    current_user: User = request.state.current_user

    output = fetch_conversation(current_user.id, conversation_id)
    return output


@router.delete("/conversation/{conversation_id}")
def remove_conversation(request: Request, conversation_id: str):
    """Delete conversation"""
    current_user: User = request.state.current_user

    delete_conversation_by_id(current_user.id, conversation_id)


@router.get("/conversations", response_model=list[ConversationMetaOutput])
def get_all_conversations(
    request: Request,
):
    """Get all conversation metadata"""
    current_user: User = request.state.current_user

    conversations = find_conversation_by_user_id(current_user.id)
    output = [
        ConversationMetaOutput(
            id=conversation.id,
            title=conversation.title,
            create_time=conversation.create_time,
            model=conversation.model,
            bot_id=conversation.bot_id,
        )
        for conversation in conversations
    ]
    return output


@router.delete("/conversations")
def remove_all_conversations(
    request: Request,
):
    """Delete all conversations"""
    delete_conversation_by_user_id(request.state.current_user.id)


@router.patch("/conversation/{conversation_id}/title")
def patch_conversation_title(
    request: Request, conversation_id: str, new_title_input: NewTitleInput
):
    """Update conversation title"""
    current_user: User = request.state.current_user

    change_conversation_title(
        current_user.id, conversation_id, new_title_input.new_title
    )


@router.get(
    "/conversation/{conversation_id}/proposed-title", response_model=ProposedTitle
)
def get_proposed_title(request: Request, conversation_id: str):
    """Suggest conversation title"""
    current_user: User = request.state.current_user

    title = propose_conversation_title(current_user.id, conversation_id)
    return ProposedTitle(title=title)
