import sys

sys.path.append(".")
import unittest

from app.usecases.bot import issue_presigned_url


class TestIssuePresignedUrl(unittest.TestCase):
    def test_issue_presigned_url(self):
        url = issue_presigned_url("test_user", "test_bot", "test_file")
        self.assertEqual(type(url), str)
        self.assertTrue(url.startswith("https://"))


if __name__ == "__main__":
    unittest.main()
