import json
import logging
import os
from typing import Any, Iterator, Optional

from anthropic import AnthropicBedrock
from anthropic.types import ContentBlockDeltaEvent, MessageDeltaEvent, MessageStopEvent
from app.config import BEDROCK_PRICING, DEFAULT_EMBEDDING_CONFIG
from app.config import DEFAULT_GENERATION_CONFIG as DEFAULT_CLAUDE_GENERATION_CONFIG
from app.config import DEFAULT_MISTRAL_GENERATION_CONFIG
from app.repositories.models.conversation import ContentModel, MessageModel
from app.repositories.models.custom_bot import GenerationParamsModel
from app.routes.schemas.conversation import type_model_name
from app.utils import get_anthropic_client, get_bedrock_client, is_anthropic_model
from langchain_core.callbacks.manager import CallbackManagerForLLMRun
from langchain_core.language_models import LLM
from langchain_core.language_models.chat_models import BaseChatModel
from langchain_core.messages import BaseMessage
from langchain_core.outputs import GenerationChunk
from langchain_core.prompt_values import PromptValue
from langchain_core.prompts import BasePromptTemplate
from langchain_core.prompts import ChatPromptTemplate as LangChainChatPromptTemplate
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


class MyChatPromptTemplate(BasePromptTemplate):
    """A template for generating prompts for the LangChain's interface."""

    # messages: list[MessageModel]
    message_map: dict[str, MessageModel]
    parent_message_id: str | None

    def format(self) -> str:
        import pdb

        pdb.set_trace()
        return ""

    def format_prompt(self, **kwargs: Any) -> str:

        # return json.dumps([m.model_dump_json() for m in messages])

        tmp = {"parent_message_id": self.parent_message_id, "message_map": {}}
        for k, v in self.message_map.items():
            tmp["message_map"][k] = v.model_dump_json()
        return json.dumps(tmp)

    # @classmethod
    # def from_messages(cls, messages: list[MessageModel]) -> "MyChatPromptTemplate":
    #     return cls(input_variables=[], messages=messages)

    @classmethod
    def from_message_map(
        cls, message_map: dict[str, MessageModel], parent_message_id: str | None = None
    ) -> "MyChatPromptTemplate":
        return cls(
            input_variables=[],
            message_map=message_map,
            parent_message_id=parent_message_id,
        )


class BedrockLLM(LLM):
    """A wrapper class for the LangChain's interface."""

    model: type_model_name
    generation_params: GenerationParamsModel

    @classmethod
    def from_model(
        cls,
        model: type_model_name,
    ):
        generation_params = GenerationParamsModel(**DEFAULT_GENERATION_CONFIG)
        return cls(model=model, generation_params=generation_params)

    def __prepare_args_from_prompt(self, prompt: str, stream: bool) -> dict:
        """Prepare arguments from the given prompt."""
        message = MessageModel(
            role="user",
            content=[
                ContentModel(
                    content_type="text",
                    media_type=None,
                    body=prompt,
                )
            ],
            model=self.model,
            children=[],
            parent=None,
            create_time=0,
            feedback=None,
            used_chunks=None,
        )
        args = compose_args(
            [message],
            self.model,
            instruction=None,
            stream=stream,
            generation_params=self.generation_params,
        )
        return args

    def __reconstruct_message_map(self, prompt: str) -> dict[str, MessageModel]:
        parsed = json.loads(prompt)
        return {k: MessageModel(**json.loads(v)) for k, v in parsed.items()}

    def _call(
        self,
        prompt: str,
        stop: Optional[list[str]] = None,
        run_manager: Optional[CallbackManagerForLLMRun] = None,
        **kwargs: Any,
    ) -> str:
        parsed = json.loads(prompt)
        parent_message_id = parsed["parent_message_id"]
        message_map_json = parsed["message_map"]
        message_map = {
            k: MessageModel(**json.loads(v)) for k, v in message_map_json.items()
        }
        import pdb

        pdb.set_trace()
        from app.usecases.chat import trace_to_root

        messages = trace_to_root(node_id=parent_message_id, message_map=message_map)

        args = compose_args(
            messages,
            self.model,
            instruction=(
                message_map["instruction"].content[0].body
                if "instruction" in message_map
                else None
            ),
            stream=False,
            generation_params=self.generation_params,
        )
        if self.is_anthropic_model:
            client = get_anthropic_client()
            response = client.messages.create(**args)
            reply_txt = response.content[0].text
        else:
            response = get_bedrock_response(args)  # type: ignore
            reply_txt = response["outputs"][0]["text"]  # type: ignore
        return reply_txt

    def _stream(
        self,
        prompt: str,
        stop: Optional[list[str]] = None,
        run_manager: Optional[CallbackManagerForLLMRun] = None,
        **kwargs: Any,
    ) -> Iterator[GenerationChunk]:
        # args = self.__prepare_args_from_prompt(prompt, stream=True)
        messages = self.__reconstruct_messages(prompt)
        args = compose_args(
            messages,
            self.model,
            instruction=None,
            stream=True,
            generation_params=self.generation_params,
        )

        if self.is_anthropic_model:
            client = get_anthropic_client()
            response = client.messages.create(**args)
        else:
            response = get_bedrock_response(args)  # type: ignore
        if self.is_anthropic_model:
            stop_reason = ""
            for event in response:
                if isinstance(event, ContentBlockDeltaEvent):
                    chunk = GenerationChunk(text=event.delta.text)
                    if run_manager:
                        run_manager.on_llm_new_token(chunk.text, chunk=chunk)
                    yield chunk
                elif isinstance(event, MessageDeltaEvent):
                    logger.debug(f"Received message delta event: {event.delta}")
                    stop_reason = event.delta.stop_reason
                    continue
                elif isinstance(event, MessageStopEvent):
                    # Update total pricing
                    metrics = event.model_dump()["amazon-bedrock-invocationMetrics"]
                    input_token_count = metrics.get("inputTokenCount")
                    output_token_count = metrics.get("outputTokenCount")

                    logger.debug(
                        f"Input token count: {input_token_count}, output token count: {output_token_count}"
                    )

                    price = calculate_price(
                        self.model, input_token_count, output_token_count
                    )
                    yield GenerationChunk(
                        text="",
                        generation_info={
                            "stop_reason": stop_reason,
                            "input_token_count": input_token_count,
                            "output_token_count": output_token_count,
                            "price": price,
                        },
                    )
                else:
                    continue
        else:  # Mistral
            for event in response.get("body"):  # type: ignore
                chunk = event.get("chunk")
                if chunk:
                    msg_chunk = json.loads(chunk.get("bytes").decode())
                    is_stop = msg_chunk["outputs"][0]["stop_reason"]
                    if not is_stop:
                        msg = msg_chunk["outputs"][0]["text"]
                        generation_chunk = GenerationChunk(text=msg)
                        if run_manager:
                            run_manager.on_llm_new_token(
                                generation_chunk.text, generation_chunk=chunk
                            )
                        yield generation_chunk
                    else:
                        # Update total pricing
                        metrics = msg_chunk["amazon-bedrock-invocationMetrics"]
                        input_token_count = metrics.get("inputTokenCount")
                        output_token_count = metrics.get("outputTokenCount")

                        logger.debug(
                            f"Input token count: {input_token_count}, output token count: {output_token_count}"
                        )

                        price = calculate_price(
                            self.model, input_token_count, output_token_count
                        )
                        yield GenerationChunk(
                            text="",
                            generation_info={
                                "stop_reason": is_stop,
                                "input_token_count": input_token_count,
                                "output_token_count": output_token_count,
                                "price": price,
                            },
                        )

    @property
    def is_anthropic_model(self) -> bool:
        return is_anthropic_model(get_model_id(self.model))

    @property
    def _identifying_params(self) -> dict[str, any]:
        """Return a dictionary of identifying parameters."""
        return {
            # The model name allows users to specify custom token counting
            # rules in LLM monitoring applications (e.g., in LangSmith users
            # can provide per token pricing for their model and monitor
            # costs for the given LLM.)
            "model_name": "BedrockClaudeChatModel",
        }

    @property
    def _llm_type(self) -> str:
        """Get the type of language model used by this chat model. Used for logging purposes only."""
        return "bedrock-claude-chat"
