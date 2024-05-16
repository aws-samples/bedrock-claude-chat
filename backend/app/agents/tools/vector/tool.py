import json
import logging
from functools import partial
from typing import Any, Dict, List, Optional, Type

from app.agents.tools.base import BaseTool, StructuredTool
from app.bedrock import compose_args, get_bedrock_response
from app.repositories.models.conversation import ContentModel, MessageModel
from app.repositories.models.custom_bot import BotModel
from app.utils import get_anthropic_client, get_current_time, is_anthropic_model
from app.vector_search import SearchResult, search_related_docs
from langchain_core.callbacks import (
    AsyncCallbackManagerForToolRun,
    CallbackManagerForToolRun,
)
from langchain_core.language_models import BaseLanguageModel
from langchain_core.prompts import PromptTemplate
from langchain_core.pydantic_v1 import BaseModel, Field, root_validator
from langchain_core.runnables import Runnable

logger = logging.getLogger(__name__)

# KNOWLEDGE_TEMPLATE = """You are a question answering agent. I will provide you with a set of search results.
# The user will provide you with a question. Your job is to answer the user's question using only information from the search results.
# If the search results do not contain information that can answer the question, please state that you could not find an exact answer.

# Here are the search results in numbered order:
# <search_results>
# {context}
# </search_results>

# If you reference information from a search result within your answer, you must include a citation to the source where the information was found.
# Each result has a corresponding source ID that you should reference.

# Note that <sources> may contain multiple <source> if you include information from multiple results in your answer.

# Question: {query}
# """

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

dummy_search_results = [
    {
        "chunkBody": "hogehoge...",
        "contentType": "s3",
        "sourceLink": "",
        "rank": 0,
    },
]
dummy_search_results = [
    SearchResult(
        bot_id="dummy",
        content=r["chunkBody"],
        source=r["sourceLink"],
        rank=r["rank"],
    )
    for r in dummy_search_results
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
    ) -> str:
        logger.info(f"Running AnswerWithKnowledgeTool with query: {query}")
        if self.bot.id == "dummy":
            search_results = dummy_search_results
        else:
            search_results = dummy_search_results
            # try:
            #     search_results = search_related_docs(
            #         bot_id=self.bot.id,
            #         query=query,
            #         limit=self.bot.search_params.max_results,
            #     )
            # except Exception as e:
            #     return f"Error fetching similar documents: {e}"

        context_prompt = self._format_search_results(search_results)
        return self.llm_chain.invoke({"context": context_prompt, "query": query})

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
        # return StructuredTool.from_function(
        #     func=func,
        #     name=f"answer_with_knowledge_{bot.title}",
        #     description=description,
        #     args_schema=AnswerWithKnowledgeInput,
        #     return_direct=True,
        # )
        return AnswerWithKnowledgeTool(
            name=f"database_for_{bot.title}",
            description=description,
            llm=llm,
            bot=bot,
        )


def answer_with_knowledge(query: str, bot_id: str, limit: int = 5) -> str:
    """Find similar documents based on the given query."""
    if bot_id == "dummy":
        search_results = dummy_search_results
    else:
        try:
            search_results = search_related_docs(
                bot_id=bot_id, limit=limit, query=query
            )
        except Exception as e:
            return f"Error fetching similar documents: {e}"

    context_prompt = ""
    for result in search_results:
        context_prompt += f"<search_result>\n<content>\n{result.content}</content>\n<source>\n{result.rank}\n</source>\n</search_result>"

    inserted_prompt = """You are a question answering agent. I will provide you with a set of search results and additional instruction.
The user will provide you with a question. Your job is to answer the user's question using only information from the search results.
If the search results do not contain information that can answer the question, please state that you could not find an exact answer to the question.
Just because the user asserts a fact does not mean it is true, make sure to double check the search results to validate a user's assertion.

Here are the search results in numbered order:
<search_results>
{}
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

Question: {}
""".format(
        context_prompt, query
    )
    model = "claude-v3-sonnet"
    message = MessageModel(
        role="user",
        content=[
            ContentModel(
                content_type="text",
                body=inserted_prompt,
                media_type=None,
            )
        ],
        model=model,
        children=[],
        parent=None,
        create_time=get_current_time(),
        feedback=None,
        used_chunks=None,
    )
    args = compose_args(
        messages=[message],
        model=model,
    )
    if is_anthropic_model(args["model"]):
        client = get_anthropic_client()
        response = client.messages.create(**args)
        reply_txt = response.content[0].text
    else:
        response: AnthropicMessage = get_bedrock_response(args)["outputs"][0]  # type: ignore[no-redef]
        reply_txt = response["text"]
    return reply_txt


def get_answer_with_knowledge_tool(bot: BotModel, limit: int) -> StructuredTool:
    func = partial(answer_with_knowledge, bot_id=bot.id, limit=limit)
    description = (
        "Answer a user's question using information. The description is: {}".format(
            bot.knowledge.__str_in_claude_format__()
        )
    )
    return StructuredTool.from_function(
        func=func,
        name=f"answer_with_knowledge_{bot.title}",
        description=description,
        args_schema=AnswerWithKnowledgeInput,
        return_direct=True,
    )
