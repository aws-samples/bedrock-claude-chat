import json
import logging
import os

from anthropic import AnthropicBedrock
from app.config import BEDROCK_PRICING, DEFAULT_EMBEDDING_CONFIG
from app.config import DEFAULT_GENERATION_CONFIG as DEFAULT_CLAUDE_GENERATION_CONFIG
from app.config import DEFAULT_MISTRAL_GENERATION_CONFIG
from app.repositories.models.conversation import MessageModel
from app.repositories.models.custom_bot import GenerationParamsModel
from app.utils import get_bedrock_client, is_anthropic_model
from pydantic import BaseModel

logger = logging.getLogger(__name__)

BEDROCK_REGION = os.environ.get("BEDROCK_REGION", "us-east-1")
ENABLE_MISTRAL = os.environ.get("ENABLE_MISTRAL", "") == "true"
DEFAULT_GENERATION_CONFIG = (
    DEFAULT_MISTRAL_GENERATION_CONFIG
    if ENABLE_MISTRAL
    else DEFAULT_CLAUDE_GENERATION_CONFIG
)

client = get_bedrock_client()
anthropic_client = AnthropicBedrock()


class InvocationMetrics(BaseModel):
    input_tokens: int
    output_tokens: int


def compose_args(
    messages: list[MessageModel],
    model: str,
    instruction: str | None = None,
    stream: bool = False,
    generation_params: GenerationParamsModel | None = None,
) -> dict:
    # if model is from Anthropic, use AnthropicBedrock
    # otherwise, use bedrock client
    model_id = get_model_id(model)
    if is_anthropic_model(model_id):
        return compose_args_for_anthropic_client(
            messages, model, instruction, stream, generation_params
        )
    else:
        return compose_args_for_other_client(
            messages, model, instruction, stream, generation_params
        )


def compose_args_for_other_client(
    messages: list[MessageModel],
    model: str,
    instruction: str | None = None,
    stream: bool = False,
    generation_params: GenerationParamsModel | None = None,
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
                elif c.content_type == "textAttachment":
                    content.append(
                        {
                            "type": "text",
                            "text": f"<attachment:{c.file_name}>{c.body}</attachment:{c.file_name}>",
                        }
                    )
            m = {"role": message.role, "content": content}
            arg_messages.append(m)

    args = {
        **DEFAULT_MISTRAL_GENERATION_CONFIG,
        **(
            {
                "max_tokens": generation_params.max_tokens,
                "top_k": generation_params.top_k,
                "top_p": generation_params.top_p,
                "temperature": generation_params.temperature,
                "stop_sequences": generation_params.stop_sequences,
            }
            if generation_params
            else {}
        ),
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
    generation_params: GenerationParamsModel | None = None,
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
                elif c.content_type == "textAttachment":
                    content.append(
                        {
                            "type": "text",
                            "text": f"<attachment:{c.file_name}>{c.body}</attachment:{c.file_name}>",
                        }
                    )
            m = {"role": message.role, "content": content}
            arg_messages.append(m)

    args = {
        **DEFAULT_GENERATION_CONFIG,
        **(
            {
                "max_tokens": generation_params.max_tokens,
                "top_k": generation_params.top_k,
                "top_p": generation_params.top_p,
                "temperature": generation_params.temperature,
                "stop_sequences": generation_params.stop_sequences,
            }
            if generation_params
            else {}
        ),
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
        BEDROCK_PRICING.get(region, {})
        .get(model, {})
        .get("input", BEDROCK_PRICING["default"][model]["input"])
    )
    output_price = (
        BEDROCK_PRICING.get(region, {})
        .get(model, {})
        .get("output", BEDROCK_PRICING["default"][model]["output"])
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
    elif model == "claude-v3-opus":
        return "anthropic.claude-3-opus-20240229-v1:0"
    elif model == "claude-v3.5-sonnet":
        return "anthropic.claude-3-5-sonnet-20240620-v1:0"
    elif model == "mistral-7b-instruct":
        return "mistral.mistral-7b-instruct-v0:2"
    elif model == "mixtral-8x7b-instruct":
        return "mistral.mixtral-8x7b-instruct-v0:1"
    elif model == "mistral-large":
        return "mistral.mistral-large-2402-v1:0"
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


def get_bedrock_response(args: dict) -> dict:
    client = get_bedrock_client()
    messages = args["messages"]

    prompt = "\n".join(
        [
            message["content"][0]["text"]
            for message in messages
            if message["content"][0]["type"] == "text"
        ]
    )

    model_id = args["model"]
    is_mistral_model = model_id.startswith("mistral")
    if is_mistral_model:
        prompt = f"<s>[INST] {prompt} [/INST]"

    logger.info(f"Final Prompt: {prompt}")
    body = json.dumps(
        {
            "prompt": prompt,
            "max_tokens": args["max_tokens"],
            "temperature": args["temperature"],
            "top_p": args["top_p"],
            "top_k": args["top_k"],
        }
    )

    logger.info(f"The args before invoke bedrock: {args}")
    if args["stream"]:
        try:
            response = client.invoke_model_with_response_stream(
                modelId=model_id,
                body=body,
            )
            # Ref: https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/bedrock-runtime/client/invoke_model_with_response_stream.html
            response_body = response
        except Exception as e:
            logger.error(e)
    else:
        response = client.invoke_model(
            modelId=model_id,
            body=body,
        )
        # Ref: https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/bedrock-runtime/client/invoke_model.html
        response_body = json.loads(response.get("body").read())
        invocation_metrics = InvocationMetrics(
            input_tokens=response["ResponseMetadata"]["HTTPHeaders"][
                "x-amzn-bedrock-input-token-count"
            ],
            output_tokens=response["ResponseMetadata"]["HTTPHeaders"][
                "x-amzn-bedrock-output-token-count"
            ],
        )
        response_body["amazon-bedrock-invocationMetrics"] = invocation_metrics
    return response_body
