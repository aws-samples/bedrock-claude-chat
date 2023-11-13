import sys

sys.path.append(".")

import unittest
from pprint import pprint

from app.bedrock import client, invoke
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


if __name__ == "__main__":
    unittest.main()
