import os
import tempfile
import logging
import boto3
from distutils.util import strtobool
from embedding.loaders.base import BaseLoader, Document
from unstructured.partition.auto import partition
from unstructured.partition.pdf import partition_pdf

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)


class S3FileLoader(BaseLoader):
    """Loads a document from a file in S3.
    Reference: `langchain_community.document_loaders.S3FileLoader` class
    """

    def __init__(
        self,
        bucket: str,
        key: str,
        mode: str = "single",
        enable_partition_pdf: bool = False,
    ):
        self.bucket = bucket
        self.key = key
        self.mode = mode
        self.enable_partition_pdf = enable_partition_pdf

    def _get_elements(self) -> list:
        """Get elements."""
        s3 = boto3.client("s3")
        with tempfile.TemporaryDirectory() as temp_dir:
            file_path = f"{temp_dir}/{self.key}"
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            s3.download_file(self.bucket, self.key, file_path)
            extension = os.path.splitext(file_path)[1]

            if extension == ".pdf" and self.enable_partition_pdf == True:
                logger.info(f"Start partitioning using hi-resolution mode: {file_path}")
                return partition_pdf(
                    filename=file_path,
                    strategy="hi_res",
                    infer_table_structure=True,
                    extract_images_in_pdf=False,
                )
            else:
                logger.info(f"Start partitioning using auto mode: {file_path}")
                return partition(filename=file_path)

    def _get_metadata(self) -> dict:
        return {"source": f"s3://{self.bucket}/{self.key}"}

    def load(self) -> list[Document]:
        """Load file."""
        elements = self._get_elements()
        if self.mode == "elements":
            docs: list[Document] = list()
            for element in elements:
                metadata = self._get_metadata()
                if hasattr(element, "metadata"):
                    metadata.update(element.metadata.to_dict())
                if hasattr(element, "category"):
                    metadata["category"] = element.category
                docs.append(Document(page_content=str(element), metadata=metadata))
        elif self.mode == "paged":
            text_dict: dict[int, str] = {}
            meta_dict: dict[int, dict] = {}

            for idx, element in enumerate(elements):
                metadata = self._get_metadata()
                if hasattr(element, "metadata"):
                    metadata.update(element.metadata.to_dict())
                page_number = metadata.get("page_number", 1)

                # Check if this page_number already exists in docs_dict
                if page_number not in text_dict:
                    # If not, create new entry with initial text and metadata
                    text_dict[page_number] = str(element) + "\n\n"
                    meta_dict[page_number] = metadata
                else:
                    # If exists, append to text and update the metadata
                    text_dict[page_number] += str(element) + "\n\n"
                    meta_dict[page_number].update(metadata)

            # Convert the dict to a list of Document objects
            docs = [
                Document(page_content=text_dict[key], metadata=meta_dict[key])
                for key in text_dict.keys()
            ]
        elif self.mode == "single":
            metadata = self._get_metadata()
            text = "\n\n".join([str(el) for el in elements])
            docs = [Document(page_content=text, metadata=metadata)]
        else:
            raise ValueError(f"mode of {self.mode} not supported.")
        return docs
