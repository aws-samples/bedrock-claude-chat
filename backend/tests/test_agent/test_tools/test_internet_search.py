import sys

sys.path.append(".")
import unittest

from app.agents.tools.internet_search import internet_search_tool


class TestInternetSearchTool(unittest.TestCase):
    def test_internet_search(self):
        # query = "Amazon Stock Price Today"
        query = "東京 焼肉"
        time_limit = "d"
        country = "jp-jp"
        response = internet_search_tool.run(
            tool_input={"query": query, "time_limit": time_limit, "country": country}
        )
        self.assertIsInstance(response, str)
        print(response)


if __name__ == "__main__":
    unittest.main()
