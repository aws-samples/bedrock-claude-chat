import sys
import unittest

sys.path.append(".")

from pprint import pprint

from app.repositories.usage_analysis import (
    _find_cognito_user_by_id,
    _find_cognito_users_by_ids,
    find_bots_sorted_by_price,
    find_users_sorted_by_price,
)


class TestUsageAnalysis(unittest.IsolatedAsyncioTestCase):
    async def test_find_bots_sorted_by_price(self):
        bots = await find_bots_sorted_by_price(
            limit=10, from_="2024010100", to_="2024120100"
        )
        pprint([bot.model_dump() for bot in bots])

    async def test_find_users_sorted_by_price(self):
        users = await find_users_sorted_by_price(
            limit=10, from_="2024010100", to_="2024120100"
        )
        pprint([user.model_dump() for user in users])


class TestCognitoUser(unittest.IsolatedAsyncioTestCase):
    async def test_find_cognito_user_by_id(self):
        user = _find_cognito_user_by_id("07645ad8-b041-702e-9852-98b169c9f1b1")
        pprint(user)

    async def test_find_cognito_users_by_ids(self):
        users = await _find_cognito_users_by_ids(
            [
                "07645ad8-b041-702e-9852-98b169c9f1b1",
                "c7345a28-00b1-70f1-632f-dcef9f455949",
            ]
        )
        pprint(users)


if __name__ == "__main__":
    unittest.main()
