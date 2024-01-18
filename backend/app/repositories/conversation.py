import json
import logging
import os
from datetime import datetime
from decimal import Decimal as decimal
from functools import wraps

import boto3
from app.repositories.common import (
    TABLE_NAME,
    TRANSACTION_BATCH_SIZE,
    RecordNotFoundError,
    _get_dynamodb_client,
    _get_table_client,
    compose_bot_id,
    compose_conv_id,
    decompose_conv_id,
)
from app.repositories.model import (
    ContentModel,
    ConversationMeta,
    ConversationModel,
    MessageModel,
)
from app.utils import get_current_time
from boto3.dynamodb.conditions import Key
from botocore.exceptions import ClientError

logger = logging.getLogger(__name__)
sts_client = boto3.client("sts")


def store_conversation(user_id: str, conversation: ConversationModel):
    logger.info(f"Storing conversation: {conversation.model_dump_json()}")
    table = _get_table_client(user_id)

    item_params = {
        "PK": user_id,
        "SK": compose_conv_id(user_id, conversation.id),
        "Title": conversation.title,
        "CreateTime": decimal(conversation.create_time),
        "MessageMap": json.dumps(
            {k: v.model_dump() for k, v in conversation.message_map.items()}
        ),
        "LastMessageId": conversation.last_message_id,
    }
    if conversation.bot_id:
        item_params["BotId"] = conversation.bot_id

    response = table.put_item(
        Item=item_params,
    )
    return response


def find_conversation_by_user_id(user_id: str) -> list[ConversationMeta]:
    logger.info(f"Finding conversations for user: {user_id}")
    table = _get_table_client(user_id)

    query_params = {
        "KeyConditionExpression": Key("PK").eq(user_id)
        # NOTE: Need SK to fetch only conversations
        & Key("SK").begins_with(f"{user_id}#CONV#"),
        "ScanIndexForward": False,
    }

    response = table.query(**query_params)
    conversations = [
        ConversationMeta(
            id=decompose_conv_id(item["SK"]),
            create_time=float(item["CreateTime"]),
            title=item["Title"],
            # NOTE: all message has the same model
            model=json.loads(item["MessageMap"]).popitem()[1]["model"],
            bot_id=item["BotId"] if "BotId" in item else None,
        )
        for item in response["Items"]
    ]

    query_count = 1
    MAX_QUERY_COUNT = 5
    while "LastEvaluatedKey" in response:
        model = json.loads(response["Items"][0]["MessageMap"]).popitem()[1]["model"]
        query_params["ExclusiveStartKey"] = response["LastEvaluatedKey"]
        # NOTE: max page size is 1MB
        # See: https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Query.Pagination.html
        response = table.query(
            **query_params,
        )
        conversations.extend(
            [
                ConversationMeta(
                    id=decompose_conv_id(item["SK"]),
                    create_time=float(item["CreateTime"]),
                    title=item["Title"],
                    model=model,
                    bot_id=item["BotId"] if "BotId" in item else None,
                )
                for item in response["Items"]
            ]
        )
        query_count += 1
        if query_count > MAX_QUERY_COUNT:
            logger.warning(f"Query count exceeded {MAX_QUERY_COUNT}")
            break

    logger.info(f"Found conversations: {conversations}")
    return conversations


def find_conversation_by_id(user_id: str, conversation_id: str) -> ConversationModel:
    logger.info(f"Finding conversation: {conversation_id}")
    table = _get_table_client(user_id)
    response = table.query(
        IndexName="SKIndex",
        KeyConditionExpression=Key("SK").eq(compose_conv_id(user_id, conversation_id)),
    )
    if len(response["Items"]) == 0:
        raise RecordNotFoundError(f"No conversation found with id: {conversation_id}")

    # NOTE: conversation is unique
    item = response["Items"][0]
    conv = ConversationModel(
        id=decompose_conv_id(item["SK"]),
        create_time=float(item["CreateTime"]),
        title=item["Title"],
        message_map={
            k: MessageModel(
                role=v["role"],
                content=ContentModel(
                    content_type=v["content"]["content_type"],
                    body=v["content"]["body"],
                ),
                model=v["model"],
                children=v["children"],
                parent=v["parent"],
                create_time=float(v["create_time"]),
            )
            for k, v in json.loads(item["MessageMap"]).items()
        },
        last_message_id=item["LastMessageId"],
        bot_id=item["BotId"] if "BotId" in item else None,
    )
    logger.info(f"Found conversation: {conv}")
    return conv


def delete_conversation_by_id(user_id: str, conversation_id: str):
    logger.info(f"Deleting conversation: {conversation_id}")
    table = _get_table_client(user_id)

    try:
        response = table.delete_item(
            Key={"PK": user_id, "SK": compose_conv_id(user_id, conversation_id)},
            ConditionExpression="attribute_exists(PK) AND attribute_exists(SK)",
        )
    except ClientError as e:
        if e.response["Error"]["Code"] == "ConditionalCheckFailedException":
            raise RecordNotFoundError(
                f"Conversation with id {conversation_id} not found"
            )
        else:
            raise e

    return response


def delete_conversation_by_user_id(user_id: str):
    logger.info(f"Deleting ALL conversations for user: {user_id}")
    table = _get_table_client(user_id)

    query_params = {
        "KeyConditionExpression": Key("PK").eq(user_id)
        # NOTE: Need SK to fetch only conversations
        & Key("SK").begins_with(f"{user_id}#CONV#"),
        "ProjectionExpression": "SK",  # Only SK is needed to delete
    }

    def delete_batch(batch):
        with table.batch_writer() as writer:
            for item in batch:
                writer.delete_item(Key={"PK": user_id, "SK": item["SK"]})

    try:
        response = table.query(
            **query_params,
        )

        while True:
            items = response.get("Items", [])
            for i in range(0, len(items), TRANSACTION_BATCH_SIZE):
                batch = items[i : i + TRANSACTION_BATCH_SIZE]
                delete_batch(batch)

            # Check if next page exists
            if "LastEvaluatedKey" not in response:
                break

            # Load next page
            query_params["ExclusiveStartKey"] = response["LastEvaluatedKey"]
            response = table.query(
                **query_params,
            )

    except ClientError as e:
        logger.error(f"An error occurred: {e.response['Error']['Message']}")


def change_conversation_title(user_id: str, conversation_id: str, new_title: str):
    logger.info(f"Updating conversation title: {conversation_id} to {new_title}")
    table = _get_table_client(user_id)

    try:
        response = table.update_item(
            Key={
                "PK": user_id,
                "SK": compose_conv_id(user_id, conversation_id),
            },
            UpdateExpression="set Title=:t",
            ExpressionAttributeValues={":t": new_title},
            ReturnValues="UPDATED_NEW",
            ConditionExpression="attribute_exists(PK) AND attribute_exists(SK)",
        )
    except ClientError as e:
        if e.response["Error"]["Code"] == "ConditionalCheckFailedException":
            raise RecordNotFoundError(
                f"Conversation with id {conversation_id} not found"
            )
        else:
            raise e

    logger.info(f"Updated conversation title response: {response}")

    return response
