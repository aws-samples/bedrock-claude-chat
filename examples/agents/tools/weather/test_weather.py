import sys

sys.path.append(".")
import unittest

from app.agents.tools.weather import today_weather_tool


class TestWeatherTool(unittest.TestCase):
    def test_get_weather(self):
        location = "Tokyo,JP"
        result = today_weather_tool.run(location)
        print(result)
        self.assertTrue(result.startswith("Today's weather in Seattle is"))
        self.assertTrue("degrees" in result)


if __name__ == "__main__":
    unittest.main()
