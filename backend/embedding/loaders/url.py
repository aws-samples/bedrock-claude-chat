import logging
import urllib.error
import urllib.request
from typing import Literal

from embedding.loaders.base import BaseLoader, Document
from embedding.loaders.playwright import (
    DelayUnstructuredHtmlEvaluator,
    PlaywrightURLLoader,
)
from embedding.loaders.unstructured import UnstructuredURLLoader
from embedding.loaders.youtube import YoutubeLoaderWithLangDetection, _parse_video_id

logger = logging.getLogger(__name__)

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
    if _parse_video_id(url):
        return "youtube"

    # Using urllib.request instead of requests to avoid 403
    # Ref: https://stackoverflow.com/questions/74446830/how-to-fix-403-forbidden-errors-with-python-requests-even-with-user-agent-head
    req = urllib.request.Request(url, method="HEAD")
    req.add_header(
        "User-Agent",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:106.0) Gecko/20100101 Firefox/106.0",
    )
    req.add_header("Accept", "*/*")
    req.add_header("Accept-Language", "*")

    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            content_type = response.headers.get("Content-Type", "").lower()
    except Exception as e:
        logger.warning(
            f"Failed to get content type of {url}: {e}. Use unstructured to load."
        )
        return "unstructured"

    if "text/html" in content_type:
        return "web"
    else:
        return "unstructured"


def group_urls_by_content_type(urls: list[str]) -> dict:
    res: dict = {
        "web": [],
        "unstructured": [],
        "youtube": [],
    }
    for url in urls:
        content_type = check_content_type(url)
        res[content_type].append(url)

    return res


class UrlLoader(BaseLoader):
    """Loads a document from a URL."""

    def __init__(self, urls: list[str]):
        self._urls = urls

    def load(self) -> list[Document]:
        res = []
        categorized_urls = group_urls_by_content_type(self._urls)
        logger.info(f"URLs are categorized as: {categorized_urls}")

        for loader_type, urls in categorized_urls.items():
            loader = get_loader(loader_type, urls)
            documents = loader.load()
            res.extend(documents)

        return res
