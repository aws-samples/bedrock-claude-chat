import sys
import unittest

sys.path.append(".")

from app.config import DEFAULT_EMBEDDING_CONFIG
from app.repositories.custom_bot import (
    delete_alias_by_id,
    delete_bot_by_id,
    delete_bot_publication,
    find_all_published_bots,
    find_private_bot_by_id,
    find_private_bots_by_user_id,
    find_public_bots_by_ids,
    store_alias,
    store_bot,
    update_alias_last_used_time,
    update_bot,
    update_bot_last_used_time,
    update_bot_publication,
    update_bot_visibility,
)
from app.repositories.models.custom_bot import (
    BotAliasModel,
    BotModel,
    EmbeddingParamsModel,
    KnowledgeModel,
    GenerationParamsModel,
    SearchParamsModel,
)
from app.usecases.bot import fetch_all_bots_by_user_id


class TestCustomBotRepository(unittest.TestCase):
    def test_store_and_find_bot(self):
        bot = BotModel(
            id="1",
            title="Test Bot",
            instruction="Test Bot Prompt",
            description="Test Bot Description",
            create_time=1627984879.9,
            last_used_time=1627984879.9,
            is_pinned=False,
            public_bot_id=None,
            owner_user_id="user1",
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
                filenames=["test.txt"],
            ),
            sync_status="RUNNING",
            sync_status_reason="reason",
            sync_last_exec_id="",
            published_api_stack_name="TestApiStack",
            published_api_datetime=1627984879,
            published_api_codebuild_id="TestCodeBuildId",
            display_retrieved_chunks=True,
        )
        store_bot("user1", bot)

        # Assert bot is stored and reconstructed correctly
        bot = find_private_bot_by_id("user1", "1")
        self.assertEqual(bot.id, "1")
        self.assertEqual(bot.title, "Test Bot")
        self.assertEqual(bot.description, "Test Bot Description")
        self.assertEqual(bot.instruction, "Test Bot Prompt")
        self.assertEqual(bot.create_time, 1627984879.9)
        self.assertEqual(bot.last_used_time, 1627984879.9)
        self.assertEqual(bot.is_pinned, False)
        self.assertEqual(
            bot.embedding_params.chunk_size, DEFAULT_EMBEDDING_CONFIG["chunk_size"]
        )
        self.assertEqual(
            bot.embedding_params.chunk_overlap,
            DEFAULT_EMBEDDING_CONFIG["chunk_overlap"],
        )

        self.assertEqual(
            bot.embedding_params.enable_partition_pdf,
            DEFAULT_EMBEDDING_CONFIG["enable_partition_pdf"],
        )
        self.assertEqual(bot.generation_params.max_tokens, 2000)
        self.assertEqual(bot.generation_params.top_k, 250)
        self.assertEqual(bot.generation_params.top_p, 0.999)
        self.assertEqual(bot.generation_params.temperature, 0.6)

        self.assertEqual(bot.knowledge.source_urls, ["https://aws.amazon.com/"])
        self.assertEqual(bot.knowledge.sitemap_urls, ["https://aws.amazon.sitemap.xml"])
        self.assertEqual(bot.knowledge.filenames, ["test.txt"])
        self.assertEqual(bot.sync_status, "RUNNING")
        self.assertEqual(bot.sync_status_reason, "reason")
        self.assertEqual(bot.sync_last_exec_id, "")
        self.assertEqual(bot.published_api_stack_name, "TestApiStack")
        self.assertEqual(bot.published_api_datetime, 1627984879)

        # Assert bot is stored in user1's bot list
        bot = find_private_bots_by_user_id("user1")
        self.assertEqual(len(bot), 1)
        self.assertEqual(bot[0].id, "1")
        self.assertEqual(bot[0].title, "Test Bot")
        self.assertEqual(bot[0].create_time, 1627984879.9)
        self.assertEqual(bot[0].last_used_time, 1627984879.9)
        self.assertEqual(bot[0].is_pinned, False)
        self.assertEqual(bot[0].is_pinned, False)
        self.assertEqual(bot[0].description, "Test Bot Description")
        self.assertEqual(bot[0].is_public, False)

        delete_bot_by_id("user1", "1")
        bot = find_private_bots_by_user_id("user1")
        self.assertEqual(len(bot), 0)

    def test_update_bot_last_used_time(self):
        bot = BotModel(
            id="1",
            title="Test Bot",
            description="Test Bot Description",
            instruction="Test Bot Prompt",
            create_time=1627984879.9,
            last_used_time=1627984879.9,
            is_pinned=False,
            public_bot_id=None,
            owner_user_id="user1",
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
                filenames=["test.txt"],
            ),
            sync_status="RUNNING",
            sync_status_reason="reason",
            sync_last_exec_id="",
            published_api_stack_name=None,
            published_api_datetime=None,
            published_api_codebuild_id=None,
            display_retrieved_chunks=True,
        )
        store_bot("user1", bot)
        update_bot_last_used_time("user1", "1")

        bot = find_private_bot_by_id("user1", "1")
        self.assertIsNotNone(bot.last_used_time)
        self.assertNotEqual(bot.last_used_time, 1627984879.9)
        self.assertEqual(bot.display_retrieved_chunks, True)

        delete_bot_by_id("user1", "1")

    def test_update_delete_bot_publication(self):
        bot = BotModel(
            id="1",
            title="Test Bot",
            description="Test Bot Description",
            instruction="Test Bot Prompt",
            create_time=1627984879.9,
            last_used_time=1627984879.9,
            is_pinned=False,
            public_bot_id=None,
            owner_user_id="user1",
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
                source_urls=["https://aws.amazon.com/jp"],
                sitemap_urls=["https://aws.amazon.sitemap.xml/jp"],
                filenames=["test.txt"],
            ),
            sync_status="FAILED",
            sync_status_reason="error",
            sync_last_exec_id="",
            published_api_stack_name=None,
            published_api_datetime=None,
            published_api_codebuild_id=None,
            display_retrieved_chunks=True,
        )
        store_bot("user1", bot)
        update_bot_publication("user1", "1", "api1", "build1")

        bot = find_private_bot_by_id("user1", "1")
        # NOTE: Stack naming rule: ApiPublishmentStack{published_api_id}.
        # See bedrock-chat-stack.ts > `ApiPublishmentStack`
        self.assertEqual(bot.published_api_stack_name, "ApiPublishmentStackapi1")
        self.assertIsNotNone(bot.published_api_datetime)
        self.assertEqual(bot.published_api_codebuild_id, "build1")

        delete_bot_publication("user1", "1")
        bot = find_private_bot_by_id("user1", "1")
        self.assertIsNone(bot.published_api_stack_name)
        self.assertIsNone(bot.published_api_datetime)
        self.assertIsNone(bot.published_api_codebuild_id)

        delete_bot_by_id("user1", "1")

    def test_update_bot(self):
        bot = BotModel(
            id="1",
            title="Test Bot",
            description="Test Bot Description",
            instruction="Test Bot Prompt",
            create_time=1627984879.9,
            last_used_time=1627984879.9,
            is_pinned=False,
            public_bot_id=None,
            owner_user_id="user1",
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
                source_urls=["https://aws.amazon.com/jp"],
                sitemap_urls=["https://aws.amazon.sitemap.xml/jp"],
                filenames=["test.txt"],
            ),
            sync_status="FAILED",
            sync_status_reason="error",
            sync_last_exec_id="",
            published_api_stack_name=None,
            published_api_datetime=None,
            published_api_codebuild_id=None,
            display_retrieved_chunks=True,
        )
        store_bot("user1", bot)
        update_bot(
            "user1",
            "1",
            title="Updated Title",
            description="Updated Description",
            instruction="Updated Instruction",
            embedding_params=EmbeddingParamsModel(
                chunk_size=500, chunk_overlap=100, enable_partition_pdf=False
            ),
            generation_params=GenerationParamsModel(
                max_tokens=2500,
                top_k=200,
                top_p=0.99,
                temperature=0.2,
                stop_sequences=["Human: ", "Assistant: "],
            ),
            search_params=SearchParamsModel(
                max_results=20,
            ),
            knowledge=KnowledgeModel(
                source_urls=["https://updated.com/"],
                sitemap_urls=["https://updated.xml"],
                filenames=["updated.txt"],
            ),
            sync_status="RUNNING",
            sync_status_reason="reason",
            display_retrieved_chunks=False,
        )

        bot = find_private_bot_by_id("user1", "1")
        self.assertEqual(bot.title, "Updated Title")
        self.assertEqual(bot.description, "Updated Description")
        self.assertEqual(bot.instruction, "Updated Instruction")
        self.assertEqual(bot.embedding_params.chunk_size, 500)
        self.assertEqual(bot.embedding_params.chunk_overlap, 100)

        self.assertEqual(bot.embedding_params.enable_partition_pdf, False)

        self.assertEqual(bot.generation_params.max_tokens, 2500)
        self.assertEqual(bot.generation_params.top_k, 200)
        self.assertEqual(bot.generation_params.top_p, 0.99)
        self.assertEqual(bot.generation_params.temperature, 0.2)

        self.assertEqual(bot.knowledge.source_urls, ["https://updated.com/"])
        self.assertEqual(bot.knowledge.sitemap_urls, ["https://updated.xml"])
        self.assertEqual(bot.knowledge.filenames, ["updated.txt"])
        self.assertEqual(bot.sync_status, "RUNNING")
        self.assertEqual(bot.sync_status_reason, "reason")
        self.assertEqual(bot.display_retrieved_chunks, False)

        delete_bot_by_id("user1", "1")


class TestFindAllBots(unittest.IsolatedAsyncioTestCase):
    def setUp(self) -> None:
        bot1 = BotModel(
            id="1",
            title="Test Bot",
            description="Test Bot Description",
            instruction="Test Bot Prompt",
            create_time=1627984879.9,
            last_used_time=1627984879.9,
            # Pinned
            is_pinned=True,
            public_bot_id=None,
            owner_user_id="user1",
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
                filenames=["test.txt"],
            ),
            sync_status="RUNNING",
            sync_status_reason="reason",
            sync_last_exec_id="",
            published_api_stack_name=None,
            published_api_datetime=None,
            published_api_codebuild_id=None,
            display_retrieved_chunks=True,
        )
        bot2 = BotModel(
            id="2",
            title="Test Bot",
            description="Test Bot Description",
            instruction="Test Bot Prompt",
            create_time=1627984879.9,
            last_used_time=1627984879.9,
            # Pinned
            is_pinned=True,
            public_bot_id=None,
            owner_user_id="user1",
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
                filenames=["test.txt"],
            ),
            sync_status="RUNNING",
            sync_status_reason="reason",
            sync_last_exec_id="",
            published_api_stack_name=None,
            published_api_datetime=None,
            published_api_codebuild_id=None,
            display_retrieved_chunks=True,
        )
        bot3 = BotModel(
            id="3",
            title="Test Bot",
            description="Test Bot Description",
            instruction="Test Bot Prompt",
            create_time=1627984879.9,
            last_used_time=1627984879.9,
            # Not Pinned
            is_pinned=False,
            public_bot_id=None,
            owner_user_id="user1",
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
                filenames=["test.txt"],
            ),
            sync_status="RUNNING",
            sync_status_reason="reason",
            sync_last_exec_id="",
            published_api_stack_name=None,
            published_api_datetime=None,
            published_api_codebuild_id=None,
            display_retrieved_chunks=True,
        )
        bot4 = BotModel(
            id="4",
            title="Test Bot",
            description="Test Bot Description",
            instruction="Test Bot Prompt",
            create_time=1627984879.9,
            last_used_time=1627984879.9,
            # Not Pinned
            is_pinned=False,
            public_bot_id=None,
            owner_user_id="user1",
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
                filenames=["test.txt"],
            ),
            sync_status="RUNNING",
            sync_status_reason="reason",
            sync_last_exec_id="",
            published_api_stack_name=None,
            published_api_datetime=None,
            published_api_codebuild_id=None,
            display_retrieved_chunks=True,
        )
        public_bot1 = BotModel(
            id="public1",
            title="Test Public Bot",
            description="Test Public Bot Description",
            instruction="Test Public Bot Prompt",
            create_time=1627984879.9,
            last_used_time=1627984879.9,
            is_pinned=True,
            public_bot_id=None,
            owner_user_id="user2",
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
                filenames=["test.txt"],
            ),
            sync_status="RUNNING",
            sync_status_reason="reason",
            sync_last_exec_id="",
            published_api_stack_name=None,
            published_api_datetime=None,
            published_api_codebuild_id=None,
            display_retrieved_chunks=True,
        )
        public_bot2 = BotModel(
            id="public2",
            title="Test Public Bot",
            description="Test Public Bot Description",
            instruction="Test Public Bot Prompt",
            create_time=1627984879.9,
            last_used_time=1627984879.9,
            is_pinned=True,
            public_bot_id=None,
            owner_user_id="user2",
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
                filenames=["test.txt"],
            ),
            sync_status="RUNNING",
            sync_status_reason="reason",
            sync_last_exec_id="",
            published_api_stack_name=None,
            published_api_datetime=None,
            published_api_codebuild_id=None,
            display_retrieved_chunks=True,
        )
        alias1 = BotAliasModel(
            id="alias1",
            # Different from original. Should be updated after `find_all_bots_by_user_id`
            title="Test Alias",
            description="Test Alias Description",
            original_bot_id="public1",
            last_used_time=1627984879.9,
            create_time=1627984879.9,
            # Pinned
            is_pinned=True,
            sync_status="RUNNING",
            has_knowledge=True,
        )
        alias2 = BotAliasModel(
            id="alias2",
            title="Test Alias",
            description="Test Alias Description",
            original_bot_id="public2",
            last_used_time=1627984879.9,
            create_time=1627984879.9,
            # Not Pinned
            is_pinned=False,
            sync_status="RUNNING",
            has_knowledge=True,
        )
        store_bot("user1", bot1)
        store_bot("user1", bot2)
        store_bot("user1", bot3)
        store_bot("user1", bot4)
        store_bot("user2", public_bot1)
        store_bot("user2", public_bot2)
        update_bot_visibility("user2", "public1", True)
        update_bot_visibility("user2", "public2", True)
        store_alias("user1", alias1)
        store_alias("user1", alias2)
        update_bot_publication("user2", "public1", "api1", "build1")

    def tearDown(self) -> None:
        delete_bot_by_id("user1", "1")
        delete_bot_by_id("user1", "2")
        delete_bot_by_id("user1", "3")
        delete_bot_by_id("user1", "4")
        delete_bot_by_id("user2", "public1")
        delete_bot_by_id("user2", "public2")
        delete_alias_by_id("user1", "alias1")
        delete_alias_by_id("user1", "alias2")

    def test_limit(self):
        # Only private bots
        bots = find_private_bots_by_user_id("user1", limit=3)
        self.assertEqual(len(bots), 3)
        fetched_bot_ids = set(bot.id for bot in bots)
        expected_bot_ids = {"1", "2", "3", "4"}
        self.assertTrue(fetched_bot_ids.issubset(expected_bot_ids))

    async def test_find_public_bots_by_ids(self):
        bots = await find_public_bots_by_ids(["public1", "public2", "1", "2"])
        # 2 public bots and 2 private bots
        self.assertEqual(len(bots), 2)

    async def test_find_all_published_bots(self):
        bots, next_token = find_all_published_bots()
        # Bot should not contain unpublished bots
        for bot in bots:
            self.assertIsNotNone(bot.published_api_stack_name)
            self.assertIsNotNone(bot.published_api_datetime)
        # Next token should be None
        self.assertIsNone(next_token)


class TestUpdateBotVisibility(unittest.TestCase):
    def setUp(self) -> None:
        bot1 = BotModel(
            id="1",
            title="Test Bot",
            description="Test Bot Description",
            instruction="Test Bot Prompt",
            create_time=1627984879.9,
            last_used_time=1627984879.9,
            is_pinned=True,
            public_bot_id=None,
            owner_user_id="user1",
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
                filenames=["test.txt"],
            ),
            sync_status="RUNNING",
            sync_status_reason="reason",
            sync_last_exec_id="",
            published_api_stack_name=None,
            published_api_datetime=None,
            published_api_codebuild_id=None,
            display_retrieved_chunks=True,
        )
        bot2 = BotModel(
            id="2",
            title="Test Bot",
            description="Test Bot Description",
            instruction="Test Bot Prompt",
            create_time=1627984879.9,
            last_used_time=1627984879.9,
            is_pinned=True,
            public_bot_id=None,
            owner_user_id="user1",
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
                filenames=["test.txt"],
            ),
            sync_status="RUNNING",
            sync_status_reason="reason",
            sync_last_exec_id="",
            published_api_stack_name=None,
            published_api_datetime=None,
            published_api_codebuild_id=None,
            display_retrieved_chunks=True,
        )
        public1 = BotModel(
            id="public1",
            title="Test Public Bot",
            description="Test Public Bot Description",
            instruction="Test Public Bot Prompt",
            create_time=1627984879.9,
            last_used_time=1627984879.9,
            is_pinned=False,
            public_bot_id="public1",
            owner_user_id="user2",
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
                filenames=["test.txt"],
            ),
            sync_status="RUNNING",
            sync_status_reason="reason",
            sync_last_exec_id="",
            published_api_stack_name=None,
            published_api_datetime=None,
            published_api_codebuild_id=None,
            display_retrieved_chunks=True,
        )
        alias1 = BotAliasModel(
            id="4",
            title="Test Alias",
            description="Test Alias Description",
            original_bot_id="public1",
            last_used_time=1627984879.9,
            create_time=1627984879.9,
            is_pinned=True,
            sync_status="RUNNING",
            has_knowledge=True,
        )
        store_bot("user1", bot1)
        store_bot("user1", bot2)
        store_bot("user2", public1)
        update_bot_visibility("user2", "public1", True)
        store_alias("user1", alias1)

    def tearDown(self) -> None:
        delete_bot_by_id("user1", "1")
        delete_bot_by_id("user1", "2")
        delete_bot_by_id("user2", "public1")
        delete_alias_by_id("user1", "4")

    def test_update_bot_visibility(self):
        # Change original tilte
        update_bot(
            "user2",
            "public1",
            title="Updated Title",
            description="",
            instruction="",
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
            knowledge=KnowledgeModel(source_urls=[], sitemap_urls=[], filenames=[]),
            sync_status="RUNNING",
            sync_status_reason="",
            display_retrieved_chunks=True,
        )
        bots = fetch_all_bots_by_user_id("user1", limit=3)
        self.assertEqual(len(bots), 3)
        self.assertEqual(bots[0].id, "1")
        self.assertEqual(bots[1].id, "2")
        self.assertEqual(bots[2].id, "public1")
        self.assertEqual(bots[2].title, "Updated Title")
        self.assertEqual(bots[2].available, True)

        # Make private
        update_bot_visibility("user2", "public1", False)
        bots = fetch_all_bots_by_user_id("user1", limit=3)
        self.assertEqual(len(bots), 3)
        self.assertEqual(bots[0].id, "1")
        self.assertEqual(bots[1].id, "2")
        self.assertEqual(bots[2].id, "public1")
        # Public bot is NOT available. But title is still the latest one
        self.assertEqual(bots[2].title, "Updated Title")
        self.assertEqual(bots[2].available, False)


if __name__ == "__main__":
    unittest.main()
