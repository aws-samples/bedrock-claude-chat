from app.agents.langchain import BedrockLLM
from app.agents.tools.base import BaseTool
from app.agents.tools.rdb_sql.tool import get_sql_tools
from app.agents.tools.weather import today_weather_tool


def get_available_tools() -> list[BaseTool]:
    tools: list[BaseTool] = []
    tools.append(today_weather_tool)
    # TODO

    llm = BedrockLLM.from_model(model="claude-v3-haiku")
    sql_tools = get_sql_tools(llm=llm)
    tools.extend(sql_tools)

    return tools


def get_tool_by_name(name: str) -> BaseTool:
    for tool in get_available_tools():
        if tool.name == name:
            return tool
    raise ValueError(f"Tool with name {name} not found")
