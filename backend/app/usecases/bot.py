import os

from app.repositories.apigateway import (
    create_api_key,
    delete_api_key,
    find_api_key_by_id,
    find_usage_plan_by_id,
)
from app.repositories.cloudformation import delete_stack_by_bot_id, find_stack_by_bot_id
from app.repositories.common import RecordNotFoundError, compose_bot_id
from app.repositories.custom_bot import (
    delete_alias_by_id,
    delete_bot_by_id,
    delete_bot_publication,
    find_alias_by_id,
    find_private_bot_by_id,
    find_public_bot_by_id,
    store_bot,
    update_alias_last_used_time,
    update_alias_pin_status,
    update_bot,
    update_bot_last_used_time,
    update_bot_pin_status,
    update_bot_publication,
)
from app.repositories.model import BotModel, KnowledgeModel
from app.route_schema import (
    ApiKeyOutput,
    BotInput,
    BotModifyInput,
    BotModifyOutput,
    BotOutput,
    BotPublishInput,
    BotPublishOutput,
    BotSummaryOutput,
    Knowledge,
    PublishedApiQuota,
    PublishedApiThrottle,
)
from app.utils import (
    check_if_file_exists_in_s3,
    compose_upload_document_s3_path,
    compose_upload_temp_s3_path,
    compose_upload_temp_s3_prefix,
    delete_file_from_s3,
    delete_files_with_prefix_from_s3,
    generate_presigned_url,
    get_current_time,
    move_file_in_s3,
    start_codebuild_project,
)

DOCUMENT_BUCKET = os.environ.get("DOCUMENT_BUCKET", "bedrock-documents")


def _update_s3_documents_by_diff(
    user_id: str,
    bot_id: str,
    added_filenames: list[str],
    deleted_filenames: list[str],
):
    for filename in added_filenames:
        tmp_path = compose_upload_temp_s3_path(user_id, bot_id, filename)
        document_path = compose_upload_document_s3_path(user_id, bot_id, filename)
        move_file_in_s3(DOCUMENT_BUCKET, tmp_path, document_path)

    for filename in deleted_filenames:
        document_path = compose_upload_document_s3_path(user_id, bot_id, filename)
        delete_file_from_s3(DOCUMENT_BUCKET, document_path)


def create_new_bot(user_id: str, bot_input: BotInput) -> BotOutput:
    """Create a new bot.
    Bot is created as private and not pinned.
    """
    current_time = get_current_time()
    has_knowledge = bot_input.knowledge and (
        len(bot_input.knowledge.source_urls) > 0
        or len(bot_input.knowledge.sitemap_urls) > 0
        or len(bot_input.knowledge.filenames) > 0
    )
    sync_status = "QUEUED" if has_knowledge else "SUCCEEDED"

    source_urls = []
    sitemap_urls = []
    filenames = []
    if bot_input.knowledge:
        source_urls = bot_input.knowledge.source_urls
        sitemap_urls = bot_input.knowledge.sitemap_urls

        # Commit changes to S3
        _update_s3_documents_by_diff(
            user_id, bot_input.id, bot_input.knowledge.filenames, []
        )
        # Delete files from upload temp directory
        delete_files_with_prefix_from_s3(
            DOCUMENT_BUCKET, compose_upload_temp_s3_prefix(user_id, bot_input.id)
        )
        filenames = bot_input.knowledge.filenames

    store_bot(
        user_id,
        BotModel(
            id=bot_input.id,
            title=bot_input.title,
            description=bot_input.description if bot_input.description else "",
            instruction=bot_input.instruction,
            create_time=current_time,
            last_used_time=current_time,
            public_bot_id=None,
            is_pinned=False,
            knowledge=KnowledgeModel(
                source_urls=source_urls, sitemap_urls=sitemap_urls, filenames=filenames
            ),
            sync_status=sync_status,
            sync_status_reason="",
            sync_last_exec_id="",
            published_api_stack_name=None,
            published_api_datetime=None,
        ),
    )
    return BotOutput(
        id=bot_input.id,
        title=bot_input.title,
        instruction=bot_input.instruction,
        description=bot_input.description if bot_input.description else "",
        create_time=current_time,
        last_used_time=current_time,
        is_public=False,
        is_pinned=False,
        owned=True,
        knowledge=Knowledge(
            source_urls=source_urls, sitemap_urls=sitemap_urls, filenames=filenames
        ),
        sync_status=sync_status,
        sync_status_reason="",
        sync_last_exec_id="",
    )


def modify_owned_bot(
    user_id: str, bot_id: str, modify_input: BotModifyInput
) -> BotModifyOutput:
    """Modify owned bot."""
    source_urls = []
    sitemap_urls = []
    filenames = []

    if modify_input.knowledge:
        source_urls = modify_input.knowledge.source_urls
        sitemap_urls = modify_input.knowledge.sitemap_urls

        # Commit changes to S3
        _update_s3_documents_by_diff(
            user_id,
            bot_id,
            modify_input.knowledge.added_filenames,
            modify_input.knowledge.deleted_filenames,
        )
        # Delete files from upload temp directory
        delete_files_with_prefix_from_s3(
            DOCUMENT_BUCKET, compose_upload_temp_s3_prefix(user_id, bot_id)
        )

        filenames = (
            modify_input.knowledge.added_filenames
            + modify_input.knowledge.unchanged_filenames
        )

    update_bot(
        user_id,
        bot_id,
        title=modify_input.title,
        instruction=modify_input.instruction,
        description=modify_input.description if modify_input.description else "",
        knowledge=KnowledgeModel(
            source_urls=source_urls,
            sitemap_urls=sitemap_urls,
            filenames=filenames,
        ),
        sync_status="QUEUED",
        sync_status_reason="",
    )
    return BotModifyOutput(
        id=bot_id,
        title=modify_input.title,
        instruction=modify_input.instruction,
        description=modify_input.description if modify_input.description else "",
        knowledge=Knowledge(
            source_urls=source_urls,
            sitemap_urls=sitemap_urls,
            filenames=filenames,
        ),
    )


def fetch_bot(user_id: str, bot_id: str) -> tuple[bool, BotModel]:
    """Fetch bot by id.
    The first element of the returned tuple is whether the bot is owned or not.
    `True` means the bot is owned by the user.
    `False` means the bot is shared by another user.
    """
    try:
        return True, find_private_bot_by_id(user_id, bot_id)
    except RecordNotFoundError:
        pass  #

    try:
        return False, find_public_bot_by_id(bot_id)
    except RecordNotFoundError:
        raise RecordNotFoundError(
            f"Bot with ID {bot_id} not found in both private (for user {user_id}) and public items."
        )


def fetch_bot_summary(user_id: str, bot_id: str) -> BotSummaryOutput:
    try:
        bot = find_private_bot_by_id(user_id, bot_id)
        return BotSummaryOutput(
            id=bot_id,
            title=bot.title,
            description=bot.description,
            create_time=bot.create_time,
            last_used_time=bot.last_used_time,
            is_pinned=bot.is_pinned,
            is_public=True if bot.public_bot_id else False,
            owned=True,
            sync_status=bot.sync_status,
            has_knowledge=(
                len(bot.knowledge.source_urls) > 0
                or len(bot.knowledge.sitemap_urls) > 0
                or len(bot.knowledge.filenames) > 0
            ),
        )

    except RecordNotFoundError:
        pass

    try:
        alias = find_alias_by_id(user_id, bot_id)
        return BotSummaryOutput(
            id=alias.id,
            title=alias.title,
            description=alias.description,
            create_time=alias.create_time,
            last_used_time=alias.last_used_time,
            is_pinned=alias.is_pinned,
            is_public=True,
            owned=False,
            sync_status=alias.sync_status,
            has_knowledge=alias.has_knowledge,
        )
    except RecordNotFoundError:
        pass

    try:
        # NOTE: At the first time using shared bot, alias is not created yet.
        bot = find_public_bot_by_id(bot_id)
        return BotSummaryOutput(
            id=bot_id,
            title=bot.title,
            description=bot.description,
            create_time=bot.create_time,
            last_used_time=bot.last_used_time,
            is_pinned=False,  # NOTE: Shared bot is not pinned by default.
            is_public=True,
            owned=False,
            sync_status=bot.sync_status,
            has_knowledge=(
                len(bot.knowledge.source_urls) > 0
                or len(bot.knowledge.sitemap_urls) > 0
                or len(bot.knowledge.filenames) > 0
            ),
        )
    except RecordNotFoundError:
        raise RecordNotFoundError(
            f"Bot with ID {bot_id} not found in both private (for user {user_id}) and alias, shared items."
        )


def modify_pin_status(user_id: str, bot_id: str, pinned: bool):
    """Modify bot pin status."""
    try:
        return update_bot_pin_status(user_id, bot_id, pinned)
    except RecordNotFoundError:
        pass

    try:
        return update_alias_pin_status(user_id, bot_id, pinned)
    except RecordNotFoundError:
        raise RecordNotFoundError(f"Bot {bot_id} is neither owned nor alias.")


def remove_bot_by_id(user_id: str, bot_id: str):
    """Remove bot by id."""
    try:
        return delete_bot_by_id(user_id, bot_id)
    except RecordNotFoundError:
        pass

    try:
        return delete_alias_by_id(user_id, bot_id)
    except RecordNotFoundError:
        raise RecordNotFoundError(f"Bot {bot_id} is neither owned nor alias.")


def modify_bot_last_used_time(user_id: str, bot_id: str):
    """Modify bot last used time."""
    try:
        return update_bot_last_used_time(user_id, bot_id)
    except RecordNotFoundError:
        pass

    try:
        return update_alias_last_used_time(user_id, bot_id)
    except RecordNotFoundError:
        raise RecordNotFoundError(f"Bot {bot_id} is neither owned nor alias.")


def issue_presigned_url(
    user_id: str, bot_id: str, filename: str, content_type: str
) -> str:
    response = generate_presigned_url(
        DOCUMENT_BUCKET,
        compose_upload_temp_s3_path(user_id, bot_id, filename),
        content_type=content_type,
        expiration=3600,
    )
    return response


def remove_uploaded_file(user_id: str, bot_id: str, filename: str):
    delete_file_from_s3(
        DOCUMENT_BUCKET, compose_upload_temp_s3_path(user_id, bot_id, filename)
    )
    return


def create_bot_publication(
    user_id: str, bot_id: str, bot_publish_input: BotPublishInput
):
    """Publish an API for the bot."""
    # Check existence and permission of the bot
    try:
        bot = find_private_bot_by_id(user_id, bot_id)
    except RecordNotFoundError:
        raise RecordNotFoundError(f"Bot {bot_id} is not owned by user {user_id}.")

    # Same value as `bot_id` is used for `public_bot_id`
    published_api_id = bot_id

    # Create `ApiPublishmentStack` by CodeBuild
    try:
        response = start_codebuild_project(
            environment_variables={
                "PUBLISHED_API_THROTTLE_RATE_LIMIT": bot_publish_input.throttle.rate_limit,
                "PUBLISHED_API_THROTTLE_BURST_LIMIT": bot_publish_input.throttle.burst_limit,
                "PUBLISHED_API_QUOTA_LIMIT": bot_publish_input.quota.limit,
                "PUBLISHED_API_QUOTA_PERIOD": bot_publish_input.quota.period,
                "PUBLISHED_API_DEPLOYMENT_STAGE": bot_publish_input.stage,
                "PUBLISHED_API_ID": published_api_id,
                "PUBLISHED_API_ALLOWED_ORIGINS": str(bot_publish_input.allowed_origins),
            }
        )
    except Exception as e:
        raise e

    # Update bot attribute
    update_bot_publication(user_id, bot_id, published_api_id=published_api_id)
    return


def fetch_bot_publication(user_id: str, bot_id: str) -> BotPublishOutput:
    """Get published bot by id."""
    # Check existence and permission of the bot
    try:
        _ = find_private_bot_by_id(user_id, bot_id)
    except RecordNotFoundError:
        raise RecordNotFoundError(f"Bot {bot_id} is not owned by user {user_id}.")

    stack = find_stack_by_bot_id(bot_id)
    usage_plan = find_usage_plan_by_id(stack.api_usage_plan_id)
    return BotPublishOutput(
        stage=stack.api_stage,
        quota=PublishedApiQuota(
            limit=usage_plan.quota.limit,
            offset=usage_plan.quota.offset,
            period=usage_plan.quota.period,
        ),
        throttle=PublishedApiThrottle(
            rate_limit=usage_plan.throttle.rate_limit,
            burst_limit=usage_plan.throttle.burst_limit,
        ),
        allowed_origins=stack.api_allowed_origins,
        status=stack.stack_status,
        endpoint=f"https://{stack.api_id}.execute-api.ap-northeast-1.amazonaws.com/{stack.api_stage}",
        api_key_ids=usage_plan.key_ids,
    )


def remove_bot_publication(user_id: str, bot_id: str):
    """Remove published bot by id."""
    # Check existence of the bot
    try:
        bot = find_private_bot_by_id(user_id, bot_id)
    except RecordNotFoundError:
        raise RecordNotFoundError(f"Bot {bot_id} is not published.")

    # TODO: cascade deletion for api keys?
    # If so, use `usage_plan.key_ids` to delete api keys

    # Delete `ApiPublishmentStack` by CloudFormation
    delete_stack_by_bot_id(bot_id)

    # Delete bot attribute
    delete_bot_publication(user_id, bot_id)
    return


def fetch_api_key(user_id: str, bot_id: str, api_key: str) -> ApiKeyOutput:
    # Check existence and permission
    try:
        bot = find_private_bot_by_id(user_id, bot_id)
        stack = find_stack_by_bot_id(bot_id)
        usage_plan = find_usage_plan_by_id(stack.api_usage_plan_id)
    except RecordNotFoundError:
        raise RecordNotFoundError(f"Bot {bot_id} is not owned by user {user_id}.")

    if api_key not in usage_plan.key_ids:
        raise PermissionError(f"API Key {api_key} is not associated with bot {bot_id}.")

    # Fetch API Key
    key = find_api_key_by_id(api_key, include_value=True)
    return ApiKeyOutput(
        id=key.id, value=key.value, enabled=key.enabled, created_date=key.created_date
    )


def create_new_api_key(user_id: str, bot_id: str) -> ApiKeyOutput:
    # Check existence and permission
    try:
        bot = find_private_bot_by_id(user_id, bot_id)
        stack = find_stack_by_bot_id(bot_id)
        usage_plan = find_usage_plan_by_id(stack.api_usage_plan_id)
    except RecordNotFoundError:
        raise RecordNotFoundError(f"Bot {bot_id} is not owned by user {user_id}.")

    # Create API Key
    key = create_api_key(usage_plan.id)
    return ApiKeyOutput(
        id=key.id, value="", enabled=key.enabled, created_date=key.created_date
    )


def remove_api_key(user_id: str, bot_id: str, api_key_id: str):
    # Check existence and permission
    try:
        bot = find_private_bot_by_id(user_id, bot_id)
        stack = find_stack_by_bot_id(bot_id)
        usage_plan = find_usage_plan_by_id(stack.api_usage_plan_id)
    except RecordNotFoundError:
        raise RecordNotFoundError(f"Bot {bot_id} is not owned by user {user_id}.")

    if api_key_id not in usage_plan.key_ids:
        raise PermissionError(
            f"API Key {api_key_id} is not associated with bot {bot_id}."
        )

    # Delete API Key
    delete_api_key(api_key_id)
    return
