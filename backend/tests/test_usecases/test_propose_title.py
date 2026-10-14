import sys

sys.path.insert(0, ".")
import unittest
from unittest.mock import patch

from app.repositories.models.conversation import SimpleMessageModel, TextContentModel
from app.usecases import chat

REASONING = {"reasoningContent": {"reasoningText": {"text": "Title..."}}}


class TestProposeConversationTitle(unittest.TestCase):
    @patch.object(chat, "find_conversation_by_id")
    @patch.object(chat, "trace_to_root")
    @patch.object(chat, "call_converse_api")
    def test_title_is_first_text_block(self, call_converse_api, trace_to_root, _):
        """Reasoning models (e.g. GPT-OSS) return reasoningContent before the text."""
        trace_to_root.return_value = [
            SimpleMessageModel(
                role="user",
                content=[TextContentModel(content_type="text", body="Hello")],
            )
        ]
        for content, expected in [
            ([{"text": "Friendly greeting"}], "Friendly greeting"),
            ([REASONING, {"text": "Friendly greeting"}], "Friendly greeting"),
            ([REASONING], ""),
        ]:
            with self.subTest(content=content):
                call_converse_api.return_value = {
                    "output": {"message": {"role": "assistant", "content": content}}
                }
                title = chat.propose_conversation_title("user1", "conversation1")
                self.assertEqual(title, expected)


if __name__ == "__main__":
    unittest.main()
