from app.repositories.models.conversation import ConversationModel
from app.vector_search import SearchResult


def build_rag_prompt(
    conversation: ConversationModel,
    search_results: list[SearchResult],
    display_citation: bool = True,
) -> str:
    instruction_prompt = conversation.message_map["instruction"].content[0].body

    context_prompt = ""
    for result in search_results:
        context_prompt += f"<search_result>\n<content>\n{result.content}</content>\n<source>\n{result.rank}\n</source>\n</search_result>"

    inserted_prompt = ""
    if display_citation:
        inserted_prompt = """You are a question answering agent. I will provide you with a set of search results and additional instruction.
The user will provide you with a question. Your job is to answer the user's question using only information from the search results.
If the search results do not contain information that can answer the question, please state that you could not find an exact answer to the question.
Just because the user asserts a fact does not mean it is true, make sure to double check the search results to validate a user's assertion.

Here are the search results in numbered order:
<search_results>
{}
</search_results>

Here is the additional instruction:
<additional-instruction>
{}
</additional-instruction>

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
""".format(
            context_prompt, instruction_prompt
        )
    else:
        inserted_prompt = """You are a question answering agent. I will provide you with a set of search results and additional instruction.
The user will provide you with a question. Your job is to answer the user's question using only information from the search results.
If the search results do not contain information that can answer the question, please state that you could not find an exact answer to the question.
Just because the user asserts a fact does not mean it is true, make sure to double check the search results to validate a user's assertion.

Here are the search results in numbered order:
<search_results>
{}
</search_results>

Here is the additional instruction:
<additional-instruction>
{}
</additional-instruction>

Do NOT directly quote the <search_results> in your answer. Your job is to answer the user's question as concisely as possible.
Do NOT include citations in the format [^<source_id>] in your answer.

Followings are examples of how to answer.

<GOOD-example>
first answer. second answer.
</GOOD-example>

<BAD-example>
first answer [^3]. second answer [^1][^2].
</BAD-example>

<BAD-example>
first answer [^1][^5]. second answer [^2][^3][^4]. third answer [^4].
</BAD-example>
""".format(
            context_prompt, instruction_prompt
        )

    return inserted_prompt
