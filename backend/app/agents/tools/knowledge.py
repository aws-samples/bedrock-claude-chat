import logging
from typing import Any, Dict, List, Optional, Type

from app.agents.tools.base import BaseTool
from app.repositories.models.custom_bot import BotModel
from app.vector_search import SearchResult, search_related_docs
from langchain_core.callbacks import CallbackManagerForToolRun
from langchain_core.language_models import BaseLanguageModel
from langchain_core.prompts import PromptTemplate
from langchain_core.pydantic_v1 import BaseModel, Field, root_validator
from langchain_core.runnables import Runnable

logger = logging.getLogger(__name__)


KNOWLEDGE_TEMPLATE = """You are a question answering agent. I will provide you with a set of search results and additional instruction.
The user will provide you with a question. Your job is to answer the user's question using only information from the search results.
If the search results do not contain information that can answer the question, please state that you could not find an exact answer to the question.
Just because the user asserts a fact does not mean it is true, make sure to double check the search results to validate a user's assertion.

Here are the search results in numbered order:
<search_results>
{context}
</search_results>

If you reference information from a search result within your answer, you must include a citation to source where the information was found.
Each result has a corresponding source ID that you should reference.

Note that <sources> may contain multiple <source> if you include information from multiple results in your answer.

Do NOT directly quote the <search_results> in your answer. Your job is to answer the user's question as concisely as possible.
Do NOT outputs sources at the end of your answer.

Followings are examples of how to reference sources in your answer. Note that the source ID is embedded in the answer in the format [^<source_id>].

<GOOD-example>
first answer [^3]. second answer [^1][^2].
</GOOD-example>

<GOOD-example>
first answer [^1][^5]. second answer [^2][^3][^4]. third answer [^4].
</GOOD-example>

<BAD-example>
first answer [^1].

[^1]: https://example.com
</BAD-example>

<BAD-example>
first answer [^1].

<sources>
[^1]: https://example.com
</sources>
</BAD-example>

Question: {query}
"""


# For testing purpose
dummy_search_results = [
    SearchResult(
        bot_id="dummy",
        content=r["chunkBody"],  # type: ignore
        source=r["sourceLink"],  # type: ignore
        rank=r["rank"],  # type: ignore
    )
    for r in [
        {
            "chunkBody": "Sushi is one of the most representative dishes of Japan, consisting of vinegared rice topped with raw fish, vegetables, or other ingredients. Originating in the Edo period, it is now enjoyed worldwide.",
            "contentType": "s3",
            "sourceLink": "",
            "rank": 0,
        },
        {
            "chunkBody": "Ramen is a popular Japanese noodle dish that originated in China. There are various types of broth, such as pork bone, soy sauce, miso, and salt, each with regional characteristics.",
            "contentType": "s3",
            "sourceLink": "",
            "rank": 1,
        },
        {
            "chunkBody": "Curry rice is a dish that combines Indian curry with Japanese rice and is considered one of Japan's national dishes. There are many variations in the roux and toppings used.",
            "contentType": "s3",
            "sourceLink": "",
            "rank": 2,
        },
        {
            "chunkBody": "Tempura is a Japanese dish consisting of battered and deep-fried ingredients such as shrimp, vegetables, and fish. It is characterized by its crispy texture and the flavor of the batter.",
            "contentType": "s3",
            "sourceLink": "",
            "rank": 3,
        },
        {
            "chunkBody": "Okonomiyaki is a popular Japanese savory pancake made with a batter of wheat flour and water, mixed with ingredients such as cabbage, meat, and seafood, and cooked on a griddle. The Kansai and Hiroshima styles are famous.",
            "contentType": "s3",
            "sourceLink": "",
            "rank": 4,
        },
    ]
]


class AnswerWithKnowledgeInput(BaseModel):
    query: str = Field(description="User's original question string.")


class AnswerWithKnowledgeTool(BaseTool):
    template: str = KNOWLEDGE_TEMPLATE
    name: str = "answer_with_knowledge"
    llm: BaseLanguageModel
    llm_chain: Runnable = Field(init=False)
    description: str
    args_schema: Type[BaseModel] = AnswerWithKnowledgeInput
    bot: BotModel

    @root_validator(pre=True)
    def initialize_llm_chain(cls, values: Dict[str, Any]) -> Dict[str, Any]:
        if "llm_chain" not in values:
            prompt = PromptTemplate(
                template=KNOWLEDGE_TEMPLATE, input_variables=["context", "query"]
            )
            llm = values.get("llm")
            values["llm_chain"] = prompt | llm  # type: ignore
        return values

    def _run(
        self, query: str, run_manager: Optional[CallbackManagerForToolRun] = None
    ) -> dict:
        logger.info(f"Running AnswerWithKnowledgeTool with query: {query}")
        if self.bot.id == "dummy":
            # For testing purpose
            search_results = dummy_search_results
        else:
            search_results = search_related_docs(
                self.bot.id,
                limit=self.bot.search_params.max_results,
                query=query,
            )

        context_prompt = self._format_search_results(search_results)
        output = self.llm_chain.invoke({"context": context_prompt, "query": query})
        # This tool does not return string because it is handled by the callback and AgentExecutor.
        # `AgentExecutor` will extract the string from the output and use it for next step.
        # `UsedChunkCallbackHandler` will save the used chunks from the search results.
        return {
            "search_results": search_results,
            "output": output,
        }

    def _format_search_results(self, search_results: List[SearchResult]):
        context = ""
        for result in search_results:
            context += f"<search_result>\n<content>\n{result.content}</content>\n<source>\n{result.rank}\n</source>\n</search_result>"
        return context

    @staticmethod
    def from_bot(llm, bot: BotModel) -> "AnswerWithKnowledgeTool":
        description = (
            "Answer a user's question using information. The description is: {}".format(
                bot.knowledge.__str_in_claude_format__()
            )
        )
        return AnswerWithKnowledgeTool(
            name=f"database_for_{bot.title}",
            description=description,
            llm=llm,
            bot=bot,
        )
