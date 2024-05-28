import textwrap
from inspect import signature
from typing import Any, Awaitable, Callable, Dict, List, Optional, Tuple, Type, Union

from langchain_core.callbacks import (
    AsyncCallbackManagerForToolRun,
    CallbackManagerForToolRun,
)
from langchain_core.pydantic_v1 import BaseModel, Field
from langchain_core.runnables import RunnableConfig
from langchain_core.runnables.config import run_in_executor
from langchain_core.tools import BaseTool as LangChainBaseTool
from langchain_core.tools import create_schema_from_function


class BaseTool(LangChainBaseTool):
    def extract_params_and_descriptions(self) -> List[Dict[str, Any]]:
        args_schema = self.args_schema
        if args_schema is None:
            return []

        params_and_descriptions = []
        for name, field in args_schema.__fields__.items():
            params_and_descriptions.append(
                {
                    "name": name,
                    "description": field.field_info.description,
                    "type": field.type_,
                    "is_required": field.required,
                }
            )
        return params_and_descriptions


class StructuredTool(BaseTool):
    """Tool that can operate on any number of inputs."""

    description: str = ""
    args_schema: Type[BaseModel] = Field(..., description="The tool schema.")
    """The input arguments' schema."""
    func: Optional[Callable[..., Any]]
    """The function to run when the tool is called."""
    coroutine: Optional[Callable[..., Awaitable[Any]]] = None
    """The asynchronous version of the function."""

    # --- Runnable ---

    async def ainvoke(
        self,
        input: Union[str, Dict],
        config: Optional[RunnableConfig] = None,
        **kwargs: Any,
    ) -> Any:
        if not self.coroutine:
            # If the tool does not implement async, fall back to default implementation
            return await run_in_executor(config, self.invoke, input, config, **kwargs)

        return await super().ainvoke(input, config, **kwargs)

    # --- Tool ---

    @property
    def args(self) -> dict:
        """The tool's input arguments."""
        return self.args_schema.schema()["properties"]

    def _run(
        self,
        *args: Any,
        run_manager: Optional[CallbackManagerForToolRun] = None,
        **kwargs: Any,
    ) -> Any:
        """Use the tool."""
        if self.func:
            new_argument_supported = signature(self.func).parameters.get("callbacks")
            return (
                self.func(
                    *args,
                    callbacks=run_manager.get_child() if run_manager else None,
                    **kwargs,
                )
                if new_argument_supported
                else self.func(*args, **kwargs)
            )
        raise NotImplementedError("Tool does not support sync")

    async def _arun(
        self,
        *args: Any,
        run_manager: Optional[AsyncCallbackManagerForToolRun] = None,
        **kwargs: Any,
    ) -> str:
        """Use the tool asynchronously."""
        if self.coroutine:
            new_argument_supported = signature(self.coroutine).parameters.get(
                "callbacks"
            )
            return (
                await self.coroutine(
                    *args,
                    callbacks=run_manager.get_child() if run_manager else None,
                    **kwargs,
                )
                if new_argument_supported
                else await self.coroutine(*args, **kwargs)
            )
        return await run_in_executor(
            None,
            self._run,
            run_manager=run_manager.get_sync() if run_manager else None,
            *args,
            **kwargs,
        )

    @classmethod
    def from_function(
        cls,
        func: Optional[Callable] = None,
        coroutine: Optional[Callable[..., Awaitable[Any]]] = None,
        name: Optional[str] = None,
        description: Optional[str] = None,
        return_direct: bool = False,
        args_schema: Optional[Type[BaseModel]] = None,
        infer_schema: bool = True,
        **kwargs: Any,
    ) -> "StructuredTool":
        """Create tool from a given function.

        A classmethod that helps to create a tool from a function.

        Args:
            func: The function from which to create a tool
            coroutine: The async function from which to create a tool
            name: The name of the tool. Defaults to the function name
            description: The description of the tool. Defaults to the function docstring
            return_direct: Whether to return the result directly or as a callback
            args_schema: The schema of the tool's input arguments
            infer_schema: Whether to infer the schema from the function's signature
            **kwargs: Additional arguments to pass to the tool

        Returns:
            The tool

        Examples:

            .. code-block:: python

                def add(a: int, b: int) -> int:
                    \"\"\"Add two numbers\"\"\"
                    return a + b
                tool = StructuredTool.from_function(add)
                tool.run(1, 2) # 3
        """

        if func is not None:
            source_function = func
        elif coroutine is not None:
            source_function = coroutine
        else:
            raise ValueError("Function and/or coroutine must be provided")
        name = name or source_function.__name__
        description_ = description or source_function.__doc__
        if description_ is None:
            raise ValueError(
                "Function must have a docstring if description not provided."
            )
        if description is None:
            # Only apply if using the function's docstring
            description_ = textwrap.dedent(description_).strip()

        # Description example:
        # search_api(query: str) - Searches the API for the query.
        sig = signature(source_function)
        description_ = f"{name}{sig} - {description_.strip()}"
        _args_schema = args_schema
        if _args_schema is None and infer_schema:
            # schema name is appended within function
            _args_schema = create_schema_from_function(name, source_function)
        return cls(
            name=name,
            func=func,
            coroutine=coroutine,
            args_schema=_args_schema,  # type: ignore[arg-type]
            description=description_,
            return_direct=return_direct,
            **kwargs,
        )
