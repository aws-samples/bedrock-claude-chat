import json
import logging
import os
from datetime import datetime
from decimal import Decimal as decimal
from functools import wraps

import boto3
from app.repositories.common import (
    TRANSACTION_BATCH_SIZE,
    RecordNotFoundError,
    _get_table_client,
    compose_conv_id,
    decompose_conv_id,
)
from app.repositories.models.conversation import (
    ChunkModel,
    ContentModel,
    ConversationMeta,
    ConversationModel,
    FeedbackModel,
    MessageModel,
)
from app.utils import get_current_time
from boto3.dynamodb.conditions import Key
from botocore.exceptions import ClientError

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)
s3_client = boto3.client("s3")

THRESHOLD_LARGE_MESSAGE = 300 * 1024  # 300KB
LARGE_MESSAGE_BUCKET = os.environ.get("LARGE_MESSAGE_BUCKET")


def store_conversation(
    user_id: str, conversation: ConversationModel, threshold=THRESHOLD_LARGE_MESSAGE
):
    logger.info(f"Storing conversation: {conversation.model_dump_json()}")
    table = _get_table_client(user_id)

    item_params = {
        "PK": user_id,
        "SK": compose_conv_id(user_id, conversation.id),
        "Title": conversation.title,
        "CreateTime": decimal(conversation.create_time),
        # Convert to decimal via str to avoid error
        # Ref: https://stackoverflow.com/questions/63026648/errormessage-class-decimal-inexact-class-decimal-rounded-while
        "TotalPrice": decimal(str(conversation.total_price)),
        "LastMessageId": conversation.last_message_id,
        "ShouldContinue": conversation.should_continue,
    }

    if conversation.bot_id:
        item_params["BotId"] = conversation.bot_id

    message_map = {
        k: {
            **v.model_dump(),
            "content": [c.model_dump() for c in v.content],
        }
        for k, v in conversation.message_map.items()
    }
    message_map_size = len(json.dumps(message_map).encode("utf-8"))
    logger.info(f"Message map size: {message_map_size}")
    if message_map_size > threshold:
        logger.info(
            f"Message map size {message_map_size} exceeds threshold {threshold}"
        )
        item_params["IsLargeMessage"] = True
        large_message_path = f"{user_id}/{conversation.id}/message_map.json"
        item_params["LargeMessagePath"] = large_message_path
        # Store all message in S3
        s3_client.put_object(
            Bucket=LARGE_MESSAGE_BUCKET,
            Key=large_message_path,
            Body=json.dumps(message_map),
        )
        # Store only `system` attribute in DynamoDB
        item_params["MessageMap"] = json.dumps(
            {
                k: v.model_dump()
                for k, v in conversation.message_map.items()
                if k == "system"
            }
        )
    else:
        item_params["IsLargeMessage"] = False
        item_params["MessageMap"] = json.dumps(
            {k: v.model_dump() for k, v in conversation.message_map.items()}
        )

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
            model=json.loads(item["MessageMap"]).get("system", {}).get("model", ""),
            bot_id=item["BotId"] if "BotId" in item else None,
        )
        for item in response["Items"]
    ]

    query_count = 1
    MAX_QUERY_COUNT = 5
    while "LastEvaluatedKey" in response:
        model = (
            json.loads(response["Items"][0]["MessageMap"])
            .get("system", {})
            .get("model", "")
        )
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
    if item.get("IsLargeMessage", False):
        large_message_path = item["LargeMessagePath"]
        response = s3_client.get_object(
            Bucket=LARGE_MESSAGE_BUCKET, Key=large_message_path
        )
        message_map = json.loads(response["Body"].read().decode("utf-8"))
    else:
        message_map = json.loads(item["MessageMap"])

    conv = ConversationModel(
        id=decompose_conv_id(item["SK"]),
        create_time=float(item["CreateTime"]),
        title=item["Title"],
        total_price=item.get("TotalPrice", 0),
        message_map={
            k: MessageModel(
                role=v["role"],
                content=(
                    [
                        ContentModel(
                            content_type=c["content_type"],
                            body=c["body"],
                            media_type=c["media_type"],
                        )
                        for c in v["content"]
                    ]
                    if type(v["content"]) == list
                    else [
                        # For backward compatibility
                        ContentModel(
                            content_type=v["content"]["content_type"],
                            body=v["content"]["body"],
                            media_type=None,
                        )
                    ]
                ),
                model=v["model"],
                children=v["children"],
                parent=v["parent"],
                create_time=float(v["create_time"]),
                feedback=(
                    FeedbackModel(
                        thumbs_up=v["feedback"]["thumbs_up"],
                        category=v["feedback"]["category"],
                        comment=v["feedback"]["comment"],
                    )
                    if v.get("feedback")
                    else None
                ),
                used_chunks=(
                    [
                        ChunkModel(
                            content=c["content"],
                            content_type=(
                                c["content_type"] if "content_type" in c else "s3"
                            ),
                            source=c["source"],
                            rank=c["rank"],
                        )
                        for c in v["used_chunks"]
                    ]
                    if v.get("used_chunks")
                    else None
                ),
                thinking_log=v.get("thinking_log"),
            )
            for k, v in message_map.items()
        },
        last_message_id=item["LastMessageId"],
        bot_id=item["BotId"] if "BotId" in item else None,
        should_continue=item.get("ShouldContinue", False),
    )
    logger.info(f"Found conversation: {conv}")
    return conv


def delete_conversation_by_id(user_id: str, conversation_id: str):
    logger.info(f"Deleting conversation: {conversation_id}")
    table = _get_table_client(user_id)

    try:
        # Check if the conversation has a large message map
        response = table.get_item(
            Key={"PK": user_id, "SK": compose_conv_id(user_id, conversation_id)},
            ProjectionExpression="IsLargeMessage, LargeMessagePath",
        )

        item = response.get("Item")
        if item and item.get("IsLargeMessage", False):
            # Delete the large message map from S3
            s3_client.delete_object(
                Bucket=LARGE_MESSAGE_BUCKET, Key=item["LargeMessagePath"]
            )

        # Delete the conversation from DynamoDB
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
        "ProjectionExpression": "SK, IsLargeMessage, LargeMessagePath",
    }

    def delete_batch(batch):
        with table.batch_writer() as writer:
            for item in batch:
                writer.delete_item(Key={"PK": user_id, "SK": item["SK"]})

    def delete_large_messages(items):
        for item in items:
            if item.get("IsLargeMessage", False):
                s3_client.delete_object(
                    Bucket=LARGE_MESSAGE_BUCKET, Key=item["LargeMessagePath"]
                )

    try:
        response = table.query(
            **query_params,
        )

        while True:
            items = response.get("Items", [])
            delete_large_messages(items)

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


def update_feedback(
    user_id: str, conversation_id: str, message_id: str, feedback: FeedbackModel
):
    logger.info(f"Updating feedback for conversation: {conversation_id}")
    table = _get_table_client(user_id)
    conv = find_conversation_by_id(user_id, conversation_id)
    message_map = conv.message_map
    message_map[message_id].feedback = feedback

    response = table.update_item(
        Key={
            "PK": user_id,
            "SK": compose_conv_id(user_id, conversation_id),
        },
        UpdateExpression="set MessageMap = :m",
        ExpressionAttributeValues={
            ":m": json.dumps({k: v.model_dump() for k, v in message_map.items()})
        },
        ConditionExpression="attribute_exists(PK) AND attribute_exists(SK)",
        ReturnValues="UPDATED_NEW",
    )
    logger.info(f"Updated feedback response: {response}")
    return response
