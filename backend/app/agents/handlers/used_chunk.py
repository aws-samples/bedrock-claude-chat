import threading
from contextlib import contextmanager
from contextvars import ContextVar
from pprint import pprint
from typing import Any, Dict, Generator, List, Optional

from app.repositories.models.conversation import ChunkModel
from app.vector_search import SearchResult
from langchain_core.callbacks.base import BaseCallbackHandler


class UsedChunkCallbackHandler(BaseCallbackHandler):
    """This handler is used to hold the used chunk of the response."""

    def __init__(self):
        super().__init__()
        self.used_chunks = None

    def on_tool_end(self, output: Any, **kwargs: Any) -> None:
        """Save the used chunks."""
        search_results: list[SearchResult] = output.get("search_results")
        if search_results is None:
            return
        self.used_chunks = [
            ChunkModel(
                content=r.content,
                source=r.source,
                rank=r.rank,
            )
            for r in search_results
        ]


used_chunk_callback_var: ContextVar[Optional[UsedChunkCallbackHandler]] = ContextVar(
    "used_chunk_callback", default=None
)


@contextmanager
def get_used_chunk_callback() -> Generator[UsedChunkCallbackHandler, None, None]:
    """Context manager to get the used chunk callback handler."""
    cb = UsedChunkCallbackHandler()
    used_chunk_callback_var.set(cb)
    yield cb
    used_chunk_callback_var.set(None)
