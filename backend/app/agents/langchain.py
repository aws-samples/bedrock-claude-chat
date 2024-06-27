"""LangChain adaptor stuffs.
"""

import logging
import os
from typing import Any, Iterator, Optional

from anthropic.types import ContentBlockDeltaEvent, MessageDeltaEvent, MessageStopEvent
from app.bedrock import (
    calculate_price,
    compose_args,
    get_bedrock_response,
    get_model_id,
)
from app.config import DEFAULT_GENERATION_CONFIG as DEFAULT_CLAUDE_GENERATION_CONFIG
from app.config import DEFAULT_MISTRAL_GENERATION_CONFIG
from app.repositories.models.conversation import ContentModel, MessageModel
from app.repositories.models.custom_bot import GenerationParamsModel
from app.routes.schemas.conversation import type_model_name
from app.stream import BaseStreamHandler, OnStopInput, get_stream_handler_type
from app.utils import get_anthropic_client, is_anthropic_model
from langchain_core.callbacks.manager import CallbackManagerForLLMRun
from langchain_core.language_models import LLM
from langchain_core.outputs import GenerationChunk

logger = logging.getLogger(__name__)

ENABLE_MISTRAL = os.environ.get("ENABLE_MISTRAL", "") == "true"
DEFAULT_GENERATION_CONFIG = (
    DEFAULT_MISTRAL_GENERATION_CONFIG
    if ENABLE_MISTRAL
    else DEFAULT_CLAUDE_GENERATION_CONFIG
)


class BedrockLLM(LLM):
    """A wrapper class for the LangChain's interface.
    Note that this class only handle simple prompt template and can not handle multi-tern conversation.
    Reason is that LangChain's interface and Bedrock Claude Chat interface are not fully compatible.
    """

    model: type_model_name
    generation_params: GenerationParamsModel
    stream_handler: BaseStreamHandler

    @classmethod
    def from_model(
        cls,
        model: type_model_name,
        generation_params: Optional[GenerationParamsModel] = None,
    ):
        generation_params = generation_params or GenerationParamsModel(
            **DEFAULT_GENERATION_CONFIG
        )
        stream_handler = get_stream_handler_type(model).from_model(model)
        return cls(
            model=model,
            generation_params=generation_params,
            stream_handler=stream_handler,
        )

    def __prepare_args_from_prompt(self, prompt: str, stream: bool) -> dict:
        """Prepare arguments from the given prompt."""
        message = MessageModel(
            role="user",
            content=[
                ContentModel(
                    content_type="text",
                    media_type=None,
                    body=prompt,
                    file_name=None,
                )
            ],
            model=self.model,
            children=[],
            parent=None,
            create_time=0,
            feedback=None,
            used_chunks=None,
            thinking_log=None,
        )
        args = compose_args(
            [message],
            self.model,
            instruction=None,
            stream=stream,
            generation_params=self.generation_params,
        )
        return args

    def _call(
        self,
        prompt: str,
        stop: Optional[list[str]] = None,
        run_manager: Optional[CallbackManagerForLLMRun] = None,
        **kwargs: Any,
    ) -> str:
        args = self.__prepare_args_from_prompt(prompt, stream=False)
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
        args = self.__prepare_args_from_prompt(prompt, stream=True)

        def _on_stream(token: str, **kwargs) -> GenerationChunk:
            if run_manager:
                run_manager.on_llm_new_token(token)

            chunk = GenerationChunk(text=token)
            return chunk

        def _on_stop(arg: OnStopInput, **kwargs) -> GenerationChunk:
            chunk = GenerationChunk(
                text="",
                generation_info={
                    "stop_reason": arg.stop_reason,
                    "input_token_count": arg.input_token_count,
                    "output_token_count": arg.output_token_count,
                    "price": arg.price,
                },
            )
            return chunk

        self.stream_handler.bind(on_stream=_on_stream, on_stop=_on_stop)

        yield from self.stream_handler.run(args)

    @property
    def is_anthropic_model(self) -> bool:
        return is_anthropic_model(get_model_id(self.model))

    @property
    def _identifying_params(self) -> dict[str, Any]:
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
