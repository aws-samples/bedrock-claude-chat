import sys
import unittest
from pprint import pprint

sys.path.append(".")

from app.repositories.cloudformation import find_all_published_api_stacks


class TestCloudformationRepository(unittest.TestCase):
    def test_find_all_published_api_stacks(self):
        stacks = find_all_published_api_stacks()
        pprint(stacks)
        self.assertTrue(len(stacks) > 0)

    def test_find_all_published_api_stacks_with_limit(self):
        limit = 2
        stacks = find_all_published_api_stacks(limit=limit)
        self.assertTrue(len(stacks) <= limit)


if __name__ == "__main__":
    unittest.main()
