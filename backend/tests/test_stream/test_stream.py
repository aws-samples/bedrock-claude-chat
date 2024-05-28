import sys

sys.path.append(".")
import unittest

from app.bedrock import compose_args
from app.repositories.models.conversation import ContentModel, MessageModel
from app.stream import AnthropicStreamHandler, BedrockStreamHandler, OnStopInput


def on_stream(x: str) -> None:
    print(x)


def on_stop(x: OnStopInput) -> None:
    print(f"Stop reason: {x.stop_reason}")
    print(f"Price: {x.price}")
    print(f"Input token count: {x.input_token_count}")
    print(f"Output token count: {x.output_token_count}")


class TestAnthropicStreamHandler(unittest.TestCase):
    MODEL = "claude-v3-haiku"

    def test_run(self):
        stream_handler = AnthropicStreamHandler.from_model(model=self.MODEL)
        stream_handler.bind(on_stream=on_stream, on_stop=on_stop)

        message = MessageModel(
            role="user",
            content=[
                ContentModel(
                    content_type="text",
                    media_type=None,
                    body="Hello, World!",
                )
            ],
            model=self.MODEL,
            children=[],
            parent=None,
            create_time=0,
            feedback=None,
            used_chunks=None,
        )

        args = compose_args(
            [message], self.MODEL, instruction=None, stream=True, generation_params=None
        )
        for _ in stream_handler.run(
            args=args,
        ):
            pass


class TestBedrockStreamHandler(unittest.TestCase):
    MODEL = "mistral-7b-instruct"

    def test_run(self):
        stream_handler = BedrockStreamHandler.from_model(model=self.MODEL)
        stream_handler.bind(on_stream=on_stream, on_stop=on_stop)

        message = MessageModel(
            role="user",
            content=[
                ContentModel(
                    content_type="text",
                    media_type=None,
                    body="Hello, World!",
                )
            ],
            model=self.MODEL,
            children=[],
            parent=None,
            create_time=0,
            feedback=None,
            used_chunks=None,
        )

        args = compose_args(
            [message], self.MODEL, instruction=None, stream=True, generation_params=None
        )
        for _ in stream_handler.run(
            args=args,
        ):
            pass


if __name__ == "__main__":
    unittest.main()
