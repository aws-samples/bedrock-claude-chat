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

        cli_dict = client.__dict__

        reg = cli_dict["_client_config"].region_name

        LOGGER.debug("Region: ")
        LOGGER.debug(reg)

        assert reg == "us-east-1"

    def test_get_bedrock_client_alt(self):
        from app.utils import get_bedrock_client

        client = get_bedrock_client("us-west-2")
        assert client is not None

        cli_dict = client.__dict__

        reg = cli_dict["_client_config"].region_name

        LOGGER.debug("Region: ")
        LOGGER.debug(reg)

        assert reg == "us-west-2"


if __name__ == "__main__":
    unittest.main()
