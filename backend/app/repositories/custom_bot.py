import asyncio
import base64
import json
import logging
import os
from datetime import datetime
from decimal import Decimal as decimal
from functools import partial

import boto3
from app.config import DEFAULT_GENERATION_CONFIG as DEFAULT_CLAUDE_GENERATION_CONFIG
from app.config import DEFAULT_MISTRAL_GENERATION_CONFIG, DEFAULT_SEARCH_CONFIG
from app.repositories.common import (
    RecordNotFoundError,
    _get_table_client,
    _get_table_public_client,
    compose_bot_alias_id,
    compose_bot_id,
    decompose_bot_alias_id,
    decompose_bot_id,
)
from app.repositories.models.custom_bot import (
    BotAliasModel,
    BotMeta,
    BotMetaWithStackInfo,
    BotModel,
    EmbeddingParamsModel,
    GenerationParamsModel,
    KnowledgeModel,
    SearchParamsModel,
)
from app.routes.schemas.bot import type_sync_status
from app.utils import get_current_time
from boto3.dynamodb.conditions import Attr, Key
from botocore.exceptions import ClientError

TABLE_NAME = os.environ.get("TABLE_NAME", "")
ENABLE_MISTRAL = os.environ.get("ENABLE_MISTRAL", "") == "true"

DEFAULT_GENERATION_CONFIG = (
    DEFAULT_MISTRAL_GENERATION_CONFIG
    if ENABLE_MISTRAL
    else DEFAULT_CLAUDE_GENERATION_CONFIG
)

logger = logging.getLogger(__name__)
sts_client = boto3.client("sts")


def store_bot(user_id: str, custom_bot: BotModel):
    table = _get_table_client(user_id)
    logger.info(f"Storing bot: {custom_bot}")

    item = {
        "PK": user_id,
        "SK": compose_bot_id(user_id, custom_bot.id),
        "Title": custom_bot.title,
        "Description": custom_bot.description,
        "Instruction": custom_bot.instruction,
        "CreateTime": decimal(custom_bot.create_time),
        "LastBotUsed": decimal(custom_bot.last_used_time),
        "IsPinned": custom_bot.is_pinned,
        "EmbeddingParams": custom_bot.embedding_params.model_dump(),
        "GenerationParams": custom_bot.generation_params.model_dump(),
        "SearchParams": custom_bot.search_params.model_dump(),
        "Knowledge": custom_bot.knowledge.model_dump(),
        "SyncStatus": custom_bot.sync_status,
        "SyncStatusReason": custom_bot.sync_status_reason,
        "LastExecId": custom_bot.sync_last_exec_id,
        "ApiPublishmentStackName": custom_bot.published_api_stack_name,
        "ApiPublishedDatetime": custom_bot.published_api_datetime,
        "ApiPublishCodeBuildId": custom_bot.published_api_codebuild_id,
        "DisplayRetrievedChunks": custom_bot.display_retrieved_chunks,
    }

    response = table.put_item(Item=item)
    return response


def update_bot(
    user_id: str,
    bot_id: str,
    title: str,
    description: str,
    instruction: str,
    embedding_params: EmbeddingParamsModel,
    generation_params: GenerationParamsModel,
    search_params: SearchParamsModel,
    knowledge: KnowledgeModel,
    sync_status: type_sync_status,
    sync_status_reason: str,
    display_retrieved_chunks: bool,
):
    """Update bot title, description, and instruction.
    NOTE: Use `update_bot_visibility` to update visibility.
    """
    table = _get_table_client(user_id)
    logger.info(f"Updating bot: {bot_id}")

    try:
        response = table.update_item(
            Key={"PK": user_id, "SK": compose_bot_id(user_id, bot_id)},
            UpdateExpression="SET Title = :title, Description = :description, Instruction = :instruction,EmbeddingParams = :embedding_params, Knowledge = :knowledge, SyncStatus = :sync_status, SyncStatusReason = :sync_status_reason, GenerationParams = :generation_params, SearchParams = :search_params, DisplayRetrievedChunks = :display_retrieved_chunks",
            ExpressionAttributeValues={
                ":title": title,
                ":description": description,
                ":instruction": instruction,
                ":knowledge": knowledge.model_dump(),
                ":embedding_params": embedding_params.model_dump(),
                ":sync_status": sync_status,
                ":sync_status_reason": sync_status_reason,
                ":display_retrieved_chunks": display_retrieved_chunks,
                ":generation_params": generation_params.model_dump(),
                ":search_params": search_params.model_dump(),
            },
            ReturnValues="ALL_NEW",
            ConditionExpression="attribute_exists(PK) AND attribute_exists(SK)",
        )
    except ClientError as e:
        if e.response["Error"]["Code"] == "ConditionalCheckFailedException":
            raise RecordNotFoundError(f"Bot with id {bot_id} not found")
        else:
            raise e

    return response


def store_alias(user_id: str, alias: BotAliasModel):
    table = _get_table_client(user_id)
    logger.info(f"Storing alias: {alias}")

    item = {
        "PK": user_id,
        "SK": compose_bot_alias_id(user_id, alias.id),
        "Title": alias.title,
        "Description": alias.description,
        "OriginalBotId": alias.original_bot_id,
        "CreateTime": decimal(alias.create_time),
        "LastBotUsed": decimal(alias.last_used_time),
        "IsPinned": alias.is_pinned,
        "SyncStatus": alias.sync_status,
        "HasKnowledge": alias.has_knowledge,
    }

    response = table.put_item(Item=item)
    return response


def update_bot_last_used_time(user_id: str, bot_id: str):
    """Update last used time for bot."""
    table = _get_table_client(user_id)
    logger.info(f"Updating last used time for bot: {bot_id}")
    try:
        response = table.update_item(
            Key={"PK": user_id, "SK": compose_bot_id(user_id, bot_id)},
            UpdateExpression="SET LastBotUsed = :val",
            ExpressionAttributeValues={":val": decimal(get_current_time())},
            ConditionExpression="attribute_exists(PK) AND attribute_exists(SK)",
        )
    except ClientError as e:
        if e.response["Error"]["Code"] == "ConditionalCheckFailedException":
            raise RecordNotFoundError(f"Bot with id {bot_id} not found")
        else:
            raise e
    return response


def update_alias_last_used_time(user_id: str, alias_id: str):
    """Update last used time for alias."""
    table = _get_table_client(user_id)
    logger.info(f"Updating last used time for alias: {alias_id}")
    try:
        response = table.update_item(
            Key={"PK": user_id, "SK": compose_bot_alias_id(user_id, alias_id)},
            UpdateExpression="SET LastBotUsed = :val",
            ExpressionAttributeValues={":val": decimal(get_current_time())},
            ConditionExpression="attribute_exists(PK) AND attribute_exists(SK)",
        )
    except ClientError as e:
        if e.response["Error"]["Code"] == "ConditionalCheckFailedException":
            raise RecordNotFoundError(f"Alias with id {alias_id} not found")
        else:
            raise e
    return response


def update_bot_pin_status(user_id: str, bot_id: str, pinned: bool):
    """Update pin status for bot."""
    table = _get_table_client(user_id)
    logger.info(f"Updating pin status for bot: {bot_id}")
    try:
        response = table.update_item(
            Key={"PK": user_id, "SK": compose_bot_id(user_id, bot_id)},
            UpdateExpression="SET IsPinned = :val",
            ExpressionAttributeValues={":val": pinned},
            ConditionExpression="attribute_exists(PK) AND attribute_exists(SK)",
        )
    except ClientError as e:
        if e.response["Error"]["Code"] == "ConditionalCheckFailedException":
            raise RecordNotFoundError(f"Bot with id {bot_id} not found")
        else:
            raise e
    return response


def update_alias_pin_status(user_id: str, alias_id: str, pinned: bool):
    """Update pin status for alias."""
    table = _get_table_client(user_id)
    logger.info(f"Updating pin status for alias: {alias_id}")
    try:
        response = table.update_item(
            Key={"PK": user_id, "SK": compose_bot_alias_id(user_id, alias_id)},
            UpdateExpression="SET IsPinned = :val",
            ExpressionAttributeValues={":val": pinned},
            ConditionExpression="attribute_exists(PK) AND attribute_exists(SK)",
        )
    except ClientError as e:
        if e.response["Error"]["Code"] == "ConditionalCheckFailedException":
            raise RecordNotFoundError(f"Alias with id {alias_id} not found")
        else:
            raise e
    return response


def find_private_bots_by_user_id(
    user_id: str, limit: int | None = None
) -> list[BotMeta]:
    """Find all private bots owned by user.
    This does not include public bots.
    The order is descending by `last_used_time`.
    """
    table = _get_table_client(user_id)
    logger.info(f"Finding bots for user: {user_id}")

    query_params = {
        "IndexName": "LastBotUsedIndex",
        "KeyConditionExpression": Key("PK").eq(user_id),
        "ScanIndexForward": False,
        # NOTE: Filter out alias bots (public shared bots)
        "FilterExpression": Attr("OriginalBotId").not_exists()
        | Attr("OriginalBotId").eq(""),
    }

    response = table.query(**query_params)
    bots = [
        BotMeta(
            id=decompose_bot_id(item["SK"]),
            title=item["Title"],
            create_time=float(item["CreateTime"]),
            last_used_time=float(item["LastBotUsed"]),
            owned=True,
            available=True,
            is_pinned=item["IsPinned"],
            description=item["Description"],
            is_public="PublicBotId" in item,
            sync_status=item["SyncStatus"],
        )
        for item in response["Items"]
    ]

    query_count = 1
    MAX_QUERY_COUNT = 5
    while "LastEvaluatedKey" in response:
        query_params["ExclusiveStartKey"] = response["LastEvaluatedKey"]
        response = table.query(**query_params)
        bots.extend(
            [
                BotMeta(
                    id=decompose_bot_id(item["SK"]),
                    title=item["Title"],
                    create_time=float(item["CreateTime"]),
                    last_used_time=float(item["LastBotUsed"]),
                    owned=True,
                    available=True,
                    is_pinned=item["IsPinned"],
                    description=item["Description"],
                    is_public="PublicBotId" in item,
                    sync_status=item["SyncStatus"],
                )
                for item in response["Items"]
            ]
        )
        query_count += 1
        if limit and len(bots) >= limit:
            # NOTE: `Limit` in query params is evaluated after filter expression.
            # So limit manually here.
            break
        if query_count > MAX_QUERY_COUNT:
            logger.warning(f"Query count exceeded {MAX_QUERY_COUNT}")
            break

    if limit:
        bots = bots[:limit]

    logger.info(f"Found all private bots: {bots}")
    return bots


def find_private_bot_by_id(user_id: str, bot_id: str) -> BotModel:
    """Find private bot."""
    table = _get_table_client(user_id)
    logger.info(f"Finding bot with id: {bot_id}")
    response = table.query(
        IndexName="SKIndex",
        KeyConditionExpression=Key("SK").eq(compose_bot_id(user_id, bot_id)),
    )
    if len(response["Items"]) == 0:
        raise RecordNotFoundError(f"Bot with id {bot_id} not found")
    item = response["Items"][0]

    if "OriginalBotId" in item:
        raise RecordNotFoundError(f"Bot with id {bot_id} is alias")

    bot = BotModel(
        id=decompose_bot_id(item["SK"]),
        title=item["Title"],
        description=item["Description"],
        instruction=item["Instruction"],
        create_time=float(item["CreateTime"]),
        last_used_time=float(item["LastBotUsed"]),
        is_pinned=item["IsPinned"],
        public_bot_id=None if "PublicBotId" not in item else item["PublicBotId"],
        owner_user_id=user_id,
        embedding_params=EmbeddingParamsModel(
            # For backward compatibility
            chunk_size=(
                item["EmbeddingParams"]["chunk_size"]
                if "EmbeddingParams" in item and "chunk_size" in item["EmbeddingParams"]
                else 1000
            ),
            chunk_overlap=(
                item["EmbeddingParams"]["chunk_overlap"]
                if "EmbeddingParams" in item
                and "chunk_overlap" in item["EmbeddingParams"]
                else 200
            ),
            enable_partition_pdf=(
                item["EmbeddingParams"]["enable_partition_pdf"]
                if "EmbeddingParams" in item
                and "enable_partition_pdf" in item["EmbeddingParams"]
                else False
            ),
        ),
        generation_params=GenerationParamsModel(
            **(
                item["GenerationParams"]
                if "GenerationParams" in item
                else DEFAULT_GENERATION_CONFIG
            )
        ),
        search_params=SearchParamsModel(
            max_results=(
                item["SearchParams"]["max_results"]
                if "SearchParams" in item
                else DEFAULT_SEARCH_CONFIG["max_results"]
            )
        ),
        knowledge=KnowledgeModel(**item["Knowledge"]),
        sync_status=item["SyncStatus"],
        sync_status_reason=item["SyncStatusReason"],
        sync_last_exec_id=item["LastExecId"],
        published_api_stack_name=(
            None
            if "ApiPublishmentStackName" not in item
            else item["ApiPublishmentStackName"]
        ),
        published_api_datetime=(
            None if "ApiPublishedDatetime" not in item else item["ApiPublishedDatetime"]
        ),
        published_api_codebuild_id=(
            None
            if "ApiPublishCodeBuildId" not in item
            else item["ApiPublishCodeBuildId"]
        ),
        display_retrieved_chunks=item.get("DisplayRetrievedChunks", False),
    )

    logger.info(f"Found bot: {bot}")
    return bot


def find_public_bot_by_id(bot_id: str) -> BotModel:
    """Find public bot by id."""
    table = _get_table_public_client()  # Use public client
    logger.info(f"Finding public bot with id: {bot_id}")
    response = table.query(
        IndexName="PublicBotIdIndex",
        KeyConditionExpression=Key("PublicBotId").eq(bot_id),
    )
    if len(response["Items"]) == 0:
        raise RecordNotFoundError(f"Public bot with id {bot_id} not found")

    item = response["Items"][0]
    bot = BotModel(
        id=decompose_bot_id(item["SK"]),
        title=item["Title"],
        description=item["Description"],
        instruction=item["Instruction"],
        create_time=float(item["CreateTime"]),
        last_used_time=float(item["LastBotUsed"]),
        is_pinned=item["IsPinned"],
        public_bot_id=item["PublicBotId"],
        owner_user_id=item["PK"],
        embedding_params=EmbeddingParamsModel(
            # For backward compatibility
            chunk_size=(
                item["EmbeddingParams"]["chunk_size"]
                if "EmbeddingParams" in item and "chunk_size" in item["EmbeddingParams"]
                else 1000
            ),
            chunk_overlap=(
                item["EmbeddingParams"]["chunk_overlap"]
                if "EmbeddingParams" in item
                and "chunk_overlap" in item["EmbeddingParams"]
                else 200
            ),
            enable_partition_pdf=(
                item["EmbeddingParams"]["enable_partition_pdf"]
                if "EmbeddingParams" in item
                and "enable_partition_pdf" in item["EmbeddingParams"]
                else False
            ),
        ),
        generation_params=GenerationParamsModel(
            **(
                item["GenerationParams"]
                if "GenerationParams" in item
                else DEFAULT_GENERATION_CONFIG
            )
        ),
        search_params=SearchParamsModel(
            max_results=(
                item["SearchParams"]["max_results"]
                if "SearchParams" in item
                else DEFAULT_SEARCH_CONFIG["max_results"]
            )
        ),
        knowledge=KnowledgeModel(**item["Knowledge"]),
        sync_status=item["SyncStatus"],
        sync_status_reason=item["SyncStatusReason"],
        sync_last_exec_id=item["LastExecId"],
        published_api_stack_name=(
            None
            if "ApiPublishmentStackName" not in item
            else item["ApiPublishmentStackName"]
        ),
        published_api_datetime=(
            None if "ApiPublishedDatetime" not in item else item["ApiPublishedDatetime"]
        ),
        published_api_codebuild_id=(
            None
            if "ApiPublishCodeBuildId" not in item
            else item["ApiPublishCodeBuildId"]
        ),
        display_retrieved_chunks=item.get("DisplayRetrievedChunks", False),
    )
    logger.info(f"Found public bot: {bot}")
    return bot


def find_alias_by_id(user_id: str, alias_id: str) -> BotAliasModel:
    """Find alias bot by id."""
    table = _get_table_client(user_id)
    logger.info(f"Finding alias bot with id: {alias_id}")
    response = table.query(
        IndexName="SKIndex",
        KeyConditionExpression=Key("SK").eq(compose_bot_alias_id(user_id, alias_id)),
    )
    if len(response["Items"]) == 0:
        raise RecordNotFoundError(f"Alias bot with id {alias_id} not found")
    item = response["Items"][0]

    bot = BotAliasModel(
        id=decompose_bot_alias_id(item["SK"]),
        title=item["Title"],
        description=item["Description"],
        original_bot_id=item["OriginalBotId"],
        create_time=float(item["CreateTime"]),
        last_used_time=float(item["LastBotUsed"]),
        is_pinned=item["IsPinned"],
        sync_status=item["SyncStatus"],
        has_knowledge=item["HasKnowledge"],
    )

    logger.info(f"Found alias: {bot}")
    return bot


def update_bot_visibility(user_id: str, bot_id: str, visible: bool):
    """Update bot visibility."""
    table = _get_table_client(user_id)
    logger.info(f"Making bot public: {bot_id}")

    response = table.query(
        IndexName="SKIndex",
        KeyConditionExpression=Key("SK").eq(compose_bot_id(user_id, bot_id)),
    )
    if len(response["Items"]) == 0:
        raise RecordNotFoundError(f"Bot with id {bot_id} not found")

    try:
        if visible:
            # To visible (open to public)
            response = table.update_item(
                Key={"PK": user_id, "SK": compose_bot_id(user_id, bot_id)},
                UpdateExpression="SET PublicBotId = :val",
                ExpressionAttributeValues={":val": bot_id},
                ConditionExpression="attribute_exists(PK) AND attribute_exists(SK)",
            )
        else:
            # To hide (close to private)
            response = table.update_item(
                Key={"PK": user_id, "SK": compose_bot_id(user_id, bot_id)},
                UpdateExpression="REMOVE PublicBotId",
                ReturnValues="ALL_NEW",
                ConditionExpression="attribute_exists(PK) AND attribute_exists(SK)",
            )
    except ClientError as e:
        if e.response["Error"]["Code"] == "ConditionalCheckFailedException":
            raise RecordNotFoundError(f"Bot with id {bot_id} not found")
        else:
            raise e

    return response


def update_bot_publication(
    user_id: str, bot_id: str, published_api_id: str, build_id: str
):
    table = _get_table_client(user_id)
    current_time = get_current_time()  # epoch time (int) を取得
    logger.info(f"Updating bot publication: {bot_id}")
    try:
        response = table.update_item(
            Key={"PK": user_id, "SK": compose_bot_id(user_id, bot_id)},
            UpdateExpression="SET ApiPublishmentStackName = :val, ApiPublishedDatetime = :time, ApiPublishCodeBuildId = :build_id",
            # NOTE: Stack naming rule: ApiPublishmentStack{published_api_id}.
            # See bedrock-chat-stack.ts > `ApiPublishmentStack`
            ExpressionAttributeValues={
                ":val": f"ApiPublishmentStack{published_api_id}",
                ":time": current_time,
                ":build_id": build_id,
            },
            ConditionExpression="attribute_exists(PK) AND attribute_exists(SK)",
        )
    except ClientError as e:
        if e.response["Error"]["Code"] == "ConditionalCheckFailedException":
            raise RecordNotFoundError(f"Bot with id {bot_id} not found")
        else:
            raise e

    return response


def delete_bot_publication(user_id: str, bot_id: str):
    table = _get_table_client(user_id)
    logger.info(f"Deleting bot publication: {bot_id}")
    try:
        response = table.update_item(
            Key={"PK": user_id, "SK": compose_bot_id(user_id, bot_id)},
            UpdateExpression="REMOVE ApiPublishmentStackName, ApiPublishedDatetime, ApiPublishCodeBuildId",
            ConditionExpression="attribute_exists(PK) AND attribute_exists(SK)",
        )
    except ClientError as e:
        if e.response["Error"]["Code"] == "ConditionalCheckFailedException":
            raise RecordNotFoundError(f"Bot with id {bot_id} not found")
        else:
            raise e

    return response


def delete_bot_by_id(user_id: str, bot_id: str):
    table = _get_table_client(user_id)
    logger.info(f"Deleting bot with id: {bot_id}")

    try:
        response = table.delete_item(
            Key={"PK": user_id, "SK": compose_bot_id(user_id, bot_id)},
            ConditionExpression="attribute_exists(PK) AND attribute_exists(SK)",
        )
    except ClientError as e:
        if e.response["Error"]["Code"] == "ConditionalCheckFailedException":
            raise RecordNotFoundError(f"Bot with id {bot_id} not found")
        else:
            raise e

    return response


def delete_alias_by_id(user_id: str, bot_id: str):
    table = _get_table_client(user_id)
    logger.info(f"Deleting alias with id: {bot_id}")

    try:
        response = table.delete_item(
            Key={"PK": user_id, "SK": compose_bot_alias_id(user_id, bot_id)},
            ConditionExpression="attribute_exists(PK) AND attribute_exists(SK)",
        )
    except ClientError as e:
        if e.response["Error"]["Code"] == "ConditionalCheckFailedException":
            raise RecordNotFoundError(f"Bot alias with id {bot_id} not found")
        else:
            raise e

    return response


async def find_public_bots_by_ids(bot_ids: list[str]) -> list[BotMetaWithStackInfo]:
    """Find all public bots by ids. This method is intended for administrator use."""
    table = _get_table_public_client()
    loop = asyncio.get_running_loop()

    def query_dynamodb(table, bot_id):
        response = table.query(
            IndexName="PublicBotIdIndex",
            KeyConditionExpression=Key("PublicBotId").eq(bot_id),
        )
        return response["Items"]

    tasks = [
        loop.run_in_executor(None, partial(query_dynamodb, table, bot_id))
        for bot_id in bot_ids
    ]
    results = await asyncio.gather(*tasks)

    bots = []
    for items in results:
        for item in items:
            bots.append(
                BotMetaWithStackInfo(
                    id=decompose_bot_id(item["SK"]),
                    owner_user_id=item["PK"],
                    title=item["Title"],
                    create_time=float(item["CreateTime"]),
                    last_used_time=float(item["LastBotUsed"]),
                    owned=True,
                    available=True,
                    is_pinned=item["IsPinned"],
                    description=item["Description"],
                    is_public="PublicBotId" in item,
                    sync_status=item["SyncStatus"],
                    published_api_stack_name=item.get("ApiPublishmentStackName", None),
                    published_api_datetime=item.get("ApiPublishedDatetime", None),
                )
            )

    return bots


def find_all_published_bots(
    limit: int = 1000, next_token: str | None = None
) -> tuple[list[BotMetaWithStackInfo], str | None]:
    """Find all published bots. This method is intended for administrator use."""
    table = _get_table_public_client()

    query_params = {
        "IndexName": "PublicBotIdIndex",
        "FilterExpression": Attr("ApiPublishmentStackName").exists()
        & Attr("ApiPublishmentStackName").ne(None),
        "Limit": limit,
    }
    if next_token:
        query_params["ExclusiveStartKey"] = json.loads(
            base64.b64decode(next_token).decode("utf-8")
        )

    response = table.scan(**query_params)

    bots = [
        BotMetaWithStackInfo(
            id=decompose_bot_id(item["SK"]),
            owner_user_id=item["PK"],
            title=item["Title"],
            create_time=float(item["CreateTime"]),
            last_used_time=float(item["LastBotUsed"]),
            owned=True,
            available=True,
            is_pinned=item["IsPinned"],
            description=item["Description"],
            is_public="PublicBotId" in item,
            sync_status=item["SyncStatus"],
            published_api_stack_name=item["ApiPublishmentStackName"],
            published_api_datetime=item.get("ApiPublishedDatetime", None),
        )
        for item in response["Items"]
    ]

    next_token = None
    if "LastEvaluatedKey" in response:
        next_token = base64.b64encode(
            json.dumps(response["LastEvaluatedKey"]).encode("utf-8")
        ).decode("utf-8")

    return bots, next_token
