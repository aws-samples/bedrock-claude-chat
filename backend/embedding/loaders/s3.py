import os
import tempfile

import boto3
from embedding.loaders.base import BaseLoader, Document
from unstructured.partition.auto import partition
from unstructured.chunking.basic import chunk_elements
from pandas import read_csv, DataFrame


class S3FileLoader(BaseLoader):
    """Loads a document from a file in S3.
    Reference: `langchain_community.document_loaders.S3FileLoader` class
    """

    def __init__(self, bucket: str, key: str):
        self.bucket = bucket
        self.key = key
        self.reader = None

    def _get_reader(self) -> list:
        """Get elements."""
        s3 = boto3.client("s3")
        with tempfile.TemporaryDirectory() as temp_dir:
            file_path = f"{temp_dir}/{self.key}"
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            s3.download_file(self.bucket, self.key, file_path)
            if self.key.endswith(".csv"):
                return read_csv(
                    file_path,
                    iterator=True,
                    chunksize=1500,
                    low_memory=True
                )
            else:
                elements = partition(filename=file_path)
                # Unstructured is used for creating elements, so it should be used
                # for splitting
                chunks = chunk_elements(elements)
                return iter([DataFrame(chunks, columns=["text"])])

    def _get_metadata(self) -> dict:
        return {"source": f"s3://{self.bucket}/{self.key}"}

    def get_sources(self) -> list[str]:
        return [self._get_metadata()["source"]]

    def load(self) -> list[Document]:
        """Load file."""
        if self.reader is None:
            self.reader = self._get_reader()
        try:
            elements = next(self.reader, [])
            if len(elements) == 0:
                return []
            docs = []
            metadata = self._get_metadata()
            for i in elements.itertuples(index=False):
                row_metadata = i._asdict()
                content = ''
                for key, value in row_metadata.items():
                    if key == 'text':
                        content = value
                    else:
                        content += f" {key}: {value}\n"
                row_metadata.update(metadata)
                docs.append(
                    Document(
                        page_content=content,
                        metadata=row_metadata
                    )
                )
            return docs
        except StopIteration:
            return []
