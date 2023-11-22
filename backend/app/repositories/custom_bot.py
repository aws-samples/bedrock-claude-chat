import json
import logging
import os
from datetime import datetime
from decimal import Decimal as decimal

import boto3
from app.repositories.common import (
    RecordAccessNotAllowedError,
    RecordNotFoundError,
    _compose_bot_alias_id,
    _compose_bot_id,
    _decompose_bot_id,
    _get_table_client,
    _get_table_public_client,
)
from app.repositories.model import BotAliasModel, BotMeta, BotModel
from app.utils import get_current_time
from boto3.dynamodb.conditions import Attr, Key
from botocore.exceptions import ClientError

logger = logging.getLogger(__name__)
sts_client = boto3.client("sts")


def store_bot(user_id: str, custom_bot: BotModel):
    table = _get_table_client(user_id)
    logger.debug(f"Storing bot: {custom_bot}")

    item = {
        "PK": user_id,
        "SK": _compose_bot_id(user_id, custom_bot.id),
        "Title": custom_bot.title,
        "Description": custom_bot.description,
        "Instruction": custom_bot.instruction,
        "CreateTime": decimal(custom_bot.create_time),
        "LastBotUsed": decimal(custom_bot.last_used_time),
        "IsPinned": custom_bot.is_pinned,
    }

    response = table.put_item(Item=item)
    return response


def store_alias(user_id: str, alias: BotAliasModel):
    table = _get_table_client(user_id)
    logger.debug(f"Storing alias: {alias}")

    item = {
        "PK": user_id,
        "SK": _compose_bot_alias_id(user_id, alias.id),
        "OriginalBotId": alias.original_bot_id,
        "CreateTime": decimal(alias.create_time),
        "LastBotUsed": decimal(alias.last_used_time),
        "IsPinned": alias.is_pinned,
    }

    response = table.put_item(Item=item)
    return response


def update_last_used_time(user_id: str, bot_id: str):
    table = _get_table_client(user_id)
    logger.debug(f"Updating last used time for bot: {bot_id}")
    try:
        response = table.update_item(
            Key={"PK": user_id, "SK": _compose_bot_id(user_id, bot_id)},
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


def find_bot_by_user_id(user_id: str, limit: int = None) -> list[BotMeta]:
    """Find all private bots owned by user. This does not include public bots."""
    table = _get_table_client(user_id)
    logger.debug(f"Finding bots for user: {user_id}")

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
            id=_decompose_bot_id(item["SK"]),
            title=item["Title"],
            create_time=float(item["CreateTime"]),
            last_used_time=float(item["LastBotUsed"]),
            owned=True,
            available=True,
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
                    id=_decompose_bot_id(item["SK"]),
                    title=item["Title"],
                    create_time=float(item["CreateTime"]),
                    last_used_time=float(item["LastBotUsed"]),
                    owned=True,
                    available=True,
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

    logger.debug(f"Found bots: {bots}")
    return bots


def find_pinned_bots(user_id: str) -> list[BotMeta]:
    """Find all pinned bots of a user.
    This includes both private and public bots.
    """
    table = _get_table_client(user_id)
    logger.debug(f"Finding pinned bots for user: {user_id}")

    # Fetch all pinned bots
    query_params = {
        "IndexName": "LastBotUsedIndex",
        "KeyConditionExpression": Key("PK").eq(user_id),
        "ScanIndexForward": False,
        "FilterExpression": Attr("IsPinned").eq(True),
    }
    response = table.query(**query_params)

    bots = []
    for item in response["Items"]:
        if "OriginalBotId" in item:
            # Fetch original bots of alias bots
            is_original_available = True
            try:
                bot = find_public_bot_by_id(item["OriginalBotId"])
            except RecordNotFoundError:
                is_original_available = False

            bots.append(
                BotMeta(
                    id=bot.id,
                    title=bot.title,
                    create_time=float(bot.create_time),
                    last_used_time=float(bot.last_used_time),
                    owned=False,
                    available=is_original_available,
                )
            )
        else:
            # Private bots
            bots.append(
                BotMeta(
                    id=_decompose_bot_id(item["SK"]),
                    title=item["Title"],
                    create_time=float(item["CreateTime"]),
                    last_used_time=float(item["LastBotUsed"]),
                    owned=True,
                    available=True,
                )
            )

    return bots


def find_bot_by_id(user_id: str, bot_id: str, public=False) -> BotModel:
    """Find private bot."""
    table = _get_table_client(user_id) if not public else _get_table_public_client()
    logger.debug(f"Finding bot with id: {bot_id}")
    response = table.query(
        IndexName="SKIndex",
        KeyConditionExpression=Key("SK").eq(_compose_bot_id(user_id, bot_id)),
    )
    if len(response["Items"]) == 0:
        raise RecordNotFoundError(f"Bot with id {bot_id} not found")
    item = response["Items"][0]

    if "OriginalBotId" in item:
        raise RecordNotFoundError(f"Bot with id {bot_id} is alias")

    bot = BotModel(
        id=_decompose_bot_id(item["SK"]),
        title=item["Title"],
        description=item["Description"],
        instruction=item["Instruction"],
        create_time=float(item["CreateTime"]),
        last_used_time=float(item["LastBotUsed"]),
        is_pinned=item["IsPinned"],
    )

    logger.debug(f"Found bot: {bot}")
    return bot


def find_public_bot_by_id(bot_id: str) -> BotModel:
    """Find public bot by id."""
    # Use public client
    table = _get_table_public_client()
    logger.debug(f"Finding public bot with id: {bot_id}")
    response = table.query(
        IndexName="PublicBotIdIndex",
        KeyConditionExpression=Key("PublicBotId").eq(bot_id),
    )
    if len(response["Items"]) == 0:
        raise RecordNotFoundError(f"Public bot with id {bot_id} not found")

    item = response["Items"][0]
    bot = BotModel(
        id=_decompose_bot_id(item["SK"]),
        title=item["Title"],
        description=item["Description"],
        instruction=item["Instruction"],
        create_time=float(item["CreateTime"]),
        last_used_time=float(item["LastBotUsed"]),
        is_pinned=item["IsPinned"],
        public_bot_id=item["PublicBotId"],
    )
    logger.debug(f"Found public bot: {bot}")
    return bot


def update_bot_visibility(user_id: str, bot_id: str, visible: bool):
    """Update bot visibility."""
    table = _get_table_client(user_id)
    logger.debug(f"Making bot public: {bot_id}")

    response = table.query(
        IndexName="SKIndex",
        KeyConditionExpression=Key("SK").eq(_compose_bot_id(user_id, bot_id)),
    )
    if len(response["Items"]) == 0:
        raise RecordNotFoundError(f"Bot with id {bot_id} not found")

    try:
        if visible:
            response = table.update_item(
                Key={"PK": user_id, "SK": _compose_bot_id(user_id, bot_id)},
                UpdateExpression="SET PublicBotId = :val",
                ExpressionAttributeValues={":val": bot_id},
                ConditionExpression="attribute_exists(PK) AND attribute_exists(SK)",
            )
        else:
            response = table.update_item(
                Key={"PK": user_id, "SK": _compose_bot_id(user_id, bot_id)},
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


def delete_bot_by_id(user_id: str, bot_id: str):
    table = _get_table_client(user_id)
    logger.debug(f"Deleting bot with id: {bot_id}")

    try:
        response = table.delete_item(
            Key={"PK": user_id, "SK": _compose_bot_id(user_id, bot_id)},
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
    logger.debug(f"Deleting alias with id: {bot_id}")

    try:
        response = table.delete_item(
            Key={"PK": user_id, "SK": _compose_bot_alias_id(user_id, bot_id)},
            ConditionExpression="attribute_exists(PK) AND attribute_exists(SK)",
        )
    except ClientError as e:
        if e.response["Error"]["Code"] == "ConditionalCheckFailedException":
            raise RecordNotFoundError(f"Bot with id {bot_id} not found")
        else:
            raise e

    return response
