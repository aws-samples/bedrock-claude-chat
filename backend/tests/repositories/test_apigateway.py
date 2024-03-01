import sys
import unittest
from pprint import pprint

sys.path.append(".")

from app.repositories.apigateway import (
    create_api_key,
    delete_api_key,
    find_api_key_by_id,
    find_usage_plan_by_id,
)

# Edit before running (Need to create a api stack. To do so, run codebuild project).
usage_plan_id = "rov58p"


class TestApiGatewayRepository(unittest.TestCase):
    def test_find_usage_plan_by_id(self):
        plan = find_usage_plan_by_id(usage_plan_id)
        pprint(plan)
        self.assertTrue(plan is not None)

    def test_find_api_key_by_id(self):
        plan = find_usage_plan_by_id(usage_plan_id)
        key_id = plan.key_ids[0]
        key = find_api_key_by_id(key_id, include_value=True)
        pprint(key)
        self.assertTrue(key is not None)
        self.assertEqual(key.id, key_id)
        self.assertEqual(key.enabled, True)

    def test_create_delete_api_key(self):
        res = create_api_key(usage_plan_id, "description")
        key = find_api_key_by_id(res.id, include_value=True)
        self.assertEqual(key.id, res.id)
        self.assertEqual(key.enabled, True)
        self.assertEqual(key.description, "description")
        delete_api_key(key.id)


if __name__ == "__main__":
    unittest.main()
