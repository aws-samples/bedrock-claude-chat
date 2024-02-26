import sys
import unittest
from pprint import pprint

sys.path.append(".")

from app.repositories.apigateway import find_usage_plan_by_id


class TestApiGatewayRepository(unittest.TestCase):
    def test_find_usage_plan_by_id(self):
        usage_plan_id = "z64d3o"
        plan = find_usage_plan_by_id(usage_plan_id)
        pprint(plan)
        self.assertTrue(plan is not None)


if __name__ == "__main__":
    unittest.main()
