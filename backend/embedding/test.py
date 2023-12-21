import json
import os
import time
from ast import List
from typing import Optional

import boto3
import nest_asyncio
import xmltodict
from langchain.document_loaders import (
    PlaywrightURLLoader,
    SeleniumURLLoader,
    SitemapLoader,
    UnstructuredURLLoader,
    WebBaseLoader,
    YoutubeLoader,
)
from langchain.document_loaders.url_playwright import PlaywrightEvaluator
from langchain.embeddings.bedrock import BedrockEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from lxml import etree
from playwright.async_api import Browser as AsyncBrowser
from playwright.async_api import Page as AsyncPage
from playwright.async_api import Response as AsyncResponse
from playwright.sync_api import Browser, Page, Response

nest_asyncio.apply()

BEDROCK_REGION = os.environ.get("BEDROCK_REGION", "us-east-1")
MODEL_ID = os.environ.get("MODEL_ID", "cohere.embed-multilingual-v3")
CHUNK_SIZE = int(os.environ.get("CHUNK_SIZE", 1000))
CHUNK_OVERLAP = int(os.environ.get("CHUNK_OVERLAP", 100))


class DelayUnstructuredHtmlEvaluator(PlaywrightEvaluator):
    """UnstructuredHtmlEvaluatorの拡張"""

    def __init__(
        self, remove_selectors: Optional[list[str]] = None, delay_sec: int = 0
    ):
        """Initialize UnstructuredHtmlEvaluator."""
        try:
            import unstructured  # noqa:F401
        except ImportError:
            raise ImportError(
                "unstructured package not found, please install it with "
                "`pip install unstructured`"
            )

        self.remove_selectors = remove_selectors
        self.delay_sec = delay_sec

    def evaluate(self, page: "Page", browser: "Browser", response: "Response") -> str:
        """Synchronously process the HTML content of the page."""
        from unstructured.partition.html import partition_html

        for selector in self.remove_selectors or []:
            elements = page.locator(selector).all()
            for element in elements:
                if element.is_visible():
                    element.evaluate("element => element.remove()")

        # Delay to wait for the page to load.
        time.sleep(self.delay_sec)

        page_source = page.content()
        elements = partition_html(text=page_source)
        return "\n\n".join([str(el) for el in elements])

    async def evaluate_async(
        self, page: "AsyncPage", browser: "AsyncBrowser", response: "AsyncResponse"
    ) -> str:
        """Asynchronously process the HTML content of the page."""
        from unstructured.partition.html import partition_html

        for selector in self.remove_selectors or []:
            elements = await page.locator(selector).all()
            for element in elements:
                if await element.is_visible():
                    await element.evaluate("element => element.remove()")

        # Delay to wait for the page to load.
        time.sleep(self.delay_sec)

        page_source = await page.content()
        elements = partition_html(text=page_source)
        return "\n\n".join([str(el) for el in elements])


def get_extension(url: str) -> str:
    """Get the extension of a URL."""
    return os.path.splitext(url)[1]


def get_loader_from_url(url: str):
    if url.startswith("https://www.youtube.com/watch?v="):
        # if the url is a Youtube video
        video_id = url.split("https://www.youtube.com/watch?v=")[1]
        return YoutubeLoader(video_id, language="ja")

    extension = get_extension(url)
    if extension in [".html", ".htm", ""]:
        # if the url is HTML document
        return PlaywrightURLLoader(
            [url], evaluator=DelayUnstructuredHtmlEvaluator(delay_sec=3)
        )
    else:
        return UnstructuredURLLoader([url])


if __name__ == "__main__":
    # bedrock = boto3.client(service_name="bedrock", region_name=BEDROCK_REGION)
    # json_data = bedrock.list_foundation_models()
    # model_ids = [
    #     model_summary["modelId"] for model_summary in json_data["modelSummaries"]
    # ]
    # print(model_ids)

    # loader = SitemapLoader(web_path="https://python.langchain.com/sitemap.xml")
    # loader = SitemapLoader(web_path="https://www.anthropic.com/sitemaps-1-sitemap.xml")
    # loader.requests_per_second = 1
    # documents = loader.load()

    # urls = [
    #     "https://catalog.us-east-1.prod.workshops.aws/workshops/ee59d21b-4cb8-4b3d-a629-24537cf37bb5/ja-JP/lab6/etl/basic-transform",
    # ]
    # urls = [
    #     "https://pages.awscloud.com/rs/112-TZM-766/images/AWS-Black-Belt_2023_AmazonMSK_0430_v1.pdf"
    # ]
    # loader = PlaywrightURLLoader(
    #     urls,
    #     evaluator=DelayUnstructuredHtmlEvaluator(delay_sec=3),
    # )
    # loader = UnstructuredURLLoader(urls)
    # documents = loader.load()

    # loader = YoutubeLoader("Num0CJt4Mc0", language="ja")
    # documents = loader.load()

    # url = "https://catalog.us-east-1.prod.workshops.aws/workshops/ee59d21b-4cb8-4b3d-a629-24537cf37bb5/ja-JP/lab6/etl/basic-transform"
    # url = "https://pages.awscloud.com/rs/112-TZM-766/images/AWS-Black-Belt_2023_AmazonMSK_0430_v1.pdf"
    # url = "https://dev.classmethod.jp/articles/python-parse-html/"
    # url = "https://www.youtube.com/watch?v=Num0CJt4Mc0"
    # url = "https://allardqjy.medium.com/using-pre-signed-urls-to-upload-files-to-amazon-s3-from-reactjs-5b15c94b66df"
    url = "https://data.wa.gov/api/views/f6w7-q2d2/rows.csv"
    loader = get_loader_from_url(url)
    print(type(loader))
    documents = loader.load()

    print(documents)

    # Use chunk_size of 1000.
    # We felt that the answer we would be looking for would be
    # around 200 words, or around 1000 characters.
    # This parameter can be modified based on your documents and use case.
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE, chunk_overlap=CHUNK_OVERLAP, length_function=len
    )
    texts = text_splitter.split_documents(documents)
    print(f"length of texts: {len(texts)}")
    print(f"first metadata: {texts[0].metadata}")
    print(f"first source: {texts[0].metadata['source']}")
    print(f"first contents: {texts[0].page_content}")

    # embeddings_model = BedrockEmbeddings(
    #     client=boto3.client("bedrock-runtime", BEDROCK_REGION), model_id=MODEL_ID
    # )
    # print("Embedding...")
    # embeddings = embeddings_model.embed_documents([t.page_content for t in texts])
    # print("Done embedding.")
    # print(f"length of embeddings: {len(embeddings)}")
    # print(f"length of vector: {len(embeddings[0])}")
    # print(f"first embedding: {embeddings[0]}")
