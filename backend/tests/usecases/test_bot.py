import sys

sys.path.append(".")
import unittest

from app.repositories.custom_bot import (
    delete_alias_by_id,
    delete_bot_by_id,
    store_alias,
    store_bot,
    update_alias_last_used_time,
    update_bot_last_used_time,
    update_bot_publication,
    update_bot_visibility,
)
from app.repositories.models.custom_bot import BotAliasModel, BotModel, KnowledgeModel
from app.usecases.bot import fetch_all_bots_by_user_id, issue_presigned_url


class TestIssuePresignedUrl(unittest.TestCase):
    def test_issue_presigned_url(self):
        url = issue_presigned_url(
            "test_user", "test_bot", "test_file", content_type="image/png"
        )
        self.assertEqual(type(url), str)
        self.assertTrue(url.startswith("https://"))


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
        )
        alias1 = BotAliasModel(
            id="alias1",
            # Different from original. Should be updated after `fetch_all_bots_by_user_id`
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
        # Private + public bots
        bots = fetch_all_bots_by_user_id("user1", limit=3)
        self.assertEqual(len(bots), 3)
        fetched_bot_ids = set(bot.id for bot in bots)
        expected_bot_ids = {"public1", "public2", "1", "2", "3", "4"}
        self.assertTrue(fetched_bot_ids.issubset(expected_bot_ids))

    def test_find_pinned_bots(self):
        # Only pinned bots fetched
        bots = fetch_all_bots_by_user_id("user1", only_pinned=True)
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

        # Should be alias2 -> 4 -> 2 -> alias1 -> 3 -> 1
        bots = fetch_all_bots_by_user_id("user1", limit=6)
        self.assertEqual(len(bots), 6)
        self.assertEqual(bots[0].id, "public2")
        self.assertEqual(bots[1].id, "4")
        self.assertEqual(bots[2].id, "2")
        self.assertEqual(bots[3].id, "public1")
        self.assertEqual(bots[4].id, "3")
        self.assertEqual(bots[5].id, "1")


if __name__ == "__main__":
    unittest.main()
