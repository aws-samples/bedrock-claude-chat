import sys
import unittest

sys.path.append(".")

from app.config import DEFAULT_EMBEDDING_CONFIG
from app.repositories.conversation import (
    ContentModel,
    ConversationModel,
    MessageModel,
    RecordNotFoundError,
    change_conversation_title,
    delete_conversation_by_id,
    delete_conversation_by_user_id,
    find_conversation_by_id,
    find_conversation_by_user_id,
    store_conversation,
    update_feedback,
)
from app.repositories.custom_bot import (
    delete_bot_by_id,
    find_private_bots_by_user_id,
    store_bot,
)
from app.repositories.models.conversation import FeedbackModel
from app.repositories.models.custom_bot import (
    BotModel,
    EmbeddingParamsModel,
    KnowledgeModel,
    GenerationParamsModel,
    SearchParamsModel,
)
from boto3.dynamodb.conditions import Key
from botocore.exceptions import ClientError

# class TestRowLevelAccess(unittest.TestCase):
#     def setUp(self) -> None:
#         self.conversation_user_1 = ConversationModel(
#             id="1",
#             create_time=1627984879.9,
#             title="Test Conversation",
#             message_map={
#                 "a": MessageModel(
#                     role="user",
#                     content=ContentModel(content_type="text", body="Hello"),
#                     model="model",
#                     children=["x", "y"],
#                     parent="z",
#                     create_time=1627984879.9,
#                 )
#             },
#             last_message_id="x",
#         )
#         store_conversation("user1", self.conversation_user_1)

#         self.conversation_user_2 = ConversationModel(
#             id="2",
#             create_time=1627984879.9,
#             title="Test Conversation",
#             message_map={
#                 "a": MessageModel(
#                     role="user",
#                     content=ContentModel(content_type="text", body="Hello"),
#                     model="model",
#                     children=["x", "y"],
#                     parent="z",
#                     create_time=1627984879.9,
#                 )
#             },
#             last_message_id="x",
#         )
#         store_conversation("user2", self.conversation_user_2)

#     def test_find_conversation_by_user_id(self):
#         # Create table client for user1
#         table = _get_table_client("user1")

#         table.query(
#             KeyConditionExpression=Key("PK").eq(
#                 compose_conv_id("user1", self.conversation_user_1.id)
#             )
#         )

#         with self.assertRaises(ClientError):
#             # Raise `AccessDeniedException` because user1 cannot access user2's data
#             table.query(
#                 KeyConditionExpression=Key("PK").eq(
#                     compose_conv_id("user2", self.conversation_user_2.id)
#                 )
#             )

#     def test_find_conversation_by_id(self):
#         # Create table client for user1
#         table = _get_table_client("user1")

#         table.query(
#             IndexName="SKIndex",
#             KeyConditionExpression=Key("SK").eq(
#                 compose_conv_id("user1", self.conversation_user_1.id)
#             ),
#         )
#         with self.assertRaises(ClientError):
#             # Raise `AccessDeniedException` because user1 cannot access user2's data
#             table.query(
#                 IndexName="SKIndex",
#                 KeyConditionExpression=Key("SK").eq(
#                     compose_conv_id("user2", self.conversation_user_2.id)
#                 ),
#             )

#     def tearDown(self) -> None:
#         delete_conversation_by_user_id("user1")
#         delete_conversation_by_user_id("user2")


class TestConversationRepository(unittest.TestCase):
    def test_store_and_find_conversation(self):
        conversation = ConversationModel(
            id="1",
            create_time=1627984879.9,
            title="Test Conversation",
            total_price=100,
            message_map={
                "a": MessageModel(
                    role="user",
                    content=[
                        ContentModel(
                            content_type="text", body="Hello", media_type=None
                        ),
                        ContentModel(
                            content_type="image",
                            body="iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
                            media_type="image/png",
                        ),
                    ],
                    model="claude-instant-v1",
                    children=["x", "y"],
                    parent="z",
                    create_time=1627984879.9,
                    feedback=None,
                    used_chunks=None,
                )
            },
            last_message_id="x",
            bot_id=None,
        )

        # Test storing conversation
        response = store_conversation("user", conversation)
        self.assertIsNotNone(response)

        # Test finding conversation by user_id
        conversations = find_conversation_by_user_id(user_id="user")
        self.assertEqual(len(conversations), 1)

        # Test finding conversation by id
        found_conversation = find_conversation_by_id(
            user_id="user", conversation_id="1"
        )
        self.assertEqual(found_conversation.id, "1")
        message_map = found_conversation.message_map
        # Assert whether the message map is correctly reconstructed
        self.assertEqual(message_map["a"].role, "user")
        content = message_map["a"].content
        self.assertEqual(len(content), 2)
        self.assertEqual(content[0].content_type, "text")
        self.assertEqual(content[0].body, "Hello")
        self.assertEqual(content[1].content_type, "image")
        self.assertEqual(
            content[1].body,
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
        )
        self.assertEqual(content[1].media_type, "image/png")
        self.assertEqual(message_map["a"].model, "claude-instant-v1")
        self.assertEqual(message_map["a"].children, ["x", "y"])
        self.assertEqual(message_map["a"].parent, "z")
        self.assertEqual(message_map["a"].create_time, 1627984879.9)
        self.assertEqual(found_conversation.last_message_id, "x")
        self.assertEqual(found_conversation.total_price, 100)
        self.assertEqual(found_conversation.bot_id, None)

        # Test update title
        response = change_conversation_title(
            user_id="user",
            conversation_id="1",
            new_title="Updated title",
        )
        found_conversation = find_conversation_by_id(
            user_id="user", conversation_id="1"
        )
        self.assertEqual(found_conversation.title, "Updated title")

        # Test give a feedback
        self.assertIsNone(found_conversation.message_map["a"].feedback)
        response = update_feedback(
            user_id="user",
            conversation_id="1",
            message_id="a",
            feedback=FeedbackModel(
                thumbs_up=True, category="Good", comment="The response is pretty good."
            ),
        )
        found_conversation = find_conversation_by_id(
            user_id="user", conversation_id="1"
        )
        feedback = found_conversation.message_map["a"].feedback
        self.assertIsNotNone(feedback)
        self.assertEqual(feedback.thumbs_up, True)  # type: ignore
        self.assertEqual(feedback.category, "Good")  # type: ignore
        self.assertEqual(feedback.comment, "The response is pretty good.")  # type: ignore

        # Test deleting conversation by id
        delete_conversation_by_id(user_id="user", conversation_id="1")
        with self.assertRaises(RecordNotFoundError):
            find_conversation_by_id("user", "1")

        response = store_conversation(user_id="user", conversation=conversation)

        # Test deleting conversation by user_id
        delete_conversation_by_user_id(user_id="user")
        conversations = find_conversation_by_user_id(user_id="user")
        self.assertEqual(len(conversations), 0)

    def test_store_and_find_large_conversation(self):
        large_message_map = {
            f"msg_{i}": MessageModel(
                role="user",
                content=[
                    ContentModel(
                        content_type="text",
                        body="This is a large message."
                        * 1000,  # Repeating to make it large
                        media_type=None,
                    )
                ],
                model="claude-instant-v1",
                children=[],
                parent=None,
                create_time=1627984879.9,
                feedback=None,
                used_chunks=None,
            )
            for i in range(10)  # Create 10 large messages
        }

        large_conversation = ConversationModel(
            id="2",
            create_time=1627984879.9,
            title="Large Conversation",
            total_price=200,
            message_map=large_message_map,
            last_message_id="msg_9",
            bot_id=None,
        )

        # Test storing large conversation with a small threshold
        response = store_conversation("user", large_conversation, threshold=1)
        self.assertIsNotNone(response)

        # Test finding large conversation by id
        found_conversation = find_conversation_by_id(
            user_id="user", conversation_id="2"
        )
        self.assertEqual(found_conversation.id, "2")
        self.assertEqual(found_conversation.title, "Large Conversation")
        self.assertEqual(found_conversation.total_price, 200)
        self.assertEqual(found_conversation.last_message_id, "msg_9")
        self.assertEqual(found_conversation.bot_id, None)

        message_map = found_conversation.message_map
        self.assertEqual(len(message_map), 10)

        for i in range(10):
            message_id = f"msg_{i}"
            self.assertIn(message_id, message_map)
            message = message_map[message_id]
            self.assertEqual(message.role, "user")
            self.assertEqual(len(message.content), 1)
            self.assertEqual(message.content[0].content_type, "text")
            self.assertEqual(message.content[0].body, "This is a large message." * 1000)
            self.assertEqual(message.content[0].media_type, None)
            self.assertEqual(message.model, "claude-instant-v1")
            self.assertEqual(message.children, [])
            self.assertEqual(message.parent, None)
            self.assertEqual(message.create_time, 1627984879.9)

        # Test deleting large conversation
        delete_conversation_by_id(user_id="user", conversation_id="2")
        with self.assertRaises(RecordNotFoundError):
            find_conversation_by_id("user", "2")

        store_conversation(user_id="user", conversation=large_conversation)
        delete_conversation_by_user_id(user_id="user")
        conversations = find_conversation_by_user_id(user_id="user")
        self.assertEqual(len(conversations), 0)


class TestConversationBotRepository(unittest.TestCase):
    def setUp(self) -> None:
        conversation1 = ConversationModel(
            id="1",
            create_time=1627984879.9,
            title="Test Conversation",
            total_price=100,
            message_map={
                "a": MessageModel(
                    role="user",
                    content=[
                        ContentModel(
                            content_type="text", body="Hello", media_type=None
                        ),
                        ContentModel(
                            content_type="image",
                            body="iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
                            media_type="image/png",
                        ),
                    ],
                    model="claude-instant-v1",
                    children=["x", "y"],
                    parent="z",
                    create_time=1627984879.9,
                    feedback=None,
                    used_chunks=None,
                )
            },
            last_message_id="x",
            bot_id=None,
        )
        conversation2 = ConversationModel(
            id="2",
            create_time=1627984879.9,
            title="Test Conversation",
            total_price=100,
            message_map={
                "a": MessageModel(
                    role="user",
                    content=[
                        ContentModel(
                            content_type="text", body="Hello", media_type=None
                        ),
                        ContentModel(
                            content_type="image",
                            body="iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
                            media_type="image/png",
                        ),
                    ],
                    model="claude-instant-v1",
                    children=["x", "y"],
                    parent="z",
                    create_time=1627984879.9,
                    feedback=None,
                    used_chunks=None,
                )
            },
            last_message_id="x",
            bot_id="1",
        )
        bot1 = BotModel(
            id="1",
            title="Test Bot",
            instruction="Test Bot Prompt",
            description="Test Bot Description",
            create_time=1627984879.9,
            last_used_time=1627984879.9,
            public_bot_id="1",
            is_pinned=False,
            owner_user_id="user",
            embedding_params=EmbeddingParamsModel(
                chunk_size=DEFAULT_EMBEDDING_CONFIG["chunk_size"],
                chunk_overlap=DEFAULT_EMBEDDING_CONFIG["chunk_overlap"],
                enable_partition_pdf=DEFAULT_EMBEDDING_CONFIG["enable_partition_pdf"],
            ),
            generation_params=GenerationParamsModel(
                max_tokens=2000,
                top_k=250,
                top_p=0.999,
                temperature=0.6,
                stop_sequences=["Human: ", "Assistant: "],
            ),
            search_params=SearchParamsModel(
                max_results=20,
            ),
            knowledge=KnowledgeModel(
                source_urls=["https://aws.amazon.com/"],
                sitemap_urls=["https://aws.amazon.sitemap.xml"],
                filenames=["aws.pdf"],
            ),
            sync_status="RUNNING",
            sync_status_reason="reason",
            sync_last_exec_id="",
            published_api_codebuild_id="",
            published_api_datetime=0,
            published_api_stack_name="",
            display_retrieved_chunks=True,
        )
        bot2 = BotModel(
            id="2",
            title="Test Bot",
            instruction="Test Bot Prompt",
            description="Test Bot Description",
            create_time=1627984879.9,
            last_used_time=1627984879.9,
            public_bot_id="2",
            is_pinned=False,
            owner_user_id="user",
            embedding_params=EmbeddingParamsModel(
                chunk_size=DEFAULT_EMBEDDING_CONFIG["chunk_size"],
                chunk_overlap=DEFAULT_EMBEDDING_CONFIG["chunk_overlap"],
                enable_partition_pdf=DEFAULT_EMBEDDING_CONFIG["enable_partition_pdf"],
            ),
            generation_params=GenerationParamsModel(
                max_tokens=2000,
                top_k=250,
                top_p=0.999,
                temperature=0.6,
                stop_sequences=["Human: ", "Assistant: "],
            ),
            search_params=SearchParamsModel(
                max_results=20,
            ),
            knowledge=KnowledgeModel(
                source_urls=["https://aws.amazon.com/"],
                sitemap_urls=["https://aws.amazon.sitemap.xml"],
                filenames=["aws.pdf"],
            ),
            sync_status="RUNNING",
            sync_status_reason="reason",
            sync_last_exec_id="",
            published_api_codebuild_id="",
            published_api_datetime=0,
            published_api_stack_name="",
            display_retrieved_chunks=True,
        )

        store_conversation("user", conversation1)
        store_bot("user", bot1)
        store_bot("user", bot2)
        store_conversation("user", conversation2)

    def test_only_conversation_is_fetched(self):
        conversations = find_conversation_by_user_id("user")
        self.assertEqual(len(conversations), 2)

    def test_only_bot_is_fetched(self):
        bots = find_private_bots_by_user_id("user")
        self.assertEqual(len(bots), 2)

    def tearDown(self) -> None:
        delete_conversation_by_user_id("user")
        delete_bot_by_id("user", "1")
        delete_bot_by_id("user", "2")


if __name__ == "__main__":
    unittest.main()
