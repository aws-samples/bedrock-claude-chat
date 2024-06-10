import re
from typing import Union

from langchain_core.agents import AgentAction, AgentFinish
from langchain_core.exceptions import OutputParserException
from langchain_core.output_parsers import BaseOutputParser

FINAL_ANSWER_TAG = "final-answer"
MISSING_THOUGHT_TAG_ERROR_MESSAGE = "Invalid Format: Missing '<thought></thought>' tag"
MISSING_ACTION_TAG_ERROR_MESSAGE = (
    "Invalid Format: Missing '<action></action>' tag after '<thought></thought>'"
)
MISSING_ACTION_INPUT_TAG_ERROR_MESSAGE = "Invalid Format: Missing '<action-input></action-input>' tag after '<action></action>'"


class ReActSingleInputOutputParser(BaseOutputParser):
    """Parses ReAct-style LLM calls that have a single tool input."""

    def parse(self, text: str) -> Union[AgentAction, AgentFinish]:
        includes_answer = f"<{FINAL_ANSWER_TAG}>" in text
        thought_match = re.search(r"<thought>(.*?)</thought>", text, re.DOTALL)
        action_match = re.search(r"<action>(.*?)</action>", text, re.DOTALL)
        action_input_match = re.search(
            r"<action-input>(.*?)</action-input>", text, re.DOTALL
        )

        if thought_match and action_match and action_input_match:
            thought = thought_match.group(1).strip()
            action = action_match.group(1).strip()
            action_input = action_input_match.group(1).strip()

            if includes_answer:
                return AgentFinish(
                    {
                        "output": re.search(
                            f"<{FINAL_ANSWER_TAG}>(.*?)</{FINAL_ANSWER_TAG}>",
                            text,
                            re.DOTALL,
                        )
                        .group(1)  # type: ignore
                        .strip()
                    },
                    text,
                )
            else:
                return AgentAction(action, action_input, text)

        elif includes_answer:
            return AgentFinish(
                {
                    "output": re.search(
                        f"<{FINAL_ANSWER_TAG}>(.*?)</{FINAL_ANSWER_TAG}>",
                        text,
                        re.DOTALL,
                    )
                    .group(1)  # type: ignore
                    .strip()
                },
                text,
            )

        if not thought_match:
            raise OutputParserException(
                f"Could not parse LLM output: `{text}`",
                observation=MISSING_THOUGHT_TAG_ERROR_MESSAGE,
                llm_output=text,
                send_to_llm=True,
            )
        elif not action_match:
            raise OutputParserException(
                f"Could not parse LLM output: `{text}`",
                observation=MISSING_ACTION_TAG_ERROR_MESSAGE,
                llm_output=text,
                send_to_llm=True,
            )
        elif not action_input_match:
            raise OutputParserException(
                f"Could not parse LLM output: `{text}`",
                observation=MISSING_ACTION_INPUT_TAG_ERROR_MESSAGE,
                llm_output=text,
                send_to_llm=True,
            )
        else:
            raise OutputParserException(f"Could not parse LLM output: `{text}`")

    @property
    def _type(self) -> str:
        return "react-single-input"
