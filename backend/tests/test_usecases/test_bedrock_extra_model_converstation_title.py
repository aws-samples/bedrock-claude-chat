import sys

sys.path.append(".")
import unittest
from pprint import pprint


from app.routes.schemas.conversation import (
    ChatInput,
    Content,
    MessageInput,
    type_model_name,
)
from app.usecases.chat import (
    propose_conversation_title,
)


MODEL: type_model_name = "mistral-7b-instruct"


class TestConversationTitlePropose(unittest.TestCase):
    def test_converstation_title_propose(self):
        chat_input = ChatInput(
            conversation_id="test_conversation_id",
            message=MessageInput(
                role="user",
                content=[
                    Content(
                        content_type="text",
                        body="あなたの名前は何ですか？",
                        media_type=None,
                    )
                ],
                model=MODEL,
                parent_message_id=None,
                message_id=None,
            ),
            bot_id=None,
        )
        output = propose_conversation_title(
            user_id="user1", conversation_id=chat_input.conversation_id, model=MODEL
        )
        self.output = output
        pprint(output)


if __name__ == "__main__":
    unittest.main()
