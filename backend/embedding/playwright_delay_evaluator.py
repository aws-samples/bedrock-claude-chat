import time
from typing import Optional

from langchain.document_loaders.url_playwright import PlaywrightEvaluator
from playwright.async_api import Browser as AsyncBrowser
from playwright.async_api import Page as AsyncPage
from playwright.async_api import Response as AsyncResponse
from playwright.sync_api import Browser, Page, Response


class DelayUnstructuredHtmlEvaluator(PlaywrightEvaluator):
    """UnstructuredHtmlEvaluator with delay."""

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
