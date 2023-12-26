import sys

sys.path.append(".")

import unittest
from pprint import pprint

from app.bedrock import calculate_query_embedding, client, invoke
from app.repositories.model import ContentModel, MessageModel
from app.utils import get_buffer_string

# MODEL = "claude-v2"
MODEL = "claude-instant-v1"


class TestBedrock(unittest.TestCase):
    def test_invoke(self):
        messages = [
            MessageModel(
                role="user",
                content=ContentModel(
                    content_type="text",
                    body="こんにちは",
                ),
                model=MODEL,
                children=[],
                parent=None,
                create_time=1627984879.9,
            ),
            MessageModel(
                role="assistant",
                content=ContentModel(
                    content_type="text",
                    body="こんにちは！どうされましたか？",
                ),
                model=MODEL,
                children=[],
                parent=None,
                create_time=1627984879.9,
            ),
            MessageModel(
                role="user",
                content=ContentModel(
                    content_type="text",
                    body="AWSを学ぶ良い方法について教えて",
                ),
                model=MODEL,
                children=[],
                parent=None,
                create_time=1627984879.9,
            ),
        ]

        prompt = get_buffer_string(messages)
        model = MODEL

        reply_txt = invoke(prompt, model)
        print(reply_txt)

    def test_calculate_query_embedding(self):
        question = "こんにちは"
        embeddings = calculate_query_embedding(question)
        # NOTE: cohere outputs a list of 1024 floats
        self.assertEqual(len(embeddings), 1024)
        self.assertEqual(type(embeddings), list)
        self.assertEqual(type(embeddings[0]), float)


if __name__ == "__main__":
    unittest.main()
