import sys

sys.path.append(".")
import unittest

from app.routes.schemas.conversation import FeedbackInput
from pydantic import ValidationError


class TestFeedbackInput(unittest.TestCase):
    def test_create_input_valid_no_category(self):
        obj = FeedbackInput(thumbs_up=True, category=None, comment="Excellent!")
        self.assertTrue(obj.thumbs_up)
        self.assertIsNone(obj.category)
        self.assertEqual(obj.comment, "Excellent!")

    def test_create_input_invalid_no_category(self):
        with self.assertRaises(ValidationError):
            FeedbackInput(thumbs_up=False, category=None, comment="Needs improvement.")

    def test_create_input_valid_no_comment(self):
        obj = FeedbackInput(thumbs_up=False, category="DISLIKE", comment=None)
        self.assertFalse(obj.thumbs_up)
        self.assertEqual(obj.category, "DISLIKE")
        self.assertIsNone(obj.comment)


if __name__ == "__main__":
    unittest.main()
