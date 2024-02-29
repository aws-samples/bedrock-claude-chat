import json
import logging
import os

from anthropic import Anthropic
from app.config import ANTHROPIC_PRICING, EMBEDDING_CONFIG, GENERATION_CONFIG
from app.utils import get_bedrock_client

logger = logging.getLogger(__name__)

BEDROCK_REGION = os.environ.get("BEDROCK_REGION", "us-east-1")


client = get_bedrock_client()
anthropic_client = Anthropic()


def _create_body(model: str, prompt: str):
    if model in ("claude-instant-v1", "claude-v2"):
        parameter = GENERATION_CONFIG
        parameter["prompt"] = prompt
        return json.dumps(parameter)
    else:
        raise NotImplementedError()


def _extract_output_text(model: str, response) -> str:
    if model in ("claude-instant-v1", "claude-v2"):
        output = json.loads(response.get("body").read())
        output_txt = output["completion"]
        if output_txt[0] == " ":
            # claude outputs a space at the beginning of the text
            output_txt = output_txt[1:]
        return output_txt
    else:
        raise NotImplementedError()


def count_tokens(text: str) -> int:
    return anthropic_client.count_tokens(text)


def calculate_price(
    model: str, input_tokens: int, output_tokens: int, region: str = BEDROCK_REGION
) -> float:
    if region in ("us-east-1", "us-west-2", "ap-northeast-1"):
        input_price = ANTHROPIC_PRICING[region][model]["input"]
        output_price = ANTHROPIC_PRICING[region][model]["output"]

    else:
        logger.warning(f"Unsupported region: {region}. Using default pricing.")
        input_price = ANTHROPIC_PRICING["default"][model]["input"]
        output_price = ANTHROPIC_PRICING["default"][model]["output"]

    return input_price * input_tokens / 1000.0 + output_price * output_tokens / 1000.0


def get_model_id(model: str) -> str:
    # Ref: https://docs.aws.amazon.com/bedrock/latest/userguide/model-ids-arns.html
    if model == "claude-v2":
        return "anthropic.claude-v2:1"
    elif model == "claude-instant-v1":
        return "anthropic.claude-instant-v1"
    else:
        raise NotImplementedError()


def invoke(prompt: str, model: str) -> str:
    payload = _create_body(model, prompt)

    model_id = get_model_id(model)
    accept = "application/json"
    content_type = "application/json"

    response = client.invoke_model(
        body=payload, modelId=model_id, accept=accept, contentType=content_type
    )

    output_txt = _extract_output_text(model, response)

    return output_txt


def calculate_query_embedding(question: str) -> list[float]:
    model_id = EMBEDDING_CONFIG["model_id"]

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
    model_id = EMBEDDING_CONFIG["model_id"]

    # Currently only supports "cohere.embed-multilingual-v3"
    assert model_id == "cohere.embed-multilingual-v3"

    embeddings = []
    for i in range(0, len(documents), BATCH_SIZE):
        # Split documents into batches to avoid exceeding the payload size limit
        batch = documents[i : i + BATCH_SIZE]
        embeddings += _calculate_document_embeddings(batch)

    return embeddings
