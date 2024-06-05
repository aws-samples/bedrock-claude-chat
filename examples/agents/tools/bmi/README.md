# BMI calculation tool

## Overview

The BMI (Body Mass Index) calculation tool is a custom tool designed to compute the BMI of an individual based on their height and weight. This tool helps users quickly determine their BMI and understand which weight category they fall into, such as underweight, normal weight, overweight, or obese.

## How to enable this tool

- Move `bmi.py` under `backend/app/agents/tools` directory.
- Open `backend/app/agents/utils.py` and modify like:

```py
from app.agents.langchain import BedrockLLM
from app.agents.tools.base import BaseTool
from app.agents.tools.internet_search import internet_search_tool
+ from app.agents.tools.bmi import bmi_tool


def get_available_tools() -> list[BaseTool]:
    tools: list[BaseTool] = []
    tools.append(internet_search_tool)
+   tools.append(bmi_tool)

    return tools
```

- Run cdk deploy.
