import json
import logging
import os
from datetime import datetime
from decimal import Decimal as decimal

import boto3
from boto3.dynamodb.conditions import Key

from .model import ContentModel, ConversationModel, MessageModel

TABLE_NAME = os.environ.get("TABLE_NAME", "")
ACCOUNT = os.environ.get("ACCOUNT", "")
REGION = os.environ.get("REGION", "ap-northeast-1")
TABLE_ACCESS_ROLE_ARN = os.environ.get("TABLE_ACCESS_ROLE_ARN", "")

logger = logging.getLogger(__name__)
dynamodb = boto3.resource("dynamodb", region_name=REGION)
sts_client = boto3.client("sts")


class RecordNotFoundError(Exception):
    pass


def _compose_conv_id(user_id: str, conversation_id: str):
    # Add user_id prefix for row level security to match with `LeadingKeys` condition
    return f"{user_id}_{conversation_id}"


def _decompose_conv_id(conv_id: str):
    return conv_id.split("_")[1]


def _get_table_client(user_id: str):
    """Get a DynamoDB table client with row level access
    Ref: https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_examples_dynamodb_items.html
    """
    policy_document = {
        "Statement": [
            {
                "Effect": "Allow",
                "Action": [
                    "dynamodb:BatchGetItem",
                    "dynamodb:BatchWriteItem",
                    "dynamodb:ConditionCheckItem",
                    "dynamodb:DeleteItem",
                    "dynamodb:DescribeTable",
                    "dynamodb:GetItem",
                    "dynamodb:GetRecords",
                    "dynamodb:PutItem",
                    "dynamodb:Query",
                    "dynamodb:Scan",
                    "dynamodb:UpdateItem",
                ],
                "Resource": [
                    f"arn:aws:dynamodb:{REGION}:{ACCOUNT}:table/{TABLE_NAME}",
                    f"arn:aws:dynamodb:{REGION}:{ACCOUNT}:table/{TABLE_NAME}/index/*",
                ],
                "Condition": {
                    # Allow access to items with the same partition key as the user id
                    "ForAllValues:StringLike": {"dynamodb:LeadingKeys": [f"{user_id}*"]}
                },
            }
        ]
    }
    assumed_role_object = sts_client.assume_role(
        RoleArn=TABLE_ACCESS_ROLE_ARN,
        RoleSessionName="DynamoDBSession",
        Policy=json.dumps(policy_document),
    )
    credentials = assumed_role_object["Credentials"]
    dynamodb = boto3.resource(
        "dynamodb",
        region_name=REGION,
        aws_access_key_id=credentials["AccessKeyId"],
        aws_secret_access_key=credentials["SecretAccessKey"],
        aws_session_token=credentials["SessionToken"],
    )
    table = dynamodb.Table(TABLE_NAME)
    return table


def store_conversation(user_id: str, conversation: ConversationModel):
    logger.debug(f"Storing conversation: {conversation.model_dump_json()}")
    table = _get_table_client(user_id)
    response = table.put_item(
        Item={
            "UserId": user_id,
            "ConversationId": _compose_conv_id(user_id, conversation.id),
            "Title": conversation.title,
            "CreateTime": decimal(conversation.create_time),
            "Messages": json.dumps(
                [message.model_dump() for message in conversation.messages]
            ),
        }
    )
    return response


def find_conversation_by_user_id(user_id: str) -> list[ConversationModel]:
    logger.debug(f"Finding conversations for user: {user_id}")
    table = _get_table_client(user_id)
    response = table.query(KeyConditionExpression=Key("UserId").eq(user_id))

    conversations = [
        ConversationModel(
            id=_decompose_conv_id(item["ConversationId"]),
            create_time=float(item["CreateTime"]),
            title=item["Title"],
            messages=[
                MessageModel(
                    id=message["id"],
                    role=message["role"],
                    content=ContentModel(
                        content_type=message["content"]["content_type"],
                        body=message["content"]["body"],
                    ),
                    model=message["model"],
                    create_time=float(message["create_time"]),
                )
                for message in json.loads(item["Messages"])
            ],
        )
        for item in response["Items"]
    ]
    logger.debug(f"Found conversations: {conversations}")
    return conversations


def find_conversation_by_id(user_id: str, conversation_id: str) -> ConversationModel:
    logger.debug(f"Finding conversation: {conversation_id}")
    table = _get_table_client(user_id)
    response = table.query(
        IndexName="ConversationIdIndex",
        KeyConditionExpression=Key("ConversationId").eq(
            _compose_conv_id(user_id, conversation_id)
        ),
    )
    if len(response["Items"]) == 0:
        raise RecordNotFoundError(f"No conversation found with id: {conversation_id}")

    # NOTE: conversation is unique
    item = response["Items"][0]
    conv = ConversationModel(
        id=_decompose_conv_id(item["ConversationId"]),
        create_time=float(item["CreateTime"]),
        title=item["Title"],
        messages=[
            MessageModel(
                id=message["id"],
                role=message["role"],
                content=ContentModel(
                    content_type=message["content"]["content_type"],
                    body=message["content"]["body"],
                ),
                model=message["model"],
                create_time=float(message["create_time"]),
            )
            for message in json.loads(item["Messages"])
        ],
    )
    logger.debug(f"Found conversation: {conv}")
    return conv


def delete_conversation_by_id(user_id: str, conversation_id: str):
    logger.debug(f"Deleting conversation: {conversation_id}")
    table = _get_table_client(user_id)

    # Query the index
    response = table.query(
        IndexName="ConversationIdIndex",
        KeyConditionExpression=Key("ConversationId").eq(
            _compose_conv_id(user_id, conversation_id)
        ),
    )

    # Check if conversation exists
    if response["Items"]:
        user_id = response["Items"][0]["UserId"]
        key = {
            "UserId": user_id,
            "ConversationId": _compose_conv_id(user_id, conversation_id),
        }
        delete_response = table.delete_item(Key=key)
        return delete_response
    else:
        raise RecordNotFoundError(f"No conversation found with id: {conversation_id}")


def delete_conversation_by_user_id(user_id: str):
    logger.debug(f"Deleting conversations for user: {user_id}")
    # First, find all conversations for the user
    conversations = find_conversation_by_user_id(user_id)
    if conversations:
        table = _get_table_client(user_id)
        responses = []
        for conversation in conversations:
            # Construct key to delete
            key = {
                "UserId": user_id,
                "ConversationId": _compose_conv_id(user_id, conversation.id),
            }
            response = table.delete_item(Key=key)
            responses.append(response)
        return responses
    else:
        raise RecordNotFoundError(f"No conversations found for user id: {user_id}")


def change_conversation_title(user_id: str, conversation_id: str, new_title: str):
    logger.debug(f"Changing conversation title: {conversation_id}")
    logger.debug(f"New title: {new_title}")
    table = _get_table_client(user_id)

    # First, we need to find the item using the GSI
    response = table.query(
        IndexName="ConversationIdIndex",
        KeyConditionExpression=Key("ConversationId").eq(
            _compose_conv_id(user_id, conversation_id)
        ),
    )

    items = response["Items"]
    if not items:
        raise RecordNotFoundError(f"No conversation found with id {conversation_id}")

    # We'll just update the first item in case there are multiple matches
    item = items[0]
    user_id = item["UserId"]

    # Then, we update the item using its primary key
    response = table.update_item(
        Key={
            "UserId": user_id,
            "ConversationId": _compose_conv_id(user_id, conversation_id),
        },
        UpdateExpression="set Title=:t",
        ExpressionAttributeValues={":t": new_title},
        ReturnValues="UPDATED_NEW",
    )
    logger.debug(f"Updated conversation title response: {response}")

    return response
