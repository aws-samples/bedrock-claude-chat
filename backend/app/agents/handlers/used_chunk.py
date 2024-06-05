import threading
from contextlib import contextmanager
from contextvars import ContextVar
from pprint import pprint
from typing import Any, Dict, Generator, List, Optional

from app.repositories.models.conversation import ChunkModel
from app.vector_search import SearchResult, filter_used_results, get_source_link
from langchain_core.callbacks.base import BaseCallbackHandler
from langchain_core.outputs import LLMResult


class UsedChunkCallbackHandler(BaseCallbackHandler):
    """This handler is used to hold the used chunk of the response."""

    def __init__(self):
        super().__init__()
        self.used_chunks = None

    def on_tool_end(self, output: Any, **kwargs: Any) -> None:
        """Save the used chunks."""
        search_results: list[SearchResult] = output["search_results"]
        if len(search_results) > 0:
            self.used_chunks = []
            for r in filter_used_results(output, search_results):
                content_type, source_link = get_source_link(r.source)
                self.used_chunks.append(
                    ChunkModel(
                        content=r.content,
                        content_type=content_type,
                        source=source_link,
                        rank=r.rank,
                    )
                )


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
