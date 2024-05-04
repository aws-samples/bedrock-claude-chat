import logging

from app.bedrock import calculate_document_embeddings
from embedding.loaders.base import BaseLoader, Document
from llama_index.core.node_parser import TextSplitter

logger = logging.getLogger(__name__)


class DocumentSplitter:
    """Thin wrapper for `llama_index.TextSplitter` to split documents."""

    def __init__(self, splitter: TextSplitter):
        self.splitter = splitter

    def split_documents(self, documents: list[Document]) -> list[Document]:
        res = []
        for document in documents:
            splitted_content = self.splitter.split_text(document.page_content)
            for content in splitted_content:
                res.append(Document(page_content=content, metadata=document.metadata))
        return res


class Embedder:
    """Thin wrapper class to calculate embeddings by Bedrock API."""

    def __init__(self, verbose=False):
        self.verbose = verbose

    def print_documents_summary(self, documents: list[Document]):
        for i, d in enumerate(documents):
            logger.info(f"{i}th document metadata: {d.metadata}")
            logger.info(f"{i}th document content length: {len(d.page_content)}")
            logger.info(f"{i}th document head of content: {d.page_content[:30]}")

    def embed_documents(self, documents: list[Document]) -> list[list[float]]:
        if self.verbose:
            logger.info(f"Embedding {len(documents)} documents.")
            self.print_documents_summary(documents)
        embeddings = calculate_document_embeddings([d.page_content for d in documents])
        if self.verbose:
            logger.info("Done embedding.")
        return embeddings
