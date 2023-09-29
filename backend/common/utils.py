import os
from typing import List

import boto3
from repositories.model import MessageModel

BEDROCK_REGION = os.environ.get("BEDROCK_REGION", "us-east-1")


def is_running_on_lambda():
    return "AWS_EXECUTION_ENV" in os.environ


def get_buffer_string(conversations: List[MessageModel]) -> str:
    string_messages = []
    for conversation in conversations:
        if conversation.role == "assistant":
            prefix = "Assistant: "
        elif conversation.role == "user":
            prefix = "Human: "
        else:
            raise ValueError(f"Unsupported role: {conversation.role}")
        message = f"{prefix}{conversation.content.body}"
        string_messages.append(message)

    # 最後のメッセージがユーザーからのものである場合、prefixを追加します。
    # Ref: https://docs.anthropic.com/claude/docs/introduction-to-prompt-design#human--assistant-formatting
    if conversations[-1].role == "user":
        string_messages.append("Assistant: ")

    return "\n".join(string_messages)


def get_bedrock_client():
    client = boto3.client("bedrock-runtime", BEDROCK_REGION)

    return client
