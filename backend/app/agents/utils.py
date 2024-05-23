from app.agents.tools.base import BaseTool
from app.agents.tools.rdb_sql.tool import get_tools as get_rdb_sql_tools
from app.agents.tools.weather import today_weather_tool
from app.bedrock import BedrockLLM


def get_available_tools() -> list[BaseTool]:
    tools = []
    tools.append(today_weather_tool)

    llm = BedrockLLM.from_model(model="claude-v3-haiku")
    tools.extend(get_rdb_sql_tools(llm=llm))

    return tools
