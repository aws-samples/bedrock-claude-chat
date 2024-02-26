import sys
import unittest
from pprint import pprint

sys.path.append(".")

from app.repositories.cognito import find_cognito_user_by_user_id


class TestCognitoRepository(unittest.TestCase):
    def test_find_cognito_user_by_user_id(self):
        user_id = "c7345a28-00b1-70f1-632f-dcef9f455949"
        user = find_cognito_user_by_user_id(user_id)
        pprint(user)
        self.assertTrue(user is not None)


if __name__ == "__main__":
    unittest.main()
