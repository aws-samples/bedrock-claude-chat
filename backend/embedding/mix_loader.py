import time
from typing import Literal

import requests
from embedding.playwright_delay_evaluator import DelayUnstructuredHtmlEvaluator
from embedding.youtube_loader import YoutubeLoaderWithLangDetection, is_url_youtube
from langchain.document_loaders import PlaywrightURLLoader, UnstructuredURLLoader
from langchain.document_loaders.base import BaseLoader
from langchain_core.documents import Document

# Delay seconds to wait for the page to render by JavaScript.
DELAY_SEC = 2


def get_loader(loader_type: str, urls: list[str]) -> BaseLoader:
    map = {
        "web": PlaywrightURLLoader(
            urls=urls, evaluator=DelayUnstructuredHtmlEvaluator(delay_sec=DELAY_SEC)
        ),
        "unstructured": UnstructuredURLLoader(urls, request_timeout=30),
        "youtube": YoutubeLoaderWithLangDetection(urls),
    }
    return map[loader_type]


def check_content_type(url) -> Literal["web", "unstructured", "youtube"]:
    if is_url_youtube(url):
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
