import json
import logging
import os
import re
import time
from abc import abstractmethod
from typing import Any, AsyncIterator, Callable, Iterator, Optional, Sequence, Union

from app.agents.agent_iterator import AgentExecutorIterator
from app.agents.chain import Chain
from app.agents.langchain import BedrockLLM
from app.agents.parser import ReActSingleInputOutputParser
from app.agents.prompts import AGENT_PROMPT_FOR_CLAUDE
from app.agents.tools.base import BaseTool
from app.agents.tools.common.exception import ExceptionTool
from app.agents.tools.common.invalid import InvalidTool
from app.agents.tools.knowledge import AnswerWithKnowledgeTool
from app.config import DEFAULT_GENERATION_CONFIG as DEFAULT_CLAUDE_GENERATION_CONFIG
from app.config import DEFAULT_MISTRAL_GENERATION_CONFIG
from app.repositories.models.custom_bot import GenerationParamsModel
from app.routes.schemas.conversation import type_model_name
from langchain_core.agents import AgentAction, AgentFinish, AgentStep
from langchain_core.callbacks import (
    AsyncCallbackManagerForChainRun,
    CallbackManagerForChainRun,
    Callbacks,
)
from langchain_core.exceptions import OutputParserException
from langchain_core.prompts import PromptTemplate
from langchain_core.pydantic_v1 import root_validator
from langchain_core.runnables import (
    Runnable,
    RunnableConfig,
    RunnablePassthrough,
    ensure_config,
)
from langchain_core.runnables.utils import AddableDict
from langchain_core.utils.input import get_color_mapping

logger = logging.getLogger(__name__)

ENABLE_MISTRAL = os.environ.get("ENABLE_MISTRAL", "") == "true"
DEFAULT_GENERATION_CONFIG = (
    DEFAULT_MISTRAL_GENERATION_CONFIG
    if ENABLE_MISTRAL
    else DEFAULT_CLAUDE_GENERATION_CONFIG
)

# The maximum number of steps to take before ending the execution loop.
MAX_ITERATIONS = 15

NextStepOutput = list[Union[AgentFinish, AgentAction, AgentStep]]


def format_log_to_str(
    intermediate_steps: list[tuple[AgentAction, str]],
    observation_prefix: str = "<observation>",
    observation_suffix: str = "</observation>",
    llm_prefix: str = "",
    llm_suffix: str = "",
) -> str:
    """Construct the scratchpad that lets the agent continue its thought process."""
    thoughts = ""
    for action, observation in intermediate_steps:
        thoughts += action.log
        thoughts += (
            f"\n{observation_prefix}{observation}{observation_suffix}\n{llm_prefix}"
        )
    thoughts += llm_suffix

    return thoughts


class BaseSingleActionAgent:
    """Base Single Action Agent class."""

    @property
    def return_values(self) -> list[str]:
        """Return values of the agent."""
        return ["output"]

    @abstractmethod
    def plan(
        self,
        intermediate_steps: list[tuple[AgentAction, str]],
        callbacks: Callbacks = None,
        **kwargs: Any,
    ) -> Union[AgentAction, AgentFinish]:
        """Given input, decided what to do.

        Args:
            intermediate_steps: Steps the LLM has taken to date,
                along with observations
            callbacks: Callbacks to run.
            **kwargs: User inputs.

        Returns:
            Action specifying what tool to use.
        """

    @abstractmethod
    async def aplan(
        self,
        intermediate_steps: list[tuple[AgentAction, str]],
        callbacks: Callbacks = None,
        **kwargs: Any,
    ) -> Union[AgentAction, AgentFinish]:
        """Given input, decided what to do.

        Args:
            intermediate_steps: Steps the LLM has taken to date,
                along with observations
            callbacks: Callbacks to run.
            **kwargs: User inputs.

        Returns:
            Action specifying what tool to use.
        """

    @property
    @abstractmethod
    def input_keys(self) -> list[str]:
        """Return the input keys.

        :meta private:
        """

    def return_stopped_response(
        self,
        early_stopping_method: str,
        intermediate_steps: list[tuple[AgentAction, str]],
        **kwargs: Any,
    ) -> AgentFinish:
        """Return response when agent has been stopped due to max iterations."""
        if early_stopping_method == "force":
            # `force` just returns a constant string
            return AgentFinish(
                {"output": "Agent stopped due to iteration limit or time limit."},
                "",
            )
        else:
            raise ValueError(
                f"Got unsupported early_stopping_method `{early_stopping_method}`"
            )

    def tool_run_logging_kwargs(self) -> dict:
        return {}


class RunnableAgent(BaseSingleActionAgent):
    """Agent powered by runnables."""

    def __init__(
        self,
        runnable: Runnable[dict, Union[AgentAction, AgentFinish]],
        input_keys_arg: list[str] = [],
        return_keys_arg: list[str] = [],
        stream_runnable: bool = True,
    ) -> None:
        self.runnable = runnable
        self.input_keys_arg = input_keys_arg
        self.return_keys_arg = return_keys_arg
        self.stream_runnable = stream_runnable

    class Config:
        """Configuration for this pydantic object."""

        arbitrary_types_allowed = True

    @property
    def return_values(self) -> list[str]:
        """Return values of the agent."""
        return self.return_keys_arg

    @property
    def input_keys(self) -> list[str]:
        return self.input_keys_arg

    def plan(
        self,
        intermediate_steps: list[tuple[AgentAction, str]],
        callbacks: Callbacks = None,
        **kwargs: Any,
    ) -> Union[AgentAction, AgentFinish]:
        """Based on past history and current inputs, decide what to do.

        Args:
            intermediate_steps: Steps the LLM has taken to date,
                along with the observations.
            callbacks: Callbacks to run.
            **kwargs: User inputs.

        Returns:
            Action specifying what tool to use.
        """
        inputs = {**kwargs, **{"intermediate_steps": intermediate_steps}}
        final_output: Any = None
        if self.stream_runnable:
            # Use streaming to make sure that the underlying LLM is invoked in a
            # streaming
            # fashion to make it possible to get access to the individual LLM tokens
            # when using stream_log with the Agent Executor.
            # Because the response from the plan is not a generator, we need to
            # accumulate the output into final output and return that.
            for chunk in self.runnable.stream(inputs, config={"callbacks": callbacks}):
                if final_output is None:
                    final_output = chunk
                else:
                    final_output += chunk
        else:
            final_output = self.runnable.invoke(inputs, config={"callbacks": callbacks})

        return final_output

    async def aplan(
        self,
        intermediate_steps: list[tuple[AgentAction, str]],
        callbacks: Callbacks = None,
        **kwargs: Any,
    ) -> Union[
        AgentAction,
        AgentFinish,
    ]:
        """Based on past history and current inputs, decide what to do.

        Args:
            intermediate_steps: Steps the LLM has taken to date,
                along with observations
            callbacks: Callbacks to run.
            **kwargs: User inputs

        Returns:
            Action specifying what tool to use.
        """
        inputs = {**kwargs, **{"intermediate_steps": intermediate_steps}}
        final_output: Any = None
        if self.stream_runnable:
            # Use streaming to make sure that the underlying LLM is invoked in a
            # streaming
            # fashion to make it possible to get access to the individual LLM tokens
            # when using stream_log with the Agent Executor.
            # Because the response from the plan is not a generator, we need to
            # accumulate the output into final output and return that.
            async for chunk in self.runnable.astream(
                inputs, config={"callbacks": callbacks}
            ):
                if final_output is None:
                    final_output = chunk
                else:
                    final_output += chunk
        else:
            final_output = await self.runnable.ainvoke(
                inputs, config={"callbacks": callbacks}
            )
        return final_output


def create_react_agent(
    model: type_model_name,
    tools: list[BaseTool],
    generation_config: GenerationParamsModel | None = None,
) -> BaseSingleActionAgent:
    TOOLS_PROMPT = "\n".join(
        [
            f"""<tool_name>{tool.name}</tool_name>
<parameters>
{"".join([f"<parameter><name>{param['name']}</name><type>{param['type']}</type><description>{param['description']}</description><is_required>{param['is_required']}</is_required></parameter>" for param in tool.extract_params_and_descriptions()])}
</parameters>
<tool_description>{tool.description}</tool_description>
"""
            for tool in tools
        ]
    )
    prompt = PromptTemplate.from_template(AGENT_PROMPT_FOR_CLAUDE)

    stop = ["<observation>"]
    generation_params = generation_config or GenerationParamsModel(
        max_tokens=DEFAULT_GENERATION_CONFIG["max_tokens"],
        top_k=DEFAULT_GENERATION_CONFIG["top_k"],
        top_p=DEFAULT_GENERATION_CONFIG["top_p"],
        temperature=DEFAULT_GENERATION_CONFIG["temperature"],
        stop_sequences=DEFAULT_GENERATION_CONFIG["stop_sequences"],
    )
    # Overwrite the default generation config with the stop sequences
    generation_params.stop_sequences = stop

    llm = BedrockLLM.from_model(model=model, generation_params=generation_params)

    output_parser = ReActSingleInputOutputParser()

    prompt_partial = prompt.partial(
        tools=TOOLS_PROMPT, tool_names=", ".join([t.name for t in tools])
    )

    agent = (
        RunnablePassthrough.assign(
            agent_scratchpad=lambda x: format_log_to_str(x["intermediate_steps"]),
        )
        | prompt_partial
        | llm
        | output_parser
    )
    return agent  # type: ignore


class AgentExecutor(Chain):
    """Agent that is using tools."""

    agent: BaseSingleActionAgent
    """The agent to run for creating a plan and determining actions
    to take at each step of the execution loop."""
    tools: Sequence[BaseTool]
    """The valid tools the agent can call."""
    return_intermediate_steps: bool = False
    """Whether to return the agent's trajectory of intermediate steps
    at the end in addition to the final output."""
    max_iterations: Optional[int] = MAX_ITERATIONS
    """The maximum number of steps to take before ending the execution
    loop.

    Setting to 'None' could lead to an infinite loop."""
    max_execution_time: Optional[float] = None
    """The maximum amount of wall clock time to spend in the execution
    loop.
    """
    early_stopping_method: str = "force"
    """The method to use for early stopping if the agent never
    returns `AgentFinish`. Either 'force' or 'generate'.

    `"force"` returns a string saying that it stopped because it met a
        time or iteration limit.

    `"generate"` calls the agent's LLM Chain one final time to generate
        a final answer based on the previous steps.
    """
    handle_parsing_errors: Union[bool, str, Callable[[OutputParserException], str]] = (
        False
    )
    """How to handle errors raised by the agent's output parser.
    Defaults to `False`, which raises the error.
    If `true`, the error will be sent back to the LLM as an observation.
    If a string, the string itself will be sent to the LLM as an observation.
    If a callable function, the function will be called with the exception
     as an argument, and the result of that function will be passed to the agent
      as an observation.
    """
    trim_intermediate_steps: Union[
        int,
        Callable[[list[tuple[AgentAction, str]]], list[tuple[AgentAction, str]]],
    ] = -1

    @root_validator(pre=True)
    def validate_runnable_agent(cls, values: dict) -> dict:
        """Convert runnable to agent if passed in."""
        agent = values["agent"]
        if isinstance(agent, Runnable):
            try:
                output_type = agent.OutputType
            except Exception as _:
                multi_action = False
            else:
                multi_action = output_type == Union[list[AgentAction], AgentFinish]

            stream_runnable = values.pop("stream_runnable", True)
            if multi_action:
                raise NotImplementedError(
                    "RunnableMultiActionAgent is not supported in AgentExecutor."
                )
            else:
                values["agent"] = RunnableAgent(
                    runnable=agent, stream_runnable=stream_runnable
                )
        return values

    def iter(
        self,
        inputs: Any,
        callbacks: Callbacks = None,
        *,
        include_run_info: bool = False,
    ) -> AgentExecutorIterator:
        """Enables iteration over steps taken to reach final output."""
        return AgentExecutorIterator(
            self,
            inputs,
            callbacks,
            tags=self.tags,
            include_run_info=include_run_info,
        )

    @property
    def input_keys(self) -> list[str]:
        """Return the input keys.

        :meta private:
        """
        return self.agent.input_keys

    @property
    def output_keys(self) -> list[str]:
        """Return the singular output key.

        :meta private:
        """
        if self.return_intermediate_steps:
            return self.agent.return_values + ["intermediate_steps"]
        else:
            return self.agent.return_values

    def lookup_tool(self, name: str) -> BaseTool:
        """Lookup tool by name."""
        return {tool.name: tool for tool in self.tools}[name]

    def _should_continue(self, iterations: int, time_elapsed: float) -> bool:
        if self.max_iterations is not None and iterations >= self.max_iterations:
            return False
        if (
            self.max_execution_time is not None
            and time_elapsed >= self.max_execution_time
        ):
            return False

        return True

    def _return(
        self,
        output: AgentFinish,
        intermediate_steps: list,
        run_manager: Optional[CallbackManagerForChainRun] = None,
    ) -> dict[str, Any]:
        if run_manager:
            run_manager.on_agent_finish(output, color="green", verbose=self.verbose)
        final_output = output.return_values
        if self.return_intermediate_steps:
            final_output["intermediate_steps"] = intermediate_steps
        return final_output

    async def _areturn(
        self,
        output: AgentFinish,
        intermediate_steps: list,
        run_manager: Optional[AsyncCallbackManagerForChainRun] = None,
    ) -> dict[str, Any]:
        if run_manager:
            await run_manager.on_agent_finish(
                output, color="green", verbose=self.verbose
            )
        final_output = output.return_values
        if self.return_intermediate_steps:
            final_output["intermediate_steps"] = intermediate_steps
        return final_output

    def _consume_next_step(
        self, values: NextStepOutput
    ) -> Union[AgentFinish, list[tuple[AgentAction, str]]]:
        if isinstance(values[-1], AgentFinish):
            assert len(values) == 1
            return values[-1]
        else:
            return [
                (a.action, a.observation) for a in values if isinstance(a, AgentStep)
            ]

    def _take_next_step(
        self,
        name_to_tool_map: dict[str, BaseTool],
        color_mapping: dict[str, str],
        inputs: dict[str, str],
        intermediate_steps: list[tuple[AgentAction, str]],
        run_manager: Optional[CallbackManagerForChainRun] = None,
    ) -> Union[AgentFinish, list[tuple[AgentAction, str]]]:
        return self._consume_next_step(
            [
                a
                for a in self._iter_next_step(
                    name_to_tool_map,
                    color_mapping,
                    inputs,
                    intermediate_steps,
                    run_manager,
                )
            ]
        )

    def _iter_next_step(
        self,
        name_to_tool_map: dict[str, BaseTool],
        color_mapping: dict[str, str],
        inputs: dict[str, str],
        intermediate_steps: list[tuple[AgentAction, str]],
        run_manager: Optional[CallbackManagerForChainRun] = None,
    ) -> Iterator[Union[AgentFinish, AgentAction, AgentStep]]:
        """Take a single step in the thought-action-observation loop.

        Override this to take control of how the agent makes and acts on choices.
        """
        try:
            intermediate_steps = self._prepare_intermediate_steps(intermediate_steps)

            # Call the LLM to see what to do.
            output = self.agent.plan(
                intermediate_steps,
                callbacks=run_manager.get_child() if run_manager else None,
                **inputs,
            )
        except OutputParserException as e:
            if isinstance(self.handle_parsing_errors, bool):
                raise_error = not self.handle_parsing_errors
            else:
                raise_error = False
            if raise_error:
                raise ValueError(
                    "An output parsing error occurred. "
                    "In order to pass this error back to the agent and have it try "
                    "again, pass `handle_parsing_errors=True` to the AgentExecutor. "
                    f"This is the error: {str(e)}"
                )
            text = str(e)
            if isinstance(self.handle_parsing_errors, bool):
                if e.send_to_llm:
                    observation = str(e.observation)
                    text = str(e.llm_output)
                else:
                    observation = "Invalid or incomplete response"
            elif isinstance(self.handle_parsing_errors, str):
                observation = self.handle_parsing_errors
            elif callable(self.handle_parsing_errors):
                observation = self.handle_parsing_errors(e)
            else:
                raise ValueError("Got unexpected type of `handle_parsing_errors`")
            output = AgentAction("_Exception", observation, text)
            if run_manager:
                run_manager.on_agent_action(output, color="green")
            tool_run_kwargs = self.agent.tool_run_logging_kwargs()
            observation = ExceptionTool().run(
                output.tool_input,
                verbose=self.verbose,
                color=None,
                callbacks=run_manager.get_child() if run_manager else None,
                **tool_run_kwargs,
            )
            yield AgentStep(action=output, observation=observation)
            return

        # If the tool chosen is the finishing tool, then we end and return.
        if isinstance(output, AgentFinish):
            yield output
            return

        actions: list[AgentAction]
        if isinstance(output, AgentAction):
            actions = [output]
        else:
            actions = output
        for agent_action in actions:
            yield agent_action
        for agent_action in actions:
            yield self._perform_agent_action(
                name_to_tool_map, color_mapping, agent_action, run_manager
            )

    def _perform_agent_action(
        self,
        name_to_tool_map: dict[str, BaseTool],
        color_mapping: dict[str, str],
        agent_action: AgentAction,
        run_manager: Optional[CallbackManagerForChainRun] = None,
    ) -> AgentStep:
        if run_manager:
            run_manager.on_agent_action(agent_action, color="green")
        # Otherwise we lookup the tool
        if agent_action.tool in name_to_tool_map:
            tool = name_to_tool_map[agent_action.tool]
            return_direct = tool.return_direct
            color = color_mapping[agent_action.tool]
            tool_run_kwargs = self.agent.tool_run_logging_kwargs()
            if return_direct:
                tool_run_kwargs["llm_prefix"] = ""
            # We then call the tool on the tool input to get an observation

            # The original langchain implementation cannot handle multiple inputs, so we need to convert the input to a dict
            tool_input = agent_action.tool_input
            logger.info(f"tool_input: {tool_input}")
            if type(agent_action.tool_input) == str:
                try:
                    tool_input = json.loads(agent_action.tool_input)
                except json.JSONDecodeError:
                    pass

            observation = tool.run(
                tool_input,
                verbose=self.verbose,
                color=color,
                callbacks=run_manager.get_child() if run_manager else None,
                **tool_run_kwargs,
            )
            if isinstance(tool, AnswerWithKnowledgeTool):
                # If the tool is AnswerWithKnowledgeTool, we need to extract the output
                observation = observation["output"]
        else:
            tool_run_kwargs = self.agent.tool_run_logging_kwargs()
            observation = InvalidTool().run(
                {
                    "requested_tool_name": agent_action.tool,
                    "available_tool_names": list(name_to_tool_map.keys()),
                },
                verbose=self.verbose,
                color=None,
                callbacks=run_manager.get_child() if run_manager else None,
                **tool_run_kwargs,
            )
        return AgentStep(action=agent_action, observation=observation)

    async def _atake_next_step(
        self,
        name_to_tool_map: dict[str, BaseTool],
        color_mapping: dict[str, str],
        inputs: dict[str, str],
        intermediate_steps: list[tuple[AgentAction, str]],
        run_manager: Optional[AsyncCallbackManagerForChainRun] = None,
    ) -> Union[AgentFinish, list[tuple[AgentAction, str]]]:
        raise NotImplementedError()

    async def _aiter_next_step(
        self,
        name_to_tool_map: dict[str, BaseTool],
        color_mapping: dict[str, str],
        inputs: dict[str, str],
        intermediate_steps: list[tuple[AgentAction, str]],
        run_manager: Optional[AsyncCallbackManagerForChainRun] = None,
    ) -> AsyncIterator[Union[AgentFinish, AgentAction, AgentStep]]:
        """Take a single step in the thought-action-observation loop.

        Override this to take control of how the agent makes and acts on choices.
        """
        raise NotImplementedError()

    async def _aperform_agent_action(
        self,
        name_to_tool_map: dict[str, BaseTool],
        color_mapping: dict[str, str],
        agent_action: AgentAction,
        run_manager: Optional[AsyncCallbackManagerForChainRun] = None,
    ) -> AgentStep:
        raise NotImplementedError()

    def _call(
        self,
        inputs: dict[str, str],
        run_manager: Optional[CallbackManagerForChainRun] = None,
    ) -> dict[str, Any]:
        """Run text through and get agent response."""
        # Construct a mapping of tool name to tool for easy lookup
        name_to_tool_map = {tool.name: tool for tool in self.tools}
        # We construct a mapping from each tool to a color, used for logging.
        color_mapping = get_color_mapping(
            [tool.name for tool in self.tools], excluded_colors=["green", "red"]
        )
        intermediate_steps: list[tuple[AgentAction, str]] = []
        # Let's start tracking the number of iterations and time elapsed
        iterations = 0
        time_elapsed = 0.0
        start_time = time.time()
        # We now enter the agent loop (until it returns something).
        while self._should_continue(iterations, time_elapsed):
            next_step_output = self._take_next_step(
                name_to_tool_map,
                color_mapping,
                inputs,
                intermediate_steps,
                run_manager=run_manager,
            )
            if isinstance(next_step_output, AgentFinish):
                return self._return(
                    next_step_output,
                    intermediate_steps,
                    run_manager=run_manager,
                )

            intermediate_steps.extend(next_step_output)
            if len(next_step_output) == 1:
                next_step_action = next_step_output[0]
                # See if tool should return directly
                tool_return = self._get_tool_return(next_step_action)
                if tool_return is not None:
                    return self._return(
                        tool_return, intermediate_steps, run_manager=run_manager
                    )
            iterations += 1
            time_elapsed = time.time() - start_time
        output = self.agent.return_stopped_response(
            self.early_stopping_method, intermediate_steps, **inputs
        )
        return self._return(output, intermediate_steps, run_manager=run_manager)

    async def _acall(
        self,
        inputs: dict[str, str],
        run_manager: Optional[AsyncCallbackManagerForChainRun] = None,
    ) -> dict[str, str]:
        """Run text through and get agent response."""
        raise NotImplementedError()

    def _get_tool_return(
        self, next_step_output: tuple[AgentAction, str]
    ) -> Optional[AgentFinish]:
        """Check if the tool is a returning tool."""
        agent_action, observation = next_step_output
        name_to_tool_map = {tool.name: tool for tool in self.tools}
        return_value_key = "output"
        if len(self.agent.return_values) > 0:
            return_value_key = self.agent.return_values[0]
        # Invalid tools won't be in the map, so we return False.
        if agent_action.tool in name_to_tool_map:
            if name_to_tool_map[agent_action.tool].return_direct:
                return AgentFinish(
                    {return_value_key: observation},
                    "",
                )
        return None

    def _prepare_intermediate_steps(
        self, intermediate_steps: list[tuple[AgentAction, str]]
    ) -> list[tuple[AgentAction, str]]:
        if (
            isinstance(self.trim_intermediate_steps, int)
            and self.trim_intermediate_steps > 0
        ):
            return intermediate_steps[-self.trim_intermediate_steps :]
        elif callable(self.trim_intermediate_steps):
            return self.trim_intermediate_steps(intermediate_steps)
        else:
            return intermediate_steps

    def stream(
        self,
        input: Union[dict[str, Any], Any],
        config: Optional[RunnableConfig] = None,
        **kwargs: Any,
    ) -> Iterator[AddableDict]:
        """Enables streaming over steps taken to reach final output."""
        config = ensure_config(config)
        iterator = AgentExecutorIterator(
            self,
            input,
            config.get("callbacks"),
            tags=config.get("tags"),
            metadata=config.get("metadata"),
            run_name=config.get("run_name"),
            run_id=config.get("run_id"),
            yield_actions=True,
            **kwargs,
        )
        for step in iterator:
            yield step

    # async def astream(
    #     self,
    #     input: Union[dict[str, Any], Any],
    #     config: Optional[RunnableConfig] = None,
    #     **kwargs: Any,
    # ) -> AsyncIterator[AddableDict]:
    #     """Enables streaming over steps taken to reach final output."""
    #     raise NotImplementedError()
