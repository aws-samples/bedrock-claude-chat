import sys
import unittest

sys.path.append(".")

from app.repositories.custom_bot import (
    delete_alias_by_id,
    delete_bot_by_id,
    find_all_bots_by_user_id,
    find_private_bot_by_id,
    find_private_bots_by_user_id,
    store_alias,
    store_bot,
    update_alias_last_used_time,
    update_bot,
    update_bot_last_used_time,
    update_bot_visibility,
)
from app.repositories.model import BotAliasModel, BotModel, KnowledgeModel


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
            knowledge=KnowledgeModel(
                source_urls=["https://aws.amazon.com/"],
                sitemap_urls=["https://aws.amazon.sitemap.xml"],
                filenames=["test.txt"],
            ),
            sync_status="RUNNING",
            sync_status_reason="reason",
            sync_last_exec_id="",
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
        self.assertEqual(bot.knowledge.source_urls, ["https://aws.amazon.com/"])
        self.assertEqual(bot.knowledge.sitemap_urls, ["https://aws.amazon.sitemap.xml"])
        self.assertEqual(bot.knowledge.filenames, ["test.txt"])
        self.assertEqual(bot.sync_status, "RUNNING")
        self.assertEqual(bot.sync_status_reason, "reason")

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
            knowledge=KnowledgeModel(
                source_urls=["https://aws.amazon.com/"],
                sitemap_urls=["https://aws.amazon.sitemap.xml"],
                filenames=["test.txt"],
            ),
            sync_status="RUNNING",
            sync_status_reason="reason",
            sync_last_exec_id="",
        )
        store_bot("user1", bot)
        update_bot_last_used_time("user1", "1")

        bot = find_private_bot_by_id("user1", "1")
        self.assertIsNotNone(bot.last_used_time)
        self.assertNotEqual(bot.last_used_time, 1627984879.9)

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
            knowledge=KnowledgeModel(
                source_urls=["https://aws.amazon.com/jp"],
                sitemap_urls=["https://aws.amazon.sitemap.xml/jp"],
                filenames=["test.txt"],
            ),
            sync_status="FAILED",
            sync_status_reason="error",
            sync_last_exec_id="",
        )
        store_bot("user1", bot)
        update_bot(
            "user1",
            "1",
            title="Updated Title",
            description="Updated Description",
            instruction="Updated Instruction",
            knowledge=KnowledgeModel(
                source_urls=["https://updated.com/"],
                sitemap_urls=["https://updated.xml"],
                filenames=["updated.txt"],
            ),
            sync_status="RUNNING",
            sync_status_reason="reason",
        )

        bot = find_private_bot_by_id("user1", "1")
        self.assertEqual(bot.title, "Updated Title")
        self.assertEqual(bot.description, "Updated Description")
        self.assertEqual(bot.instruction, "Updated Instruction")
        self.assertEqual(bot.knowledge.source_urls, ["https://updated.com/"])
        self.assertEqual(bot.knowledge.sitemap_urls, ["https://updated.xml"])
        self.assertEqual(bot.knowledge.filenames, ["updated.txt"])
        self.assertEqual(bot.sync_status, "RUNNING")
        self.assertEqual(bot.sync_status_reason, "reason")

        delete_bot_by_id("user1", "1")


class TestFindAllBots(unittest.TestCase):
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
            knowledge=KnowledgeModel(
                source_urls=["https://aws.amazon.com/"],
                sitemap_urls=["https://aws.amazon.sitemap.xml"],
                filenames=["test.txt"],
            ),
            sync_status="RUNNING",
            sync_status_reason="reason",
            sync_last_exec_id="",
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
            knowledge=KnowledgeModel(
                source_urls=["https://aws.amazon.com/"],
                sitemap_urls=["https://aws.amazon.sitemap.xml"],
                filenames=["test.txt"],
            ),
            sync_status="RUNNING",
            sync_status_reason="reason",
            sync_last_exec_id="",
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
            knowledge=KnowledgeModel(
                source_urls=["https://aws.amazon.com/"],
                sitemap_urls=["https://aws.amazon.sitemap.xml"],
                filenames=["test.txt"],
            ),
            sync_status="RUNNING",
            sync_status_reason="reason",
            sync_last_exec_id="",
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
            knowledge=KnowledgeModel(
                source_urls=["https://aws.amazon.com/"],
                sitemap_urls=["https://aws.amazon.sitemap.xml"],
                filenames=["test.txt"],
            ),
            sync_status="RUNNING",
            sync_status_reason="reason",
            sync_last_exec_id="",
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
            knowledge=KnowledgeModel(
                source_urls=["https://aws.amazon.com/"],
                sitemap_urls=["https://aws.amazon.sitemap.xml"],
                filenames=["test.txt"],
            ),
            sync_status="RUNNING",
            sync_status_reason="reason",
            sync_last_exec_id="",
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
            knowledge=KnowledgeModel(
                source_urls=["https://aws.amazon.com/"],
                sitemap_urls=["https://aws.amazon.sitemap.xml"],
                filenames=["test.txt"],
            ),
            sync_status="RUNNING",
            sync_status_reason="reason",
            sync_last_exec_id="",
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

        # Private + public bots
        bots = find_all_bots_by_user_id("user1", limit=3)
        self.assertEqual(len(bots), 3)
        fetched_bot_ids = set(bot.id for bot in bots)
        expected_bot_ids = {"public1", "public2", "1", "2", "3", "4"}
        self.assertTrue(fetched_bot_ids.issubset(expected_bot_ids))

    def test_find_pinned_bots(self):
        # Only pinned bots fetched
        bots = find_all_bots_by_user_id("user1", only_pinned=True)
        self.assertEqual(len(bots), 3)

        fetched_bot_ids = set(bot.id for bot in bots)
        expected_bot_ids = {"1", "2", "public1"}

        self.assertTrue(expected_bot_ids.issubset(fetched_bot_ids))

    def test_order_is_descending(self):
        # 1 -> 3 -> alias1 (public1) -> 2 -> 4 -> alias2 (public2)
        update_bot_last_used_time("user1", "1")
        update_bot_last_used_time("user1", "3")
        update_alias_last_used_time("user1", "alias1")
        update_bot_last_used_time("user1", "2")
        update_bot_last_used_time("user1", "4")
        update_alias_last_used_time("user1", "alias2")

        # Should be 4 -> 2 -> 3 -> 1
        bots = find_private_bots_by_user_id("user1")
        self.assertEqual(len(bots), 4)
        self.assertEqual(bots[0].id, "4")
        self.assertEqual(bots[1].id, "2")
        self.assertEqual(bots[2].id, "3")
        self.assertEqual(bots[3].id, "1")

        # Should be alias2 -> 4 -> 2 -> alias1 -> 3 -> 1
        bots = find_all_bots_by_user_id("user1", limit=6)
        self.assertEqual(len(bots), 6)
        self.assertEqual(bots[0].id, "public2")
        self.assertEqual(bots[1].id, "4")
        self.assertEqual(bots[2].id, "2")
        self.assertEqual(bots[3].id, "public1")
        self.assertEqual(bots[4].id, "3")
        self.assertEqual(bots[5].id, "1")


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
            knowledge=KnowledgeModel(
                source_urls=["https://aws.amazon.com/"],
                sitemap_urls=["https://aws.amazon.sitemap.xml"],
                filenames=["test.txt"],
            ),
            sync_status="RUNNING",
            sync_status_reason="reason",
            sync_last_exec_id="",
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
            knowledge=KnowledgeModel(
                source_urls=["https://aws.amazon.com/"],
                sitemap_urls=["https://aws.amazon.sitemap.xml"],
                filenames=["test.txt"],
            ),
            sync_status="RUNNING",
            sync_status_reason="reason",
            sync_last_exec_id="",
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
            knowledge=KnowledgeModel(
                source_urls=["https://aws.amazon.com/"],
                sitemap_urls=["https://aws.amazon.sitemap.xml"],
                filenames=["test.txt"],
            ),
            sync_status="RUNNING",
            sync_status_reason="reason",
            sync_last_exec_id="",
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
            knowledge=KnowledgeModel(source_urls=[], sitemap_urls=[], filenames=[]),
            sync_status="RUNNING",
            sync_status_reason="",
        )
        bots = find_all_bots_by_user_id("user1", limit=3)
        self.assertEqual(len(bots), 3)
        self.assertEqual(bots[0].id, "1")
        self.assertEqual(bots[1].id, "2")
        self.assertEqual(bots[2].id, "public1")
        self.assertEqual(bots[2].title, "Updated Title")
        self.assertEqual(bots[2].available, True)

        # Make private
        update_bot_visibility("user2", "public1", False)
        bots = find_all_bots_by_user_id("user1", limit=3)
        self.assertEqual(len(bots), 3)
        self.assertEqual(bots[0].id, "1")
        self.assertEqual(bots[1].id, "2")
        self.assertEqual(bots[2].id, "public1")
        # Public bot is NOT available. But title is still the latest one
        self.assertEqual(bots[2].title, "Updated Title")
        self.assertEqual(bots[2].available, False)


if __name__ == "__main__":
    unittest.main()
