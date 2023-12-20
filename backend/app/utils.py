import os
from datetime import datetime
from typing import List

import boto3
from app.repositories.model import MessageModel
from botocore.exceptions import ClientError

BEDROCK_REGION = os.environ.get("BEDROCK_REGION", "us-east-1")


def is_running_on_lambda():
    return "AWS_EXECUTION_ENV" in os.environ


def get_buffer_string(conversations: list[MessageModel]) -> str:
    string_messages = []
    instruction = None
    for conversation in conversations:
        if conversation.role == "assistant":
            prefix = "Assistant: "
        elif conversation.role == "user":
            prefix = "Human: "
        elif conversation.role == "system":
            # Ignore system messages (currently `system` is dummy whose parent is null)
            continue
        elif conversation.role == "instruction":
            instruction = conversation.content.body
            continue
        else:
            raise ValueError(f"Unsupported role: {conversation.role}")

        message = f"{prefix}{conversation.content.body}"
        string_messages.append(message)

    if conversations[-1].role == "user":
        # Insert instruction before last human message
        if instruction:
            string_messages.insert(
                len(string_messages) - 1, f"Instructions: {instruction}"
            )
        # If the last message is from the user, add a new line before the assistant's response
        # Ref: https://docs.anthropic.com/claude/docs/introduction-to-prompt-design#human--assistant-formatting
        string_messages.append("Assistant: ")

    return "\n\n".join(string_messages)


def get_bedrock_client():
    client = boto3.client("bedrock-runtime", BEDROCK_REGION)

    return client


def get_current_time():
    # Get current time as milliseconds epoch time
    return int(datetime.now().timestamp() * 1000)


def generate_presigned_url(bucket: str, key: str, expiration=3600):
    client = boto3.client("s3")
    response = client.generate_presigned_url(
        "put_object",
        Params={"Bucket": bucket, "Key": key},
        ExpiresIn=expiration,
    )

    return response
