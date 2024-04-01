import sys


sys.path.append(".")
import unittest

from pydantic import BaseModel

from tests.utils.optimized import (
    create_bot_alias,
    create_private_bot,
    create_public_bot,
)

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

from app.usecases.bot import fetch_all_bots_by_user_id, issue_presigned_url


class TestIssuePresignedUrl(unittest.TestCase):
    def test_issue_presigned_url(self):
        url = issue_presigned_url(
            "test_user", "test_bot", "test_file", content_type="image/png"
        )
        self.assertEqual(type(url), str)
        self.assertTrue(url.startswith("https://"))


class TestFindAllBots(unittest.IsolatedAsyncioTestCase):
    first_user_id = "user1"
    second_user_id = "user2"

    def setUp(self) -> None:
        bot1 = create_private_bot("1", True, self.first_user_id)
        bot2 = create_private_bot("2", True, self.first_user_id)
        bot3 = create_private_bot("3", False, self.first_user_id)
        bot4 = create_private_bot("4", False, self.first_user_id)

        public_bot1 = create_public_bot("public1", True, self.second_user_id)
        public_bot2 = create_public_bot("public2", True, self.second_user_id)

        alias1 = create_bot_alias("alias1", "public1", True)
        alias2 = create_bot_alias("alias2", "public2", False)

        store_bot(self.first_user_id, bot1)
        store_bot(self.first_user_id, bot2)
        store_bot(self.first_user_id, bot3)
        store_bot(self.first_user_id, bot4)
        store_bot(self.second_user_id, public_bot1)
        store_bot(self.second_user_id, public_bot2)
        update_bot_visibility(self.second_user_id, "public1", True)
        update_bot_visibility(self.second_user_id, "public2", True)
        store_alias(self.first_user_id, alias1)
        store_alias(self.first_user_id, alias2)
        update_bot_publication(self.second_user_id, "public1", "api1", "build1")

    def tearDown(self) -> None:
        delete_bot_by_id(self.first_user_id, "1")
        delete_bot_by_id(self.first_user_id, "2")
        delete_bot_by_id(self.first_user_id, "3")
        delete_bot_by_id(self.first_user_id, "4")
        delete_bot_by_id(self.second_user_id, "public1")
        delete_bot_by_id(self.second_user_id, "public2")
        delete_alias_by_id(self.first_user_id, "alias1")
        delete_alias_by_id(self.first_user_id, "alias2")

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
