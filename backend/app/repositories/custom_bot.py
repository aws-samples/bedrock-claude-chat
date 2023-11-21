import json
import logging
import os
from datetime import datetime
from decimal import Decimal as decimal

import boto3
from app.repositories.common import (
    RecordNotFoundError,
    _compose_bot_id,
    _decompose_bot_id,
    _get_table_client,
)
from app.repositories.model import BotMetaModel, BotModel
from boto3.dynamodb.conditions import Key

logger = logging.getLogger(__name__)
sts_client = boto3.client("sts")


def store_bot(user_id: str, custom_bot: BotModel):
    table = _get_table_client(user_id)
    logger.debug(f"Storing bot: {custom_bot}")
    response = table.put_item(
        Item={
            "PK": user_id,
            "SK": _compose_bot_id(user_id, custom_bot.id),
            "Title": custom_bot.title,
            "Description": custom_bot.description,
            "Instruction": custom_bot.instruction,
            "CreateTime": decimal(custom_bot.create_time),
            "LastBotUsed": decimal(custom_bot.last_used_time),
        }
    )
    return response


def update_last_used_time(user_id: str, bot_id: str):
    table = _get_table_client(user_id)
    logger.debug(f"Updating last used time for bot: {bot_id}")
    response = table.update_item(
        Key={"PK": user_id, "SK": _compose_bot_id(user_id, bot_id)},
        UpdateExpression="SET LastBotUsed = :val",
        ExpressionAttributeValues={":val": decimal(datetime.now().timestamp())},
    )
    return response


def find_bot_by_user_id(user_id: str, limit: int = None) -> list[BotMetaModel]:
    table = _get_table_client(user_id)
    logger.debug(f"Finding bots for user: {user_id}")

    query_params = {
        "IndexName": "LastBotUsedIndex",
        "KeyConditionExpression": Key("PK").eq(user_id),
        "ScanIndexForward": False,
    }

    if limit is not None:
        query_params["Limit"] = limit

    response = table.query(**query_params)
    bots = [
        BotMetaModel(
            id=_decompose_bot_id(item["SK"]),
            title=item["Title"],
            create_time=float(item["CreateTime"]),
            last_used_time=float(item["LastBotUsed"]),
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
                BotMetaModel(
                    id=_decompose_bot_id(item["SK"]),
                    title=item["Title"],
                    create_time=float(item["CreateTime"]),
                    last_used_time=float(item["LastBotUsed"]),
                )
                for item in response["Items"]
            ]
        )
        query_count += 1
        if query_count > MAX_QUERY_COUNT:
            logger.warning(f"Query count exceeded {MAX_QUERY_COUNT}")
            break

    logger.debug(f"Found bots: {bots}")
    return bots


def find_bot_by_id(user_id: str, bot_id: str) -> BotModel:
    table = _get_table_client(user_id)
    logger.debug(f"Finding bot with id: {bot_id}")
    response = table.query(
        IndexName="SKIndex",
        KeyConditionExpression=Key("SK").eq(_compose_bot_id(user_id, bot_id)),
    )
    if len(response["Items"]) == 0:
        raise RecordNotFoundError(f"Bot with id {bot_id} not found")
    item = response["Items"][0]

    bot = BotModel(
        id=_decompose_bot_id(item["SK"]),
        title=item["Title"],
        description=item["Description"],
        instruction=item["Instruction"],
        create_time=float(item["CreateTime"]),
        last_used_time=float(item["LastBotUsed"]),
    )
    logger.debug(f"Found bot: {bot}")
    return bot


def delete_bot_by_id(user_id: str, bot_id: str):
    table = _get_table_client(user_id)
    logger.debug(f"Deleting bot with id: {bot_id}")

    response = table.query(
        IndexName="SKIndex",
        KeyConditionExpression=Key("SK").eq(_compose_bot_id(user_id, bot_id)),
    )
    if len(response["Items"]) == 0:
        raise RecordNotFoundError(f"Bot with id {bot_id} not found")

    response = table.delete_item(
        Key={"PK": user_id, "SK": _compose_bot_id(user_id, bot_id)}
    )
    return response
