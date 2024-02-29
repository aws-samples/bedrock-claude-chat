import sys
import unittest

sys.path.append(".")

from pprint import pprint

from app.repositories.usage_analysis import find_bots_sorted_by_price


class TestUsageAnalysis(unittest.IsolatedAsyncioTestCase):
    async def test_find_bots_sorted_by_price(self):
        bots = await find_bots_sorted_by_price(limit=100)
        pprint([bot.model_dump() for bot in bots])


if __name__ == "__main__":
    unittest.main()
