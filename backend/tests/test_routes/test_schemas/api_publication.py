import sys

sys.path.append(".")
import unittest

from app.routes.schemas.api_publication import (
    BotPublishInput,
    PublishedApiQuota,
    PublishedApiThrottle,
)


class TestBotPublishInput(unittest.TestCase):
    def test_create_input(self):
        obj = BotPublishInput(
            stage="dev",
            quota=PublishedApiQuota(limit=100, offset=0, period="DAY"),
            throttle=PublishedApiThrottle(rate_limit=100.0, burst_limit=100),
            allowed_origins=["http://example.com", "https://example.com", "*"],
        )
        self.assertEqual(
            obj.allowed_origins, ["http://example.com", "https://example.com", "*"]
        )

    def test_create_quota_null(self):
        obj = BotPublishInput(
            stage="dev",
            quota=PublishedApiQuota(limit=None, offset=None, period=None),
            throttle=PublishedApiThrottle(rate_limit=100.0, burst_limit=100),
            allowed_origins=["http://example.com", "https://example.com", "*"],
        )
        self.assertEqual(obj.quota.limit, None)
        self.assertEqual(obj.quota.offset, None)
        self.assertEqual(obj.quota.period, None)

    def test_create_throttle_null(self):
        obj = BotPublishInput(
            stage="dev",
            quota=PublishedApiQuota(limit=100, offset=0, period="DAY"),
            throttle=PublishedApiThrottle(rate_limit=None, burst_limit=None),
            allowed_origins=["http://example.com", "https://example.com", "*"],
        )
        self.assertEqual(obj.throttle.rate_limit, None)
        self.assertEqual(obj.throttle.burst_limit, None)

    def test_create_input_invalid_origin(self):
        with self.assertRaises(ValueError):
            BotPublishInput(
                stage="dev",
                quota=PublishedApiQuota(limit=100, offset=0, period="DAY"),
                throttle=PublishedApiThrottle(rate_limit=100.0, burst_limit=100),
                allowed_origins=["example.com"],
            )


if __name__ == "__main__":
    unittest.main()
