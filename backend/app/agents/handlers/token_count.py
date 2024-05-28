import threading
from contextlib import contextmanager
from contextvars import ContextVar
from pprint import pprint
from typing import Any, Dict, Generator, List, Optional

from langchain_core.callbacks.base import BaseCallbackHandler
from langchain_core.outputs import LLMResult


class TokenCountCallbackHandler(BaseCallbackHandler):
    """Token Count Callback Handler. This can be used to count the total number of tokens include Agent chain.
    Reference: https://github.com/langchain-ai/langchain/blob/09919c2cd5398068c43662ff3acf2f5c21c35747/libs/community/langchain_community/callbacks/openai_info.py#L171
    """

    total_input_token_count: int = 0
    total_output_token_count: int = 0
    total_cost: float = 0.0

    def __init__(self):
        super().__init__()
        self._lock = threading.Lock()

    def __repr__(self) -> str:
        return (
            f"\tTotal Input Token Count: {self.total_input_token_count}\n"
            f"\tTotal Output Token Count: {self.total_output_token_count}\n"
            f"Total Cost (USD): ${self.total_cost}"
        )

    def on_llm_start(
        self, serialized: Dict[str, Any], prompts: List[str], **kwargs: Any
    ) -> None:
        """Print out the prompts."""
        pass

    def on_llm_new_token(self, token: str, **kwargs: Any) -> None:
        """Print out the token."""
        pass

    def on_llm_end(self, response: LLMResult, **kwargs: Any) -> None:
        generation_info = response.generations[0][0].generation_info
        if generation_info is None:
            return

        # update shared state behind lock
        with self._lock:
            self.total_input_token_count += generation_info["input_token_count"]
            self.total_output_token_count += generation_info["output_token_count"]
            self.total_cost += generation_info["price"]


token_count_callback_var: ContextVar[Optional[TokenCountCallbackHandler]] = ContextVar(
    "token_count_callback", default=None
)


@contextmanager
def get_token_count_callback() -> Generator[TokenCountCallbackHandler, None, None]:
    """Context manager to get the token count callback handler."""
    cb = TokenCountCallbackHandler()
    token_count_callback_var.set(cb)
    yield cb
    token_count_callback_var.set(None)
