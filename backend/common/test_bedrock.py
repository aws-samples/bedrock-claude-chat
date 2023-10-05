import json
import unittest
from pprint import pprint

from bedrock import client, invoke
from repositories.model import ContentModel, MessageModel
from utils import get_buffer_string

MODEL = "claude"


class TestBedrock(unittest.TestCase):
    def test_invoke(self):
        messages = [
            MessageModel(
                id="2",
                role="user",
                content=ContentModel(
                    content_type="text",
                    body="こんにちは",
                ),
                model=MODEL,
                create_time=1627984879.9,
            ),
            MessageModel(
                id="3",
                role="assistant",
                content=ContentModel(
                    content_type="text",
                    body="こんにちは！どうされましたか？",
                ),
                model=MODEL,
                create_time=1627984879.9,
            ),
            MessageModel(
                id="4",
                role="user",
                content=ContentModel(
                    content_type="text",
                    body="AWSを学ぶ良い方法について教えて",
                ),
                model=MODEL,
                create_time=1627984879.9,
            ),
        ]

        prompt = get_buffer_string(messages)
        model = MODEL

        reply_txt = invoke(prompt, model)
        print(reply_txt)


if __name__ == "__main__":
    unittest.main()
