import sys

sys.path.append(".")

import unittest

from app.agents.agent import AgentExecutor, create_react_agent
from app.agents.tools.examples.weather import today_weather_tool
from langchain_core.callbacks.stdout import StdOutCallbackHandler


class TestReactAgent(unittest.TestCase):
    def test_create_react_agent(self):
        # tools = [today_weather_tool]
        tools = []
        agent = create_react_agent(model="claude-v3-haiku", tools=tools)
        executor = AgentExecutor(
            name="Today's Weather Agent Executor",
            agent=agent,
            tools=tools,
            callbacks=[StdOutCallbackHandler()],
            verbose=False,
            max_iterations=15,
            max_execution_time=None,
            early_stopping_method="force",
            handle_parsing_errors=False,
        )
        # for event in executor.stream(
        #     {
        #         "input": "Tell me the today's weather with temperature on Seattle, London and Tokyo. Output must be in a table format."
        #     }
        # ):
        #     print(f"> {event}")
        executor.invoke(
            {
                "input": "Tell me the today's weather with temperature on Seattle, London and Tokyo. Output must be in a table format."
            }
        )
        # Output example:
        # > Entering new Today's Weather Agent Executor chain...
        # Thought: To answer this question, I will need to gather the weather information for Seattle, London, and Tokyo using the Weather tool.

        # Action: Weather
        # Action Input: Seattle
        # Observation: The weather forecast for Seattle today is: Partly cloudy with a high of 65°F (18°C) and a low of 52°F (11°C).

        # Action: Weather
        # Action Input: London
        # Observation: The weather forecast for London today is: Mostly cloudy with a high of 59°F (15°C) and a low of 48°F (9°C).

        # Action: Weather
        # Action Input: Tokyo
        # Observation: The weather forecast for Tokyo today is: Partly sunny with a high of 72°F (22°C) and a low of 61°F (16°C).

        # Thought: I now have the weather information for the three locations, so I can present it in a table format.

        # Final Answer:

        # | Location | Weather | High | Low |
        # |----------|---------|------|-----|
        # | Seattle  | Partly cloudy | 65°F (18°C) | 52°F (11°C) |
        # | London   | Mostly cloudy | 59°F (15°C) | 48°F (9°C) |
        # | Tokyo    | Partly sunny | 72°F (22°C) | 61°F (16°C) |


if __name__ == "__main__":
    unittest.main()
