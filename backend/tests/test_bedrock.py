import sys

sys.path.append(".")

import unittest
from pprint import pprint

from app.bedrock import calculate_query_embedding
from app.repositories.model import ContentModel, MessageModel

# MODEL = "claude-v2"
# MODEL = "claude-instant-v1"
MODEL = "claude-v3-sonnet"


class TestBedrock(unittest.TestCase):
    def test_calculate_query_embedding(self):
        question = "こんにちは"
        embeddings = calculate_query_embedding(question)
        # NOTE: cohere outputs a list of 1024 floats
        self.assertEqual(len(embeddings), 1024)
        self.assertEqual(type(embeddings), list)
        self.assertEqual(type(embeddings[0]), float)


if __name__ == "__main__":
    unittest.main()
