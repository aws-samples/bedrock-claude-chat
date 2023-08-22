import unittest

from bedrock import invoke, invoke_with_stream
from repositories.model import ContentModel, MessageModel
from utils import get_buffer_string

MODEL = "claude"


class TestBedrock(unittest.TestCase):
    def test_invoke(self):
        prompt = "日本のおすすめのアニメを教えて"
        model = MODEL

        reply_txt = invoke(prompt, model)
        print(reply_txt)

    def test_invoke_with_multi_messages(self):
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


# class TestBedrockStreaming(unittest.TestCase):
#     def test_invoke_with_stream(self):
#         prompt = "Please tell me famous Japanese anime."
#         model = MODEL

#         stream = invoke_with_stream(prompt, model)
#         for s in stream:
#             print(s)


if __name__ == "__main__":
    unittest.main()
