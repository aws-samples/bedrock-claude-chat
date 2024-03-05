import logging
import sys
import unittest

LOGGER = logging.getLogger(__name__)
LOGGER.setLevel(logging.DEBUG)

sys.path.append(".")


class TestUtils(unittest.TestCase):
    def test_get_bedrock_client_default(self):
        from app.utils import get_bedrock_client

        client = get_bedrock_client()
        assert client is not None

        reg = client.aws_region

        assert reg == "us-east-1"

    def test_get_bedrock_client_alt(self):
        from app.utils import get_bedrock_client

        client = get_bedrock_client("us-west-2")
        assert client is not None

        reg = client.aws_region

        assert reg == "us-west-2"


if __name__ == "__main__":
    unittest.main()
