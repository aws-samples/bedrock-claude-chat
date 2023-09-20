import unittest
from pprint import pprint

from repositories.conversation import (
    delete_conversation_by_id,
    find_conversation_by_id,
    store_conversation,
)
from repositories.model import ContentModel, ConversationModel, MessageModel
from route_schema import ChatInput, ChatOutput, Content, MessageInput, MessageOutput
from usecase import chat, propose_conversation_title

MODEL = "claude"


class TestStartChat(unittest.TestCase):
    def test_chat(self):
        chat_input = ChatInput(
            conversation_id="test_conversation_id",
            message=MessageInput(
                id="1",
                role="user",
                content=Content(
                    content_type="text",
                    body="あなたの名前は何ですか？",
                ),
                model=MODEL,
            ),
        )
        output: ChatOutput = chat(user_id="user1", chat_input=chat_input)
        self.output = output

        pprint(output.model_dump())

        self.assertNotEqual(output.conversation_id, "")

        conv = find_conversation_by_id(
            user_id="user1", conversation_id=output.conversation_id
        )
        # Message length will be 2 (user input + assistant reply)
        self.assertEqual(len(conv.messages), 2)

    def tearDown(self) -> None:
        delete_conversation_by_id("user1", self.output.conversation_id)


class TestContinueChat(unittest.TestCase):
    def setUp(self) -> None:
        self.user_id = "user2"
        self.conversation_id = "conversation1"

        store_conversation(
            user_id=self.user_id,
            conversation=ConversationModel(
                id=self.conversation_id,
                create_time=1627984879.9,
                title="Test Conversation",
                messages=[
                    MessageModel(
                        id="2",
                        role="user",
                        content=ContentModel(
                            content_type="text",
                            body="あなたの名前は何ですか？",
                        ),
                        model=MODEL,
                        create_time=1627984879.9,
                    ),
                    MessageModel(
                        id="3",
                        role="assistant",
                        content=ContentModel(
                            content_type="text",
                            body="私の名前はクロードです。",
                        ),
                        model=MODEL,
                        create_time=1627984879.9,
                    ),
                ],
            ),
        )

    def test_chat(self):
        chat_input = ChatInput(
            conversation_id=self.conversation_id,
            message=MessageInput(
                id="4",
                role="user",
                content=Content(
                    content_type="text",
                    body="あなたの友達を紹介してください。",
                ),
                model=MODEL,
            ),
        )
        output: ChatOutput = chat(user_id=self.user_id, chat_input=chat_input)
        self.output = output

        pprint(output.model_dump())

        self.assertNotEqual(output.conversation_id, "")

        conv = find_conversation_by_id(self.user_id, output.conversation_id)
        self.assertEqual(len(conv.messages), 4)

    def tearDown(self) -> None:
        delete_conversation_by_id(self.user_id, self.conversation_id)


class TestProposeTitle(unittest.TestCase):
    def setUp(self) -> None:
        chat_input = ChatInput(
            conversation_id="test_conversation_id_propose_title",
            message=MessageInput(
                id="1",
                role="user",
                content=Content(
                    content_type="text",
                    # body="日本の料理で有名なやつ",
                    body="Famous japanese Dishes",
                ),
                model=MODEL,
            ),
        )
        output: ChatOutput = chat(user_id="user1", chat_input=chat_input)
        self.output = output

    def test_propose_title(self):
        title = propose_conversation_title("user1", self.output.conversation_id)
        print(f"[title]: {title}")

    def tearDown(self) -> None:
        delete_conversation_by_id("user1", self.output.conversation_id)


if __name__ == "__main__":
    unittest.main()
