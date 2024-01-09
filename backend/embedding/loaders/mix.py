import time
from typing import Literal

import requests
from embedding.loaders.base import BaseLoader, Document

# from embedding.loaders.playwright import (
#     DelayUnstructuredHtmlEvaluator,
#     PlaywrightURLLoader,
# )
from embedding.loaders.url import UnstructuredURLLoader
from embedding.loaders.youtube import YoutubeLoaderWithLangDetection, _parse_video_id

# Delay seconds to wait for the page to render by JavaScript.
DELAY_SEC = 2


def get_loader(loader_type: str, urls: list[str]) -> BaseLoader:
    map = {
        # "web": PlaywrightURLLoader(
        #     urls=urls, evaluator=DelayUnstructuredHtmlEvaluator(delay_sec=DELAY_SEC)
        # ),
        "web": UnstructuredURLLoader(urls, request_timeout=30),
        "unstructured": UnstructuredURLLoader(urls, request_timeout=30),
        "youtube": YoutubeLoaderWithLangDetection(urls),
    }
    return map[loader_type]


def check_content_type(url) -> Literal["web", "unstructured", "youtube"]:
    if _parse_video_id(url):
        return "youtube"

    response = requests.head(url, timeout=30)
    response.raise_for_status()

    content_type = response.headers.get("Content-Type", "").lower()

    if "text/html" in content_type:
        return "web"
    else:
        return "unstructured"


def group_urls_by_content_type(urls: list[str]) -> dict:
    res = {
        "web": [],
        "unstructured": [],
        "youtube": [],
    }
    for url in urls:
        content_type = check_content_type(url)
        res[content_type].append(url)

        time.sleep(1)

    return res


class MixLoader(BaseLoader):
    """Loads a document from a URL."""

    def __init__(self, urls: list[str]):
        self._urls = urls

    def load(self) -> list[Document]:
        res = []
        categorized_urls = group_urls_by_content_type(self._urls)
        for loader_type, urls in categorized_urls.items():
            loader = get_loader(loader_type, urls)
            documents = loader.load()
            res.extend(documents)

        return res
