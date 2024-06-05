import logging
import time
from abc import ABC, abstractmethod
from typing import TYPE_CHECKING

from embedding.loaders.base import BaseLoader, Document

logger = logging.getLogger(__name__)

if TYPE_CHECKING:
    from playwright.async_api import Browser as AsyncBrowser
    from playwright.async_api import Page as AsyncPage
    from playwright.async_api import Response as AsyncResponse
    from playwright.sync_api import Browser, Page, Response


class PlaywrightEvaluator(ABC):
    """Abstract base class for all evaluators.

    Each evaluator should take a page, a browser instance, and a response
    object, process the page as necessary, and return the resulting text.
    """

    @abstractmethod
    def evaluate(self, page: "Page", browser: "Browser", response: "Response") -> str:
        """Synchronously process the page and return the resulting text.

        Args:
            page: The page to process.
            browser: The browser instance.
            response: The response from page.goto().

        Returns:
            text: The text content of the page.
        """
        pass

    @abstractmethod
    async def evaluate_async(
        self, page: "AsyncPage", browser: "AsyncBrowser", response: "AsyncResponse"
    ) -> str:
        """Asynchronously process the page and return the resulting text.

        Args:
            page: The page to process.
            browser: The browser instance.
            response: The response from page.goto().

        Returns:
            text: The text content of the page.
        """
        pass


class DelayUnstructuredHtmlEvaluator(PlaywrightEvaluator):
    """UnstructuredHtmlEvaluator with delay."""

    def __init__(self, remove_selectors: list[str] | None = None, delay_sec: int = 0):
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


class PlaywrightURLLoader(BaseLoader):
    """Load `HTML` pages with `Playwright` and parse with `Unstructured`.

    This is useful for loading pages that require javascript to render.

    Attributes:
        urls (List[str]): List of URLs to load.
        continue_on_failure (bool): If True, continue loading other URLs on failure.
        headless (bool): If True, the browser will run in headless mode.
    """

    def __init__(
        self,
        urls: list[str],
        continue_on_failure: bool = True,
        headless: bool = True,
        remove_selectors: list[str] | None = None,
        evaluator: PlaywrightEvaluator | None = None,
    ):
        """Load a list of URLs using Playwright."""
        self.urls = urls
        self.continue_on_failure = continue_on_failure
        self.headless = headless

        if remove_selectors and evaluator:
            raise ValueError(
                "`remove_selectors` and `evaluator` cannot be both not None"
            )
        self.evaluator = evaluator or DelayUnstructuredHtmlEvaluator(
            remove_selectors, delay_sec=2
        )

    def load(self) -> list[Document]:
        """Load the specified URLs using Playwright and create Document instances.

        Returns:
            List[Document]: A list of Document instances with loaded content.
        """
        from playwright.sync_api import sync_playwright

        docs: list[Document] = list()

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=self.headless)
            for url in self.urls:
                try:
                    page = browser.new_page()
                    response = page.goto(url)
                    if response is None:
                        raise ValueError(f"page.goto() returned None for url {url}")

                    text = self.evaluator.evaluate(page, browser, response)
                    metadata = {"source": url}
                    docs.append(Document(page_content=text, metadata=metadata))
                    page.close()
                except Exception as e:
                    if self.continue_on_failure:
                        logger.error(
                            f"Error fetching or processing {url}, exception: {e}"
                        )
                    else:
                        raise e
            browser.close()
        return docs
