import sys
import unittest

sys.path.append(".")

from embedding.loaders import UrlLoader
from embedding.loaders.base import BaseLoader
from embedding.main import embed
from embedding.wrapper import DocumentSplitter, Embedder
from llama_index.core.node_parser import SentenceSplitter


class TestEmbed(unittest.TestCase):
    def test_load_split(self):
        source_urls = [
            "https://github.com/aws-samples/bedrock-claude-chat",
        ]
        loader = UrlLoader(source_urls)
        documents = loader.load()
        print(documents)

        self.assertNotEqual(len(documents), 0)

        splitter = DocumentSplitter(
            splitter=SentenceSplitter(
                paragraph_separator=r"\n\n\n",
                chunk_size=100,
                chunk_overlap=50,
            )
        )

        splitted = splitter.split_documents(documents)
        print(splitted)

        self.assertNotEqual(len(splitted), 0)


if __name__ == "__main__":
    """To run the test, use the following command on `backend` directory:

    ```
    cd backend
    docker build -f embedding/Dockerfile -t embedding .
    docker run -it -v $(pwd)/tests:/src/tests embedding /src/tests/embedding/test_embed.py
    ```
    """
    unittest.main()
