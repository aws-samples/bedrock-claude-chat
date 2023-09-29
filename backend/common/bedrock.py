import json
import os

import boto3
from config import GENERATION_CONFIG
from utils import get_bedrock_client

client = get_bedrock_client()


def _create_body(model: str, prompt: str):
    if model == "claude":
        parameter = GENERATION_CONFIG
        parameter["prompt"] = prompt
        return json.dumps(parameter)
    else:
        raise NotImplementedError()


def _extract_output_text(model: str, response) -> str:
    if model == "claude":
        output = json.loads(response.get("body").read())
        output_txt = output["completion"]
        if output_txt[0] == " ":
            # claude outputs a space at the beginning of the text
            output_txt = output_txt[1:]
        return output_txt
    else:
        raise NotImplementedError()


def get_model_id(model: str) -> str:
    if model == "claude":
        return "anthropic.claude-v2"
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
