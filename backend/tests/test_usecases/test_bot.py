import sys

sys.path.insert(0, ".")
import unittest

from pydantic import BaseModel

from tests.test_usecases.utils.bot_factory import (
    create_test_bot_alias,
    create_test_private_bot,
    create_test_public_bot,
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

    first_public_bot_id = "public1"
    second_public_bot_id = "public2"

    first_bot_alias_id = "alias1"
    second_bot_alias_id = "alias2"

    first_bot_id = "1"
    second_bot_id = "2"
    third_bot_id = "3"
    fourth_bot_id = "4"

    def setUp(self) -> None:
        bot1 = create_test_private_bot(self.first_bot_id, True, self.first_user_id)
        bot2 = create_test_private_bot(self.second_bot_id, True, self.first_user_id)
        bot3 = create_test_private_bot(self.third_bot_id, False, self.first_user_id)
        bot4 = create_test_private_bot(self.fourth_bot_id, False, self.first_user_id)

        public_bot1 = create_test_public_bot(
            self.first_public_bot_id, True, self.second_user_id
        )
        public_bot2 = create_test_public_bot(
            self.second_public_bot_id, True, self.second_user_id
        )

        alias1 = create_test_bot_alias(
            self.first_bot_alias_id, self.first_public_bot_id, True
        )
        alias2 = create_test_bot_alias(
            self.second_bot_alias_id, self.second_public_bot_id, False
        )

        store_bot(self.first_user_id, bot1)
        store_bot(self.first_user_id, bot2)
        store_bot(self.first_user_id, bot3)
        store_bot(self.first_user_id, bot4)
        store_bot(self.second_user_id, public_bot1)
        store_bot(self.second_user_id, public_bot2)
        update_bot_visibility(self.second_user_id, self.first_public_bot_id, True)
        update_bot_visibility(self.second_user_id, self.second_public_bot_id, True)
        store_alias(self.first_user_id, alias1)
        store_alias(self.first_user_id, alias2)
        update_bot_publication(
            self.second_user_id, self.first_public_bot_id, "api1", "build1"
        )

    def tearDown(self) -> None:
        delete_bot_by_id(self.first_user_id, self.first_bot_id)
        delete_bot_by_id(self.first_user_id, self.second_bot_id)
        delete_bot_by_id(self.first_user_id, self.third_bot_id)
        delete_bot_by_id(self.first_user_id, self.fourth_bot_id)
        delete_bot_by_id(self.second_user_id, self.first_public_bot_id)
        delete_bot_by_id(self.second_user_id, self.second_public_bot_id)
        delete_alias_by_id(self.first_user_id, self.first_bot_alias_id)
        delete_alias_by_id(self.first_user_id, self.second_bot_alias_id)

    def test_limit(self):
        # Private + public bots
        bots = fetch_all_bots_by_user_id(self.first_user_id, limit=3)
        self.assertEqual(len(bots), 3)
        fetched_bot_ids = set(bot.id for bot in bots)
        expected_bot_ids = {
            self.first_public_bot_id,
            self.second_public_bot_id,
            self.first_bot_id,
            self.second_bot_id,
            self.third_bot_id,
            self.fourth_bot_id,
        }
        self.assertTrue(fetched_bot_ids.issubset(expected_bot_ids))

    def test_find_pinned_bots(self):
        # Only pinned bots fetched
        bots = fetch_all_bots_by_user_id(self.first_user_id, only_pinned=True)
        self.assertEqual(len(bots), 3)

        fetched_bot_ids = set(bot.id for bot in bots)
        expected_bot_ids = {
            self.first_bot_id,
            self.second_bot_id,
            self.first_public_bot_id,
        }

        self.assertTrue(expected_bot_ids.issubset(fetched_bot_ids))

    def test_order_is_descending(self):
        # 1 -> 3 -> alias1 (public1) -> 2 -> 4 -> alias2 (public2)
        update_bot_last_used_time(self.first_user_id, self.first_bot_id)
        update_bot_last_used_time(self.first_user_id, self.third_bot_id)
        update_alias_last_used_time(self.first_user_id, self.first_bot_alias_id)
        update_bot_last_used_time(self.first_user_id, self.second_bot_id)
        update_bot_last_used_time(self.first_user_id, self.fourth_bot_id)
        update_alias_last_used_time(self.first_user_id, self.second_bot_alias_id)

        # Should be alias2 -> 4 -> 2 -> alias1 -> 3 -> 1
        bots = fetch_all_bots_by_user_id(self.first_user_id, limit=6)
        self.assertEqual(len(bots), 6)
        self.assertEqual(bots[0].id, self.second_public_bot_id)
        self.assertEqual(bots[1].id, self.fourth_bot_id)
        self.assertEqual(bots[2].id, self.second_bot_id)
        self.assertEqual(bots[3].id, self.first_public_bot_id)
        self.assertEqual(bots[4].id, self.third_bot_id)
        self.assertEqual(bots[5].id, self.first_bot_id)


if __name__ == "__main__":
    unittest.main()
