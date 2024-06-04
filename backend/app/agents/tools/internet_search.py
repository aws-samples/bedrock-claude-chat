import json

from app.agents.tools.base import BaseTool, StructuredTool
from duckduckgo_search import DDGS
from langchain_core.pydantic_v1 import BaseModel, Field


class InternetSearchInput(BaseModel):
    query: str = Field(description="The query to search for on the internet.")
    time_limit: str = Field(
        description="The time limit for the search. Options are 'd' (day), 'w' (week), 'm' (month), 'y' (year)."
    )


def internet_search(query: str, time_limit: str) -> str:
    REGION = "wt-wt"
    SAFE_SEARCH = "moderate"
    MAX_RESULTS = 20
    BACKEND = "api"
    res = []
    with DDGS() as ddgs:
        res = ddgs.text(
            query,
            region=REGION,
            safesearch=SAFE_SEARCH,
            timelimit=time_limit,
            max_results=MAX_RESULTS,
            backend=BACKEND,
        )
    return json.dumps(res)


internet_search_tool = StructuredTool(
    func=internet_search,
    name="internet_search",
    description="Search the internet for information.",
    args_schema=InternetSearchInput,
)
