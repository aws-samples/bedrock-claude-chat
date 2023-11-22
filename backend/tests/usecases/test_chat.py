import sys

sys.path.append(".")

import unittest
from pprint import pprint

from app.repositories.conversation import (
    delete_conversation_by_id,
    find_conversation_by_id,
    store_conversation,
)
from app.repositories.model import ContentModel, ConversationModel, MessageModel
from app.route_schema import ChatInput, ChatOutput, Content, MessageInput, MessageOutput
from app.usecases.chat import chat, propose_conversation_title, trace_to_root

MODEL = "claude-v2"


class TestTraceToRoot(unittest.TestCase):
    def test_trace_to_root(self):
        message_map = {
            "user_1": MessageModel(
                role="user",
                content=ContentModel(content_type="text", body="user_1"),
                model="model",
                children=["bot_1"],
                parent=None,
                create_time=1627984879.9,
            ),
            "bot_1": MessageModel(
                role="assistant",
                content=ContentModel(content_type="text", body="bot_1"),
                model="model",
                children=["user_2"],
                parent="user_1",
                create_time=1627984879.9,
            ),
            "user_2": MessageModel(
                role="user",
                content=ContentModel(content_type="text", body="user_2"),
                model="model",
                children=["bot_2"],
                parent="bot_1",
                create_time=1627984879.9,
            ),
            "bot_2": MessageModel(
                role="assistant",
                content=ContentModel(content_type="text", body="bot_2"),
                model="model",
                children=["user_3a", "user_3b"],
                parent="user_2",
                create_time=1627984879.9,
            ),
            "user_3a": MessageModel(
                role="user",
                content=ContentModel(content_type="text", body="user_3a"),
                model="model",
                children=[],
                parent="bot_2",
                create_time=1627984879.9,
            ),
            "user_3b": MessageModel(
                role="user",
                content=ContentModel(content_type="text", body="user_3b"),
                model="model",
                children=[],
                parent="bot_2",
                create_time=1627984879.9,
            ),
        }
        messages = trace_to_root("user_3a", message_map)
        self.assertEqual(len(messages), 5)
        self.assertEqual(messages[0].content.body, "user_1")
        self.assertEqual(messages[1].content.body, "bot_1")
        self.assertEqual(messages[2].content.body, "user_2")
        self.assertEqual(messages[3].content.body, "bot_2")
        self.assertEqual(messages[4].content.body, "user_3a")

        messages = trace_to_root("user_3b", message_map)
        self.assertEqual(len(messages), 5)
        self.assertEqual(messages[0].content.body, "user_1")
        self.assertEqual(messages[1].content.body, "bot_1")
        self.assertEqual(messages[2].content.body, "user_2")
        self.assertEqual(messages[3].content.body, "bot_2")
        self.assertEqual(messages[4].content.body, "user_3b")


class TestStartChat(unittest.TestCase):
    def test_chat(self):
        chat_input = ChatInput(
            conversation_id="test_conversation_id",
            message=MessageInput(
                role="user",
                content=Content(
                    content_type="text",
                    body="あなたの名前は何ですか？",
                ),
                model=MODEL,
                parent_message_id=None,
            ),
        )
        output: ChatOutput = chat(user_id="user1", chat_input=chat_input)
        self.output = output

        pprint(output.model_dump())

        self.assertNotEqual(output.conversation_id, "")

        conv = find_conversation_by_id(
            user_id="user1", conversation_id=output.conversation_id
        )
        # Message length will be 2 (system + user input + assistant reply)
        self.assertEqual(len(conv.message_map), 3)
        for k, v in conv.message_map.items():
            if v.parent == "system":
                first_key = k
                first_message = v
            elif v.parent:
                second_key = k
                second_message = v

        self.assertEqual(second_message.parent, first_key)
        self.assertEqual(first_message.children, [second_key])
        self.assertEqual(conv.last_message_id, second_key)

    def tearDown(self) -> None:
        delete_conversation_by_id("user1", self.output.conversation_id)


class TestContinueChat(unittest.TestCase):
    def setUp(self) -> None:
        self.user_id = "user2"
        self.conversation_id = "conversation2"
        store_conversation(
            user_id=self.user_id,
            conversation=ConversationModel(
                last_message_id="b-2",
                id=self.conversation_id,
                create_time=1627984879.9,
                title="Test Conversation",
                message_map={
                    "1-user": MessageModel(
                        role="user",
                        content=ContentModel(
                            content_type="text",
                            body="こんにちは",
                        ),
                        model=MODEL,
                        children=["1-assistant"],
                        parent=None,
                        create_time=1627984879.9,
                    ),
                    "1-assistant": MessageModel(
                        role="assistant",
                        content=ContentModel(
                            content_type="text",
                            body="はい、こんにちは。どうしましたか?",
                        ),
                        model=MODEL,
                        children=[],
                        parent="1-user",
                        create_time=1627984879.9,
                    ),
                },
            ),
        )

    def test_continue_chat(self):
        chat_input = ChatInput(
            conversation_id=self.conversation_id,
            message=MessageInput(
                role="user",
                content=Content(
                    content_type="text",
                    body="あなたの名前は？",
                ),
                model=MODEL,
                parent_message_id="1-assistant",
            ),
        )
        output: ChatOutput = chat(user_id=self.user_id, chat_input=chat_input)
        self.output = output

        pprint(output.model_dump())

        conv = find_conversation_by_id(self.user_id, output.conversation_id)

        messages = trace_to_root(conv.last_message_id, conv.message_map)
        self.assertEqual(len(messages), 4)

        num_empty_children = 0
        for k, v in conv.message_map.items():
            if len(v.children) == 0:
                num_empty_children += 1
        self.assertEqual(num_empty_children, 1)

    def tearDown(self) -> None:
        delete_conversation_by_id(self.user_id, self.output.conversation_id)


class TestRegenerateChat(unittest.TestCase):
    def setUp(self) -> None:
        self.user_id = "user3"
        self.conversation_id = "conversation3"
        store_conversation(
            user_id=self.user_id,
            conversation=ConversationModel(
                last_message_id="b-2",
                id=self.conversation_id,
                create_time=1627984879.9,
                title="Test Conversation",
                message_map={
                    "a-1": MessageModel(
                        role="user",
                        content=ContentModel(
                            content_type="text",
                            body="こんにちはを英語で",
                        ),
                        model=MODEL,
                        children=["a-2"],
                        parent=None,
                        create_time=1627984879.9,
                    ),
                    "a-2": MessageModel(
                        role="assistant",
                        content=ContentModel(
                            content_type="text",
                            body="Hello!",
                        ),
                        model=MODEL,
                        children=[],
                        parent="a-1",
                        create_time=1627984879.9,
                    ),
                    "b-1": MessageModel(
                        role="user",
                        content=ContentModel(
                            content_type="text",
                            body="こんにちはを中国語で",
                        ),
                        model=MODEL,
                        children=["b-2"],
                        parent=None,
                        create_time=1627984879.9,
                    ),
                    "b-2": MessageModel(
                        role="assistant",
                        content=ContentModel(
                            content_type="text",
                            body="你好!",
                        ),
                        model=MODEL,
                        children=[],
                        parent="b-1",
                        create_time=1627984879.9,
                    ),
                },
            ),
        )

    def test_chat(self):
        # Question for English
        chat_input = ChatInput(
            conversation_id=self.conversation_id,
            message=MessageInput(
                role="user",
                content=Content(
                    content_type="text",
                    body="では、おやすみなさいはなんと言う？",
                ),
                model=MODEL,
                # a-2: en, b-2: zh
                parent_message_id="a-2",
            ),
        )
        output: ChatOutput = chat(user_id=self.user_id, chat_input=chat_input)
        self.output = output

        pprint(output.model_dump())  # English
        conv = find_conversation_by_id(self.user_id, output.conversation_id)
        self.assertEqual(len(conv.message_map), 6)

        # Question for Chinese
        chat_input = ChatInput(
            conversation_id=self.conversation_id,
            message=MessageInput(
                role="user",
                content=Content(
                    content_type="text",
                    body="では、おやすみなさいはなんと言う？",
                ),
                model=MODEL,
                # a-2: en, b-2: zh
                parent_message_id="b-2",
            ),
        )
        output: ChatOutput = chat(user_id=self.user_id, chat_input=chat_input)
        self.output = output

        pprint(output.model_dump())  # Chinese
        conv = find_conversation_by_id(self.user_id, output.conversation_id)
        self.assertEqual(len(conv.message_map), 8)

    def tearDown(self) -> None:
        delete_conversation_by_id(self.user_id, self.conversation_id)


class TestProposeTitle(unittest.TestCase):
    def setUp(self) -> None:
        chat_input = ChatInput(
            conversation_id="test_conversation_id",
            message=MessageInput(
                role="user",
                content=Content(
                    content_type="text",
                    # body="Australian famous site seeing place",
                    body="日本の有名な料理を3つ教えて",
                ),
                model=MODEL,
                parent_message_id=None,
            ),
        )
        output: ChatOutput = chat(user_id="user1", chat_input=chat_input)

        print(output)
        self.output = output

    def test_propose_title(self):
        title = propose_conversation_title("user1", self.output.conversation_id)
        print(f"[title]: {title}")

    def tearDown(self) -> None:
        delete_conversation_by_id("user1", self.output.conversation_id)


if __name__ == "__main__":
    unittest.main()
