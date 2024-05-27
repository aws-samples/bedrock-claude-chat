from typing import Literal

from app.repositories.custom_bot import (
    find_private_bot_by_id,
    find_private_bots_by_user_id,
    update_bot_visibility,
)
from app.routes.schemas.bot import (
    BotInput,
    BotMetaOutput,
    BotModifyInput,
    BotOutput,
    BotPinnedInput,
    BotPresignedUrlOutput,
    BotSummaryOutput,
    BotSwitchVisibilityInput,
    EmbeddingParams,
    Knowledge,
    GenerationParams,
    SearchParams,
)
from app.usecases.bot import (
    create_new_bot,
    fetch_all_bots_by_user_id,
    fetch_bot_summary,
    issue_presigned_url,
    modify_owned_bot,
    modify_pin_status,
    remove_bot_by_id,
    remove_uploaded_file,
)
from app.user import User
from fastapi import APIRouter, Request

router = APIRouter(tags=["bot"])


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
def patch_bot_pin_status(request: Request, bot_id: str, pinned_input: BotPinnedInput):
    """Modify owned bot pin status."""
    current_user: User = request.state.current_user
    return modify_pin_status(current_user.id, bot_id, pinned=pinned_input.pinned)


@router.patch("/bot/{bot_id}/visibility")
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
        bots = fetch_all_bots_by_user_id(
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
            owned=bot.owned,
            available=bot.available,
            description=bot.description,
            is_public=bot.is_public,
            sync_status=bot.sync_status,
        )
        for bot in bots
    ]
    return output


@router.get("/bot/private/{bot_id}", response_model=BotOutput)
def get_private_bot(request: Request, bot_id: str):
    """Get private bot by id."""
    current_user: User = request.state.current_user

    bot = find_private_bot_by_id(current_user.id, bot_id)
    output = BotOutput(
        id=bot.id,
        title=bot.title,
        instruction=bot.instruction,
        description=bot.description,
        create_time=bot.create_time,
        last_used_time=bot.last_used_time,
        is_public=True if bot.public_bot_id else False,
        is_pinned=bot.is_pinned,
        owned=True,
        embedding_params=EmbeddingParams(
            chunk_size=bot.embedding_params.chunk_size,
            chunk_overlap=bot.embedding_params.chunk_overlap,
            enable_partition_pdf=bot.embedding_params.enable_partition_pdf,
        ),
        knowledge=Knowledge(
            source_urls=bot.knowledge.source_urls,
            sitemap_urls=bot.knowledge.sitemap_urls,
            filenames=bot.knowledge.filenames,
        ),
        generation_params=GenerationParams(
            max_tokens=bot.generation_params.max_tokens,
            top_k=bot.generation_params.top_k,
            top_p=bot.generation_params.top_p,
            temperature=bot.generation_params.temperature,
            stop_sequences=bot.generation_params.stop_sequences,
        ),
        search_params=SearchParams(
            max_results=bot.search_params.max_results,
        ),
        sync_status=bot.sync_status,
        sync_status_reason=bot.sync_status_reason,
        sync_last_exec_id=bot.sync_last_exec_id,
        display_retrieved_chunks=bot.display_retrieved_chunks,
    )
    return output


@router.get("/bot/summary/{bot_id}", response_model=BotSummaryOutput)
def get_bot_summary(request: Request, bot_id: str):
    """Get bot summary by id."""
    current_user: User = request.state.current_user

    return fetch_bot_summary(current_user.id, bot_id)


@router.delete("/bot/{bot_id}")
def delete_bot(request: Request, bot_id: str):
    """Delete bot by id. This can be used for both owned and shared bots.
    If the bot is shared, just remove the alias.
    """
    current_user: User = request.state.current_user
    remove_bot_by_id(current_user.id, bot_id)


@router.get("/bot/{bot_id}/presigned-url", response_model=BotPresignedUrlOutput)
def get_bot_presigned_url(
    request: Request, bot_id: str, filename: str, contentType: str
):
    """Get presigned url for bot"""
    current_user: User = request.state.current_user
    url = issue_presigned_url(current_user.id, bot_id, filename, contentType)
    return BotPresignedUrlOutput(url=url)


@router.delete("/bot/{bot_id}/uploaded-file")
def delete_bot_uploaded_file(request: Request, bot_id: str, filename: str):
    """Delete uploaded file for bot"""
    current_user: User = request.state.current_user
    remove_uploaded_file(current_user.id, bot_id, filename)
