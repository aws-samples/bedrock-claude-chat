# Weather Forecast Tool

## Overview

The Weather Forecast Tool is a custom tool designed to provide users with the current day's weather forecast for a specified location. Utilizing external APIs for geocoding and weather data retrieval, this tool allows users to easily obtain weather information by simply providing the name of a city or location.

## How to enable this tool

- Move `weather.py` under `backend/app/agents/tools` directory.
- Open `backend/app/agents/utils.py` and modify like:

```py
from app.agents.langchain import BedrockLLM
from app.agents.tools.base import BaseTool
from app.agents.tools.internet_search import internet_search_tool
+ from app.agents.tools.weather import today_weather_tool


def get_available_tools() -> list[BaseTool]:
    tools: list[BaseTool] = []
    tools.append(internet_search_tool)
+   tools.append(today_weather_tool)

    return tools
```

- Run cdk deploy.
