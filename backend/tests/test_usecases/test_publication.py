import sys

sys.path.insert(0, ".")
import unittest
from unittest.mock import MagicMock, patch

from app.routes.schemas.api_publication import ApiKeyInput
from app.usecases import publication
from app.user import User
from tests.test_repositories.utils.bot_factory import (
    create_test_partial_shared_bot,
    create_test_published_bot,
)

BOT_ID = "bot1"
OWNER_ID = "owner"
API_KEY_ID = "key1"


def _user(user_id: str, groups: list[str]) -> User:
    return User(id=user_id, name=user_id, email=f"{user_id}@example.com", groups=groups)


OWNER = _user(OWNER_ID, ["PublishAllowed"])
ADMIN = _user("admin", ["Admin"])
OTHER_PUBLISHER = _user("other", ["PublishAllowed"])


class TestPublicationPermission(unittest.TestCase):
    """Publication endpoints must be restricted to the bot owner and admins."""

    def setUp(self):
        self.bot = create_test_published_bot(BOT_ID, OWNER_ID, is_starred=False)

        stack = MagicMock(
            stack_status="CREATE_COMPLETE",
            api_usage_plan_id="plan1",
            api_stage="api",
            api_id="restapi1",
            api_allowed_origins=["*"],
        )
        usage_plan = MagicMock(id="plan1", key_ids=[API_KEY_ID])
        usage_plan.quota.limit = None
        usage_plan.quota.offset = None
        usage_plan.quota.period = None
        usage_plan.throttle.rate_limit = None
        usage_plan.throttle.burst_limit = None
        api_key = MagicMock(
            id=API_KEY_ID,
            value="secret-value",
            description="desc",
            enabled=True,
            created_date=1627984879,
        )

        self.mocks = {}
        targets = {
            "find_bot_by_id": MagicMock(side_effect=lambda _: self.bot),
            "find_stack_by_bot_id": MagicMock(return_value=stack),
            "find_usage_plan_by_id": MagicMock(return_value=usage_plan),
            "find_api_key_by_id": MagicMock(return_value=api_key),
            "find_build_status_by_build_id": MagicMock(return_value="SUCCEEDED"),
            "create_api_key": MagicMock(return_value=api_key),
            "delete_api_key": MagicMock(),
            "delete_stack_by_bot_id": MagicMock(),
            "delete_bot_publication": MagicMock(),
        }
        for name, mock in targets.items():
            patcher = patch.object(publication, name, mock)
            self.mocks[name] = patcher.start()
            self.addCleanup(patcher.stop)

    def _operations(self):
        return {
            "fetch_bot_publication": lambda u: publication.fetch_bot_publication(
                u, BOT_ID
            ),
            "remove_bot_publication": lambda u: publication.remove_bot_publication(
                u, BOT_ID
            ),
            "fetch_api_key": lambda u: publication.fetch_api_key(u, BOT_ID, API_KEY_ID),
            "create_new_api_key": lambda u: publication.create_new_api_key(
                u, BOT_ID, ApiKeyInput(description="desc")
            ),
            "remove_api_key": lambda u: publication.remove_api_key(
                u, BOT_ID, API_KEY_ID
            ),
        }

    def _assert_no_side_effects(self):
        for name in [
            "find_stack_by_bot_id",
            "find_api_key_by_id",
            "create_api_key",
            "delete_api_key",
            "delete_stack_by_bot_id",
            "delete_bot_publication",
        ]:
            self.mocks[name].assert_not_called()

    def test_non_owner_publisher_is_denied_on_bot_shared_with_all(self):
        for name, op in self._operations().items():
            with self.subTest(operation=name):
                with self.assertRaises(PermissionError):
                    op(OTHER_PUBLISHER)
                self._assert_no_side_effects()

    def test_non_owner_in_partial_share_is_denied(self):
        self.bot = create_test_partial_shared_bot(
            BOT_ID,
            False,
            OWNER_ID,
            allowed_cognito_users=[OTHER_PUBLISHER.id],
        )
        for name, op in self._operations().items():
            with self.subTest(operation=name):
                with self.assertRaises(PermissionError):
                    op(OTHER_PUBLISHER)
                self._assert_no_side_effects()

    def test_owner_can_fetch_api_key(self):
        key = publication.fetch_api_key(OWNER, BOT_ID, API_KEY_ID)
        self.assertEqual(key.value, "secret-value")

    def test_admin_can_fetch_api_key(self):
        key = publication.fetch_api_key(ADMIN, BOT_ID, API_KEY_ID)
        self.assertEqual(key.value, "secret-value")

    def test_owner_and_admin_are_allowed_for_all_operations(self):
        for user in [OWNER, ADMIN]:
            for name, op in self._operations().items():
                with self.subTest(user=user.id, operation=name):
                    op(user)


if __name__ == "__main__":
    unittest.main()
