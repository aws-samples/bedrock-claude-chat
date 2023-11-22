import sys
import unittest

sys.path.append(".")

from app.repositories.custom_bot import (
    delete_alias_by_id,
    delete_bot_by_id,
    find_bot_by_id,
    find_bot_by_user_id,
    find_pinned_bots,
    store_alias,
    store_bot,
    update_last_used_time,
)
from app.repositories.model import BotAliasModel, BotModel


class TestCustomBotRepository(unittest.TestCase):
    def test_store_and_find_bot(self):
        bot = BotModel(
            id="1",
            title="Test Bot",
            instruction="Test Bot Prompt",
            description="Test Bot Description",
            create_time=1627984879.9,
            last_used_time=1627984879.9,
            is_public=True,
            is_pinned=False,
        )
        store_bot("user1", bot)

        # Assert bot is stored and reconstructed correctly
        bot = find_bot_by_id("user1", "1")
        self.assertEqual(bot.id, "1")
        self.assertEqual(bot.title, "Test Bot")
        self.assertEqual(bot.description, "Test Bot Description")
        self.assertEqual(bot.instruction, "Test Bot Prompt")
        self.assertEqual(bot.create_time, 1627984879.9)
        self.assertEqual(bot.last_used_time, 1627984879.9)
        self.assertEqual(bot.is_public, True)
        self.assertEqual(bot.is_pinned, False)

        # Assert bot is stored in user1's bot list
        bot = find_bot_by_user_id("user1")
        self.assertEqual(len(bot), 1)
        self.assertEqual(bot[0].id, "1")
        self.assertEqual(bot[0].title, "Test Bot")
        self.assertEqual(bot[0].create_time, 1627984879.9)
        self.assertEqual(bot[0].last_used_time, 1627984879.9)

        delete_bot_by_id("user1", "1")
        bot = find_bot_by_user_id("user1")
        self.assertEqual(len(bot), 0)

    def test_update_last_used_time(self):
        bot = BotModel(
            id="1",
            title="Test Bot",
            description="Test Bot Description",
            instruction="Test Bot Prompt",
            create_time=1627984879.9,
            last_used_time=1627984879.9,
            is_public=False,
            is_pinned=False,
        )
        store_bot("user1", bot)
        update_last_used_time("user1", "1")

        bot = find_bot_by_id("user1", "1")
        self.assertIsNotNone(bot.last_used_time)
        self.assertNotEqual(bot.last_used_time, 1627984879.9)

        delete_bot_by_id("user1", "1")

    def test_order_is_descending(self):
        bot1 = BotModel(
            id="1",
            title="Test Bot",
            description="Test Bot Description",
            instruction="Test Bot Prompt",
            create_time=1627984879.9,
            last_used_time=1627984879.9,
            is_public=False,
            is_pinned=False,
        )
        bot2 = BotModel(
            id="2",
            title="Test Bot",
            description="Test Bot Description",
            instruction="Test Bot Prompt",
            create_time=1627984879.9,
            last_used_time=1627984879.9,
            is_public=False,
            is_pinned=False,
        )
        bot3 = BotModel(
            id="3",
            title="Test Bot",
            description="Test Bot Description",
            instruction="Test Bot Prompt",
            create_time=1627984879.9,
            last_used_time=1627984879.9,
            is_public=False,
            is_pinned=False,
        )
        bot4 = BotModel(
            id="4",
            title="Test Bot",
            description="Test Bot Description",
            instruction="Test Bot Prompt",
            create_time=1627984879.9,
            last_used_time=1627984879.9,
            is_public=False,
            is_pinned=False,
        )
        store_bot("user1", bot1)
        store_bot("user1", bot2)
        store_bot("user1", bot3)
        store_bot("user1", bot4)

        # 1 -> 3 -> 2 -> 4
        update_last_used_time("user1", "1")
        update_last_used_time("user1", "3")
        update_last_used_time("user1", "2")
        update_last_used_time("user1", "4")

        # Should be 4 -> 2 -> 3 -> 1
        bots = find_bot_by_user_id("user1")
        self.assertEqual(len(bots), 4)
        self.assertEqual(bots[0].id, "4")
        self.assertEqual(bots[1].id, "2")
        self.assertEqual(bots[2].id, "3")
        self.assertEqual(bots[3].id, "1")

        delete_bot_by_id("user1", "1")
        delete_bot_by_id("user1", "2")
        delete_bot_by_id("user1", "3")
        delete_bot_by_id("user1", "4")

    def test_limit(self):
        bot1 = BotModel(
            id="1",
            title="Test Bot",
            description="Test Bot Description",
            instruction="Test Bot Prompt",
            create_time=1627984879.9,
            last_used_time=1627984879.9,
            is_public=False,
            is_pinned=False,
        )
        bot2 = BotModel(
            id="2",
            title="Test Bot",
            description="Test Bot Description",
            instruction="Test Bot Prompt",
            create_time=1627984879.9,
            last_used_time=1627984879.9,
            is_public=False,
            is_pinned=False,
        )
        bot3 = BotModel(
            id="3",
            title="Test Bot",
            description="Test Bot Description",
            instruction="Test Bot Prompt",
            create_time=1627984879.9,
            last_used_time=1627984879.9,
            is_public=False,
            is_pinned=False,
        )
        store_bot("user1", bot1)
        store_bot("user1", bot2)
        store_bot("user1", bot3)

        bots = find_bot_by_user_id("user1", limit=2)
        self.assertEqual(len(bots), 2)

        delete_bot_by_id("user1", "1")
        delete_bot_by_id("user1", "2")
        delete_bot_by_id("user1", "3")

    def test_find_pinned_bots(self):
        private_bot1 = BotModel(
            id="1",
            title="Test Bot",
            description="Test Bot Description",
            instruction="Test Bot Prompt",
            create_time=1627984879.9,
            last_used_time=1627984879.9,
            is_public=False,
            # Pinned
            is_pinned=True,
        )
        private_bot2 = BotModel(
            id="2",
            title="Test Bot",
            description="Test Bot Description",
            instruction="Test Bot Prompt",
            create_time=1627984879.9,
            last_used_time=1627984879.9,
            is_public=False,
            # Not Pinned
            is_pinned=False,
        )
        public_bot = BotModel(
            id="3",
            title="Test Public Bot",
            description="Test Bot Description",
            instruction="Test Bot Prompt",
            create_time=1627984879.9,
            last_used_time=1627984879.9,
            # Open to public
            is_public=True,
            # Pinned
            is_pinned=True,
        )
        alias = BotAliasModel(
            id="4",
            original_bot_id="3",
            last_used_time=1627984879.9,
            create_time=1627984879.9,
            is_pinned=True,
            # Alias bot has owner user id
            owner_user_id="user2",
        )

        # Store private bots as user1
        store_bot("user1", private_bot1)
        store_bot("user1", private_bot2)
        # Store public bot owned by `user2`
        store_bot("user2", public_bot)
        # Store alias to public bot
        store_alias("user1", alias)

        bots = find_pinned_bots("user1")

        self.assertEqual(len(bots), 2)
        # Pinned private bot
        self.assertEqual(bots[0].id, "1")
        self.assertEqual(bots[1].id, "3")
        # Original bot (Test Public Bot) should be fetched
        self.assertEqual(bots[1].title, "Test Public Bot")

        bots = find_bot_by_user_id("user1")
        # Alias bot should not be included
        self.assertEqual(len(bots), 2)
        self.assertEqual(bots[0].id, "1")
        self.assertEqual(bots[1].id, "2")

        delete_bot_by_id("user1", "1")
        delete_bot_by_id("user1", "2")
        delete_bot_by_id("user2", "3")
        delete_alias_by_id("user1", "4")


if __name__ == "__main__":
    unittest.main()
