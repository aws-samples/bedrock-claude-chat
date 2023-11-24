from typing import Literal, Union

from app.repositories.conversation import (
    change_conversation_title,
    delete_conversation_by_id,
    delete_conversation_by_user_id,
    find_conversation_by_id,
    find_conversation_by_user_id,
)
from app.repositories.custom_bot import (
    delete_alias_by_id,
    delete_bot_by_id,
    find_all_bots_by_user_id,
    find_private_bot_by_id,
    find_private_bots_by_user_id,
    store_bot,
    update_bot_visibility,
)
from app.repositories.model import BotModel
from app.route_schema import (
    BotInput,
    BotMetaOutput,
    BotModifyInput,
    BotOutput,
    BotSwitchVisibilityInput,
    ChatInput,
    ChatOutput,
    Content,
    Conversation,
    ConversationMetaOutput,
    MessageOutput,
    NewTitleInput,
    ProposedTitle,
    User,
)
from app.usecases.bot import (
    create_new_bot,
    fetch_bot,
    modify_owned_bot,
    modify_pin_status,
    remove_bot_by_id,
)
from app.usecases.chat import chat, propose_conversation_title
from app.utils import get_current_time
from fastapi import APIRouter, Request

router = APIRouter()


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

    conversation = find_conversation_by_id(current_user.id, conversation_id)
    output = Conversation(
        id=conversation_id,
        title=conversation.title,
        create_time=conversation.create_time,
        last_message_id=conversation.last_message_id,
        message_map={
            message_id: MessageOutput(
                role=message.role,
                content=Content(
                    content_type=message.content.content_type,
                    body=message.content.body,
                ),
                model=message.model,
                children=message.children,
                parent=message.parent,
            )
            for message_id, message in conversation.message_map.items()
        },
        bot_id=conversation.bot_id,
    )
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


@router.post("/bot", response_model=BotOutput)
def post_bot(request: Request, bot_input: BotInput):
    """Create new private owned bot."""
    current_user: User = request.state.current_user

    return create_new_bot(current_user.id, bot_input)


@router.patch("/bot/{bot_id}")
def patch_bot(request: Request, bot_id: str, modify_input: BotModifyInput):
    """Modify owned bot title, instruction and description."""
    return modify_owned_bot(request.state.current_user.id, bot_id, modify_input)


@router.patch("/bot/{bot_id}/pinned")
def patch_bot_pin_status(request: Request, bot_id: str, pinned: bool):
    """Modify owned bot pin status."""
    return modify_pin_status(request.state.current_user.id, bot_id, pinned)


@router.patch("/bot/{bot_id}")
def patch_bot_visibility(
    request: Request, bot_id: str, visibility_input: BotSwitchVisibilityInput
):
    """Switch bot visibility"""
    current_user: User = request.state.current_user
    update_bot_visibility(current_user.id, bot_id, visibility_input.to_public)


@router.get("/bot", response_model=list[BotMetaOutput])
def get_all_bots(
    request: Request,
    kind: Literal["private", "mixed"] = "private",
    pinned: bool = False,
    limit: int | None = None,
):
    """Get all bots. The order is descending by `last_used_time`.
    - If `kind` is `private`, only private bots will be returned.
        - If `mixed` must give either `pinned` or `limit`.
    - If `pinned` is True, only pinned bots will be returned.
        - When kind is `private`, this will be ignored.
    - If `limit` is specified, only the first n bots will be returned.
        - Cannot specify both `pinned` and `limit`.
    """
    current_user: User = request.state.current_user

    bots = []
    if kind == "private":
        bots = find_private_bots_by_user_id(current_user.id, limit=limit)
    elif kind == "mixed":
        bots = find_all_bots_by_user_id(
            current_user.id, limit=limit, only_pinned=pinned
        )
    else:
        raise ValueError(f"Invalid kind: {kind}")

    output = [
        BotMetaOutput(
            id=bot.id,
            title=bot.title,
            create_time=bot.create_time,
            last_used_time=bot.last_used_time,
            is_pinned=bot.is_pinned,
            owned=True,
            available=True,
        )
        for bot in bots
    ]
    return output


@router.get("/bot/{bot_id}", response_model=BotOutput)
def get_bot(request: Request, bot_id: str):
    """Get bot by id. This returns both owned private and shared public bots."""
    current_user: User = request.state.current_user

    is_public, bot = fetch_bot(current_user.id, bot_id)
    owned = not is_public
    output = BotOutput(
        id=bot.id,
        title=bot.title,
        instruction=bot.instruction,
        description=bot.description,
        create_time=bot.create_time,
        last_used_time=bot.last_used_time,
        is_public=bot.public_bot_id is not None,
        is_pinned=bot.is_pinned,
        owned=owned,
    )
    return output


@router.delete("/bot/{bot_id}")
def delete_bot(request: Request, bot_id: str):
    """Delete bot by id"""
    current_user: User = request.state.current_user
    remove_bot_by_id(current_user.id, bot_id)
