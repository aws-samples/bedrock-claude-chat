from app.route_schema import (
    ApiKeyOutput,
    BotPublishInput,
    BotPublishOutput,
    PublicBotMetaOutput,
)
from app.usecases.bot import (
    create_bot_publication,
    create_new_api_key,
    fetch_api_key,
    fetch_bot_publication,
    remove_api_key,
    remove_bot_publication,
)
from app.usecases.chat import chat, fetch_conversation, propose_conversation_title
from app.user import User
from fastapi import APIRouter, Request

router = APIRouter(tags=["api_publication"])


@router.post("/bot/{bot_id}/publication")
def post_bot_publication(
    request: Request, bot_id: str, bot_publish_input: BotPublishInput
):
    """Publish a bot.
    This method is intended to be used by the bot owner.
    NOTE:
    - If the bot is not shared with the user, raise 400.
    - If the bot is already published, raise 400.
    - If the codebuild for cfn deploy in progress, raise 409.
    """
    current_user: User = request.state.current_user
    if not current_user.is_publish_allowed():
        raise PermissionError("User is not allowed to publish bot.")
    create_bot_publication(
        user_id=current_user.id, bot_id=bot_id, bot_publish_input=bot_publish_input
    )
    return


@router.get("/bot/{bot_id}/publication", response_model=BotPublishOutput)
def get_bot_publication(
    request: Request, bot_id: str, owner_user_id: str | None = None
):
    """Get bot publication
    This can be used by both owner and admin.
    NOTE:
    - If not published yet, returns 404.
    - If codebuild for cfn deploy is not succeeded, All value will be empty except for `codebuild_id` and `codebuild_status`.
    """
    current_user: User = request.state.current_user
    if not current_user.is_publish_allowed():
        raise PermissionError("User is not allowed to publish bot.")

    if current_user.is_admin():
        if owner_user_id is None:
            raise ValueError("owner_user_id must be specified for admin.")
        user_id = owner_user_id
    else:
        user_id = current_user.id

    publication = fetch_bot_publication(user_id, bot_id)
    return publication


@router.delete("/bot/{bot_id}/publication")
def delete_bot_publication(
    request: Request, bot_id: str, owner_user_id: str | None = None
):
    """Delete bot publication
    This can be used by both owner and admin.
    NOTE:
    - Can't delete if the bot is not published.
    - If codebuild not completed, raise 400. Before delete, please ensure `codebuild_status` is either `SUCCEEDED` or `FAILED`.
    """
    current_user: User = request.state.current_user
    if not current_user.is_publish_allowed():
        raise PermissionError("User is not allowed to publish bot.")

    if current_user.is_admin():
        if owner_user_id is None:
            raise ValueError("owner_user_id must be specified for admin.")
        user_id = owner_user_id
    else:
        user_id = current_user.id

    remove_bot_publication(user_id, bot_id)


@router.get(
    "/bot/{bot_id}/publication/api-key/{api_key_id}", response_model=ApiKeyOutput
)
def get_bot_publication_api_key(request: Request, bot_id: str, api_key_id: str):
    """Get bot publication API key. Only the owner can access the key."""
    current_user: User = request.state.current_user
    if not current_user.is_publish_allowed():
        raise PermissionError("User is not allowed to publish bot.")

    key = fetch_api_key(current_user.id, bot_id, api_key_id)
    return key


@router.post("/bot/{bot_id}/publication/api-key", response_model=ApiKeyOutput)
def post_bot_publication_api_key(request: Request, bot_id: str):
    """Create bot publication API key. Only the owner can create the key."""
    current_user: User = request.state.current_user
    if not current_user.is_publish_allowed():
        raise PermissionError("User is not allowed to publish bot.")
    created_key = create_new_api_key(current_user.id, bot_id)
    return created_key


@router.delete("/bot/{bot_id}/publication/api-key/{api_key_id}")
def delete_bot_publication_api_key(request: Request, bot_id: str, api_key_id: str):
    """Delete bot publication API key. Only the owner can delete the key."""
    current_user: User = request.state.current_user
    if not current_user.is_publish_allowed():
        raise PermissionError("User is not allowed to publish bot.")
    remove_api_key(current_user.id, bot_id, api_key_id)
