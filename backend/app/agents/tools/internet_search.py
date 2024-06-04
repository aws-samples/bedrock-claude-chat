import json

from app.agents.tools.base import BaseTool, StructuredTool
from duckduckgo_search import DDGS
from langchain_core.pydantic_v1 import BaseModel, Field, root_validator


class InternetSearchInput(BaseModel):
    query: str = Field(description="The query to search for on the internet.")
    country: str = Field(
        description="The country code you wish for search. Must be one of: jp-jp (Japan), kr-kr (Korea), cn-zh (China), fr-fr (France), de-de (Germany), es-es (Spain), it-it (Italy), us-en (United States)"
    )
    time_limit: str = Field(
        description="The time limit for the search. Options are 'd' (day), 'w' (week), 'm' (month), 'y' (year)."
    )

    @root_validator
    def validate_country(cls, values):
        country = values.get("country")
        if country not in [
            "jp-jp",
            "kr-kr",
            "cn-zh",
            "fr-fr",
            "de-de",
            "es-es",
            "it-it",
            "us-en",
        ]:
            raise ValueError(
                f"Country must be one of: jp-jp (Japan), kr-kr (Korea), cn-zh (China), fr-fr (France), de-de (Germany), es-es (Spain), it-it (Italy), us-en (United States)"
            )
        return values


def internet_search(query: str, time_limit: str, country: str) -> str:
    REGION = country
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
