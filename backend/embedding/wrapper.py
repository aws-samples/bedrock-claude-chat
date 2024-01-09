from app.bedrock import calculate_document_embeddings
from embedding.loaders.base import BaseLoader, Document
from llama_index.node_parser import TextSplitter


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

    def embed_documents(self, documents: list[Document]) -> list[list[float]]:
        if self.verbose:
            print("Embedding...")
        embeddings = calculate_document_embeddings([d.page_content for d in documents])
        if self.verbose:
            print("Done embedding.")
        return embeddings
