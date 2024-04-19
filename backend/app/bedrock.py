import json
import logging
import os

from anthropic import AnthropicBedrock
from app.config import (
    ANTHROPIC_PRICING,
    DEFAULT_EMBEDDING_CONFIG,
    GENERATION_CONFIG,
    MISTRAL_GENERATION_CONFIG,
)
from app.repositories.models.conversation import MessageModel
from app.utils import get_bedrock_client, is_anthropic_model

logger = logging.getLogger(__name__)

BEDROCK_REGION = os.environ.get("BEDROCK_REGION", "us-east-1")


client = get_bedrock_client()
anthropic_client = AnthropicBedrock()


def compose_args(
    messages: list[MessageModel],
    model: str,
    instruction: str | None = None,
    stream: bool = False,
) -> dict:
    # if model is from Anthropic, use AnthropicBedrock
    # otherwise, use bedrock client
    model_id = get_model_id(model)
    if is_anthropic_model(model_id):
        return compose_args_for_anthropic_client(messages, model, instruction, stream)
    else:
        return compose_args_for_other_client(messages, model, instruction, stream)


def compose_args_for_other_client(
    messages: list[MessageModel],
    model: str,
    instruction: str | None = None,
    stream: bool = False,
) -> dict:
    arg_messages = []
    for message in messages:
        if message.role not in ["system", "instruction"]:
            content: list[dict] = []
            for c in message.content:
                if c.content_type == "text":
                    content.append(
                        {
                            "type": "text",
                            "text": c.body,
                        }
                    )
            m = {"role": message.role, "content": content}
            arg_messages.append(m)

    args = {
        **MISTRAL_GENERATION_CONFIG,
        "model": get_model_id(model),
        "messages": arg_messages,
        "stream": stream,
    }
    if instruction:
        args["system"] = instruction
    return args


def compose_args_for_anthropic_client(
    messages: list[MessageModel],
    model: str,
    instruction: str | None = None,
    stream: bool = False,
) -> dict:
    """Compose arguments for Anthropic client.
    Ref: https://docs.anthropic.com/claude/reference/messages_post
    """
    arg_messages = []
    for message in messages:
        if message.role not in ["system", "instruction"]:
            content: list[dict] = []
            for c in message.content:
                if c.content_type == "text":
                    content.append(
                        {
                            "type": "text",
                            "text": c.body,
                        }
                    )
                elif c.content_type == "image":
                    content.append(
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": c.media_type,
                                "data": c.body,
                            },
                        }
                    )
            m = {"role": message.role, "content": content}
            arg_messages.append(m)

    args = {
        **GENERATION_CONFIG,
        "model": get_model_id(model),
        "messages": arg_messages,
        "stream": stream,
    }
    if instruction:
        args["system"] = instruction
    return args


def calculate_price(
    model: str, input_tokens: int, output_tokens: int, region: str = BEDROCK_REGION
) -> float:
    input_price = (
        ANTHROPIC_PRICING.get(region, {})
        .get(model, {})
        .get("input", ANTHROPIC_PRICING["default"][model]["input"])
    )
    output_price = (
        ANTHROPIC_PRICING.get(region, {})
        .get(model, {})
        .get("output", ANTHROPIC_PRICING["default"][model]["output"])
    )

    return input_price * input_tokens / 1000.0 + output_price * output_tokens / 1000.0


def get_model_id(model: str) -> str:
    # Ref: https://docs.aws.amazon.com/bedrock/latest/userguide/model-ids-arns.html
    if model == "claude-v2":
        return "anthropic.claude-v2:1"
    elif model == "claude-instant-v1":
        return "anthropic.claude-instant-v1"
    elif model == "claude-v3-sonnet":
        return "anthropic.claude-3-sonnet-20240229-v1:0"
    elif model == "claude-v3-haiku":
        return "anthropic.claude-3-haiku-20240307-v1:0"
    elif model == "mistral-7b-instruct":
        return "mistral.mistral-7b-instruct-v0:2"
    elif model == "mixtral-8x7b-instruct":
        return "mistral.mixtral-8x7b-instruct-v0:1"
    elif model == "claude-v3-opus":
        return "anthropic.claude-3-opus-20240229-v1:0"
    else:
        raise NotImplementedError()


def calculate_query_embedding(question: str) -> list[float]:
    model_id = DEFAULT_EMBEDDING_CONFIG["model_id"]

    # Currently only supports "cohere.embed-multilingual-v3"
    assert model_id == "cohere.embed-multilingual-v3"

    payload = json.dumps({"texts": [question], "input_type": "search_query"})
    accept = "application/json"
    content_type = "application/json"

    response = client.invoke_model(
        accept=accept, contentType=content_type, body=payload, modelId=model_id
    )
    output = json.loads(response.get("body").read())
    embedding = output.get("embeddings")[0]

    return embedding


def calculate_document_embeddings(documents: list[str]) -> list[list[float]]:
    def _calculate_document_embeddings(documents: list[str]) -> list[list[float]]:
        payload = json.dumps({"texts": documents, "input_type": "search_document"})
        accept = "application/json"
        content_type = "application/json"

        response = client.invoke_model(
            accept=accept, contentType=content_type, body=payload, modelId=model_id
        )
        output = json.loads(response.get("body").read())
        embeddings = output.get("embeddings")

        return embeddings

    BATCH_SIZE = 10
    model_id = DEFAULT_EMBEDDING_CONFIG["model_id"]

    # Currently only supports "cohere.embed-multilingual-v3"
    assert model_id == "cohere.embed-multilingual-v3"

    embeddings = []
    for i in range(0, len(documents), BATCH_SIZE):
        # Split documents into batches to avoid exceeding the payload size limit
        batch = documents[i : i + BATCH_SIZE]
        embeddings += _calculate_document_embeddings(batch)

    return embeddings
