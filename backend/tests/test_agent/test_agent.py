import sys

sys.path.append(".")

import unittest
from pprint import pprint

from app.agents.agent import AgentExecutor, create_react_agent
from app.agents.handlers.apigw_websocket import ApigwWebsocketCallbackHandler
from app.agents.handlers.token_count import get_token_count_callback
from app.agents.langchain import BedrockLLM
from app.agents.tools.knowledge import AnswerWithKnowledgeTool
from app.agents.tools.rdb_sql.tool import get_sql_tools
from app.agents.tools.weather import today_weather_tool
from app.config import DEFAULT_EMBEDDING_CONFIG
from app.repositories.models.custom_bot import (
    AgentModel,
    BotModel,
    EmbeddingParamsModel,
    GenerationParamsModel,
    KnowledgeModel,
    SearchParamsModel,
)


class TestReactAgent(unittest.TestCase):
    MODEL = "claude-v3-sonnet"

    def test_create_react_agent(self):
        llm = BedrockLLM.from_model(model=self.MODEL)
        bot = BotModel(
            id="dummy",
            title="Japanese Dishes",
            description="Japanese Delicious Dishes",
            instruction="",
            create_time=1627984879.9,
            last_used_time=1627984879.9,
            # Pinned
            is_pinned=True,
            public_bot_id=None,
            owner_user_id="dummy",
            embedding_params=EmbeddingParamsModel(
                chunk_size=DEFAULT_EMBEDDING_CONFIG["chunk_size"],
                chunk_overlap=DEFAULT_EMBEDDING_CONFIG["chunk_overlap"],
                enable_partition_pdf=False,
            ),
            generation_params=GenerationParamsModel(
                max_tokens=2000,
                top_k=250,
                top_p=0.999,
                temperature=0.6,
                stop_sequences=["Human: ", "Assistant: "],
            ),
            search_params=SearchParamsModel(
                max_results=20,
            ),
            agent=AgentModel(tools=[]),
            knowledge=KnowledgeModel(
                source_urls=[""],
                sitemap_urls=[""],
                filenames=[
                    "Ramen.pdf",
                    "Sushi.pdf",
                    "Yakiniku.pdf",
                ],
            ),
            sync_status="RUNNING",
            sync_status_reason="reason",
            sync_last_exec_id="",
            published_api_stack_name=None,
            published_api_datetime=None,
            published_api_codebuild_id=None,
        )
        answer_with_knowledge_tool = AnswerWithKnowledgeTool.from_bot(
            bot=bot,
            llm=llm,
        )
        tools = []
        tools.append(today_weather_tool)  # Weather Tool
        tools.append(answer_with_knowledge_tool)

        agent = create_react_agent(model=self.MODEL, tools=tools)
        executor = AgentExecutor(
            name="Agent Executor",
            agent=agent,
            tools=tools,
            callbacks=[],
            verbose=False,
            max_iterations=15,
            max_execution_time=None,
            early_stopping_method="force",
            handle_parsing_errors=True,
        )

        with get_token_count_callback() as cb:
            res = executor.invoke(
                {
                    # "input": "Tell me the today's weather with temperature on Seattle and Tokyo. Output must be in a table format."
                    # "input": "東京とシアトルの今日の天気と気温を教えてください。出力は表形式である必要があります。"
                    "input": "ラーメンとはなんですか？"
                },
                config={
                    "callbacks": [
                        ApigwWebsocketCallbackHandler(
                            gatewayapi="dummy", connection_id="dummy", debug=True
                        ),
                        cb,
                    ],
                },
            )
            print(f"Total Input Token Count: {cb.total_input_token_count}")
            print(f"Total Output Token Count: {cb.total_output_token_count}")
            print(f"Total Cost (USD): ${cb.total_cost}")


if __name__ == "__main__":
    unittest.main()
