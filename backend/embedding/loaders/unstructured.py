"""Loader that uses unstructured to load HTML files."""

import logging
import time
from typing import Any, List

from embedding.loaders.base import BaseLoader, Document
from unstructured.partition.auto import partition

logger = logging.getLogger(__name__)


class UnstructuredURLLoader(BaseLoader):
    """Load files from remote URLs using `Unstructured`.
    Reference: `langchain_community.document_loaders.UnstructuredURLLoader` class
    """

    def __init__(
        self,
        urls: List[str],
        continue_on_failure: bool = True,
        mode: str = "single",
        show_progress_bar: bool = False,
        **unstructured_kwargs: Any,
    ):
        """Initialize with file path."""
        self._validate_mode(mode)
        self.mode = mode

        headers = unstructured_kwargs.pop("headers", {})
        self.urls = urls
        self.continue_on_failure = continue_on_failure
        self.headers = headers
        self.unstructured_kwargs = unstructured_kwargs
        self.show_progress_bar = show_progress_bar

    def _validate_mode(self, mode: str) -> None:
        _valid_modes = {"single", "elements"}
        if mode not in _valid_modes:
            raise ValueError(
                f"Got {mode} for `mode`, but should be one of `{_valid_modes}`"
            )

    def load(self) -> List[Document]:
        """Load file."""
        docs: List[Document] = list()
        if self.show_progress_bar:
            try:
                from tqdm import tqdm
            except ImportError as e:
                raise ImportError(
                    "Package tqdm must be installed if show_progress_bar=True. "
                    "Please install with 'pip install tqdm' or set "
                    "show_progress_bar=False."
                ) from e

            urls = tqdm(self.urls)
        else:
            urls = self.urls

        for url in urls:
            try:
                elements = partition(
                    url=url, headers=self.headers, **self.unstructured_kwargs
                )
            except Exception as e:
                if self.continue_on_failure:
                    logger.error(f"Error fetching or processing {url}, exception: {e}")
                    continue
                else:
                    raise e

            if self.mode == "single":
                text = "\n\n".join([str(el) for el in elements])
                metadata = {"source": url}
                docs.append(Document(page_content=text, metadata=metadata))
            elif self.mode == "elements":
                for element in elements:
                    metadata = element.metadata.to_dict()
                    metadata["category"] = element.category
                    docs.append(Document(page_content=str(element), metadata=metadata))

        return docs
