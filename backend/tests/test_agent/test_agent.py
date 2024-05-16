import sys

sys.path.append(".")

import unittest

from app.agents.agent import AgentExecutor, create_react_agent
from app.agents.tools.examples.weather import today_weather_tool


class TestReactAgent(unittest.TestCase):
    def test_create_react_agent(self):
        agent = create_react_agent(model="claude-v3-haiku", tools=[today_weather_tool])
        executor = AgentExecutor(
            name="Today's Weather Agent Executor",
            agent=agent,
            tools=[today_weather_tool],
            callbacks=[],
            verbose=True,
            max_iterations=15,
            max_execution_time=None,
            early_stopping_method="force",
            handle_parsing_errors=False,
        )
        executor.invoke({"input": "Tell me the today's weather on Seattle, and Tokyo."})


if __name__ == "__main__":
    unittest.main()
