import sys
import unittest
from pprint import pprint

sys.path.append(".")

from app.repositories.cloudformation import find_stack_by_bot_id

# Edit before running (Need to create a api stack with the bot_id).
bot_id = "bot3"


class TestCloudformationRepository(unittest.TestCase):
    def test_find_stack_by_bot_id(self):
        stack = find_stack_by_bot_id(bot_id)
        pprint(stack)
        self.assertTrue(stack is not None)


if __name__ == "__main__":
    unittest.main()
