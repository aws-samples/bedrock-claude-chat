import sys
import unittest

sys.path.append(".")

from boto3.dynamodb.conditions import Key
from botocore.exceptions import ClientError
from repositories.conversation import (
    _get_table_client,
    change_conversation_title,
    delete_conversation_by_id,
    delete_conversation_by_user_id,
    find_conversation_by_id,
    find_conversation_by_user_id,
    store_conversation,
)
from repositories.model import ContentModel, ConversationModel, MessageModel


class TestRowLevelAccess(unittest.TestCase):
    def setUp(self) -> None:
        self.conversation_user_1 = ConversationModel(
            id="1",
            create_time=1627984879.9,
            title="Test Conversation",
            messages=[
                MessageModel(
                    id="1",
                    role="user",
                    content=ContentModel(content_type="text", body="Hello"),
                    model="model",
                    create_time=1627984879.9,
                )
            ],
        )
        store_conversation("test_user_1", self.conversation_user_1)

        self.conversation_user_2 = ConversationModel(
            id="2",
            create_time=1627984879.9,
            title="Test Conversation",
            messages=[
                MessageModel(
                    id="1",
                    role="user",
                    content=ContentModel(content_type="text", body="Hello"),
                    model="model",
                    create_time=1627984879.9,
                )
            ],
        )
        store_conversation("test_user_2", self.conversation_user_2)

    def test_find_conversation_by_user_id(self):
        # Create table client for test_user_1
        table = _get_table_client("test_user_1")

        table.query(KeyConditionExpression=Key("UserId").eq("test_user_1"))

        with self.assertRaises(ClientError):
            # Raise `AccessDeniedException` because test_user_1 cannot access test_user_2's data
            table.query(KeyConditionExpression=Key("UserId").eq("test_user_2"))

    def tearDown(self) -> None:
        delete_conversation_by_user_id("test_user_1")
        delete_conversation_by_user_id("test_user_2")


class TestConversationRepository(unittest.TestCase):
    def test_store_and_find_conversation(self):
        conversation = ConversationModel(
            id="1",
            create_time=1627984879.9,
            title="Test Conversation",
            messages=[
                MessageModel(
                    id="1",
                    role="user",
                    content=ContentModel(content_type="text", body="Hello"),
                    model="model",
                    create_time=1627984879.9,
                )
            ],
        )

        # Test storing conversation
        response = store_conversation("test_user", conversation)
        self.assertIsNotNone(response)

        # Test finding conversation by user_id
        conversations = find_conversation_by_user_id("test_user")
        self.assertEqual(len(conversations), 1)

        # Test finding conversation by id
        found_conversation = find_conversation_by_id("1")
        self.assertEqual(found_conversation.id, "1")

        # Test update title
        response = change_conversation_title("1", "Updated title")
        found_conversation = find_conversation_by_id("1")
        self.assertEqual(found_conversation.title, "Updated title")

        # Test deleting conversation by id
        delete_conversation_by_id("1")
        with self.assertRaises(ValueError):
            find_conversation_by_id("1")

        response = store_conversation("test_user", conversation)

        # Test deleting conversation by user_id
        delete_conversation_by_user_id("test_user")
        conversations = find_conversation_by_user_id("test_user")
        self.assertEqual(len(conversations), 0)


if __name__ == "__main__":
    unittest.main()
