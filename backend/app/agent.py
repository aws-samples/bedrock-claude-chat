from langchain.tools import DuckDuckGoSearchRun
from langchain.document_loaders import WebBaseLoader
from langchain.tools import WikipediaQueryRun
from langchain_community.utilities import WikipediaAPIWrapper
from langchain.agents import AgentExecutor, create_react_agent
from langchainhub import hub
from langchain.agents import Tool


def get_agent(llm_client):
    prompt = hub.pull("hwchase17/react") 
    wikipedia = WikipediaQueryRun(api_wrapper=WikipediaAPIWrapper())
    def web_page_reader(url: str) -> str:
        loader = WebBaseLoader(url)
        content = loader.load()[0].page_content
        return content
    search = DuckDuckGoSearchRun()
    tools = [
        Tool(
            name="duckduckgo-search",
            func=search.run,
            description="This tool searches for the latest information on the web. It receives search keywords as arguments. If you don’t need the latest information, this tool won’t be used.",
        ),
        Tool(
            name = "WebBaseLoader",
            func=web_page_reader,
            description="This tool returns the content in text format when given a URL as an argument. It only accepts URL strings as input."
        ),
        Tool(
            name = "Wiki",
            func=wikipedia,
            description="This tool searches Wikipedia for content when given a string as an argument. It only accepts string input." 
        )
    ]

    agent = create_react_agent(llm_client, tools, prompt)
    # verbose True => Output LLM agent’s self-inference.
    agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True, handle_parsing_errors=True)

    return agent_executor