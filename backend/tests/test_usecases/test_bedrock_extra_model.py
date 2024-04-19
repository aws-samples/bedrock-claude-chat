import sys

sys.path.append(".")
import unittest
from pprint import pprint

from app.repositories.models.custom_bot import BotModel, KnowledgeModel
from app.routes.schemas.conversation import (
    ChatInput,
    ChatOutput,
    Content,
    MessageInput,
    type_model_name,
)
from app.usecases.chat import (
    chat,
)

MODEL: type_model_name = "mistral-7b-instruct"

prompt = "あなたの名前は何ですか?"
# You may customize the below prompt template for different models.
body = f"<s>[INST]{prompt}[/INST]"


class TestBedrockChat(unittest.TestCase):
    def test_chat(self):
        chat_input = ChatInput(
            conversation_id="test_conversation_id",
            message=MessageInput(
                role="user",
                content=[
                    Content(
                        content_type="text",
                        body=body,
                        media_type=None,
                    )
                ],
                model=MODEL,
                parent_message_id=None,
                message_id=None,
            ),
            bot_id=None,
        )
        print(chat_input)
        print(MODEL)
        output: ChatOutput = chat(user_id="user1", chat_input=chat_input)
        self.output = output

        pprint(output.model_dump())


if __name__ == "__main__":
    unittest.main()
