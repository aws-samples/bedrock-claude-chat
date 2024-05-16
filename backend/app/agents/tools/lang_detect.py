from typing import Any, Dict, Optional, Type

from langchain_core.callbacks import (
    AsyncCallbackManagerForToolRun,
    CallbackManagerForToolRun,
)
from langchain_core.language_models import BaseLanguageModel
from langchain_core.prompts import PromptTemplate
from langchain_core.pydantic_v1 import BaseModel, Field, root_validator
from langchain_core.runnables import Runnable
from langchain_core.tools import BaseTool
from langdetect import detect


class _CheckInputLanguageToolInput(BaseModel):
    tool_input: str = Field(..., description="The input to check if it's in English.")


class CheckInputLanguageTool(BaseTool):
    name: str = "check_input_for_get_weather"
    description: str = (
        "Check if the location input is in English. If not, return an error message."
    )
    args_schema: Type[BaseModel] = _CheckInputLanguageToolInput

    def _run(
        self,
        tool_input: str,
        run_manager: Optional[CallbackManagerForToolRun] = None,
    ) -> str:
        try:
            lang = detect(tool_input)
            if lang != "en":
                return f"The input '{tool_input}' is not in English. Please translate the location input in English before using weather tool."
            else:
                return "The input is in English."
        except:
            return "Error: Unable to detect the language of the input."


class _TranslateToEnglishToolInput(BaseModel):
    tool_input: str = Field(..., description="The input to translate to English.")


TRANSLATE_TEMPLATE = (
    """You are a translator. Translate the input to English. The input is: {input}"""
)


class TranslateToEnglishTool(BaseTool):
    template: str = TRANSLATE_TEMPLATE
    llm: BaseLanguageModel
    llm_chain: Runnable = Field(init=False)
    name: str = "translate_to_english"
    description: str = "Translate the input to English."
    args_schema: Type[BaseModel] = _TranslateToEnglishToolInput

    @root_validator(pre=True)
    def initialize_llm_chain(cls, values: Dict[str, Any]) -> Dict[str, Any]:
        if "llm_chain" not in values:
            prompt = PromptTemplate(
                template=TRANSLATE_TEMPLATE, input_variables=["input"]
            )
            llm = values.get("llm")
            values["llm_chain"] = prompt | llm  # type: ignore
        return values

    def _run(
        self,
        tool_input: str,
        run_manager: Optional[CallbackManagerForToolRun] = None,
    ) -> str:
        return self.llm_chain.invoke({"input": tool_input})
