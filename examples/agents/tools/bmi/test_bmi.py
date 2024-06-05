import sys

sys.path.append(".")
import unittest

from app.agents.tools.bmi import bmi_tool


class TestBmiTool(unittest.TestCase):
    def test_bmi(self):
        result = today_weather_tool.run(tool_input={"height": 170, "weight": 70})
        print(result)
        self.assertEqual(type(result), str)


if __name__ == "__main__":
    unittest.main()
