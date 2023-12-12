import json

from app.config import EMBEDDING_CONFIG, GENERATION_CONFIG
from app.utils import get_bedrock_client

client = get_bedrock_client()


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


def get_model_id(model: str) -> str:
    # Ref: https://docs.aws.amazon.com/bedrock/latest/userguide/model-ids-arns.html
    if model == "claude-v2":
        return "anthropic.claude-v2"
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


def calculate_embeddings(question: str) -> list[float]:
    payload = json.dumps({"inputText": question}).encode("utf-8")
    accept = "application/json"
    content_type = "application/json"

    response = client.invoke_model(
        accept=accept,
        contentType=content_type,
        body=payload,
        modelId=EMBEDDING_CONFIG["model_id"],
    )
    output = json.loads(response.get("body").read())
    embedding = output.get("embedding")

    return embedding
