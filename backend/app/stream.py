import json
import logging
from typing import Any, Callable, Generator, Optional

from anthropic.types import ContentBlockDeltaEvent, MessageDeltaEvent, MessageStopEvent
from app.bedrock import calculate_price, get_bedrock_response, get_model_id
from app.routes.schemas.conversation import type_model_name
from app.utils import get_anthropic_client, is_anthropic_model
from langchain_core.outputs import GenerationChunk
from pydantic import BaseModel

logger = logging.getLogger(__name__)


def get_stream_handler_type(model: type_model_name):
    model_id = get_model_id(model)
    if is_anthropic_model(model_id):
        return AnthropicStreamHandler
    else:
        return BedrockStreamHandler


class OnStopInput(BaseModel):
    full_token: str
    stop_reason: str
    input_token_count: int
    output_token_count: int
    price: float


class BaseStreamHandler:
    def __init__(
        self,
        model: type_model_name,
        on_stream: Callable[[str], GenerationChunk | None],
        on_stop: Callable[[OnStopInput], GenerationChunk | None],
    ):
        """Base class for stream handlers.
        :param model: Model name.
        :param on_stream: Callback function for streaming.
        :param on_stop: Callback function for stopping the stream.
        """
        self.model = model
        self.on_stream = on_stream
        self.on_stop = on_stop

    def run(self, args: dict):
        raise NotImplementedError()

    @classmethod
    def from_model(cls, model: type_model_name):
        return get_stream_handler_type(model)(
            model=model, on_stream=lambda x: None, on_stop=lambda x: None
        )

    def bind(
        self, on_stream: Callable[[str], Any], on_stop: Callable[[OnStopInput], Any]
    ):
        self.on_stream = on_stream
        self.on_stop = on_stop
        return self


class AnthropicStreamHandler(BaseStreamHandler):
    """Stream handler for Anthropic models."""

    def run(self, args: dict):
        client = get_anthropic_client()
        response = client.messages.create(**args)
        completions = []
        stop_reason = ""
        for event in response:
            # NOTE: following is the example of event sequence:
            # MessageStartEvent(message=Message(id='compl_01GwmkwncsptaeBopeaR4eWE', content=[], model='claude-instant-1.2', role='assistant', stop_reason=None, stop_sequence=None, type='message', usage=Usage(input_tokens=21, output_tokens=1)), type='message_start')
            # ContentBlockStartEvent(content_block=ContentBlock(text='', type='text'), index=0, type='content_block_start')
            # ...
            # ContentBlockDeltaEvent(delta=TextDelta(text='です', type='text_delta'), index=0, type='content_block_delta')
            # ContentBlockStopEvent(index=0, type='content_block_stop')
            # MessageDeltaEvent(delta=Delta(stop_reason='end_turn', stop_sequence=None), type='message_delta', usage=MessageDeltaUsage(output_tokens=26))
            # MessageStopEvent(type='message_stop', amazon-bedrock-invocationMetrics={'inputTokenCount': 21, 'outputTokenCount': 25, 'invocationLatency': 621, 'firstByteLatency': 279})
            if isinstance(event, ContentBlockDeltaEvent):
                completions.append(event.delta.text)
                response = self.on_stream(event.delta.text)
                yield response
            elif isinstance(event, MessageDeltaEvent):
                logger.debug(f"Received message delta event: {event.delta}")
                stop_reason = str(event.delta.stop_reason)
            elif isinstance(event, MessageStopEvent):
                concatenated = "".join(completions)
                metrics = event.model_dump()["amazon-bedrock-invocationMetrics"]
                input_token_count = metrics.get("inputTokenCount")
                output_token_count = metrics.get("outputTokenCount")
                price = calculate_price(
                    self.model, input_token_count, output_token_count
                )
                response = self.on_stop(
                    OnStopInput(
                        full_token=concatenated.rstrip(),
                        stop_reason=stop_reason,
                        input_token_count=input_token_count,
                        output_token_count=output_token_count,
                        price=price,
                    )
                )
                yield response
            else:
                continue


class BedrockStreamHandler(BaseStreamHandler):
    """Stream handler for Bedrock models (e.g. Mistral)."""

    def run(self, args: dict):
        response = get_bedrock_response(args)
        completions = []
        stop_reason = ""
        for event in response.get("body"):  # type: ignore
            chunk = event.get("chunk")
            if chunk:
                msg_chunk = json.loads(chunk.get("bytes").decode())
                stop_reason = msg_chunk["outputs"][0]["stop_reason"]
                if not stop_reason:
                    msg: str = msg_chunk["outputs"][0]["text"]
                    completions.append(msg)
                    res = self.on_stream(msg)
                    yield res
                else:
                    concatenated = "".join(completions)
                    metrics = msg_chunk["amazon-bedrock-invocationMetrics"]
                    input_token_count = metrics.get("inputTokenCount")
                    output_token_count = metrics.get("outputTokenCount")
                    price = calculate_price(
                        self.model, input_token_count, output_token_count
                    )
                    res = self.on_stop(
                        OnStopInput(
                            full_token=concatenated.rstrip(),
                            stop_reason=stop_reason,
                            input_token_count=input_token_count,
                            output_token_count=output_token_count,
                            price=price,
                        )
                    )
                    yield res
