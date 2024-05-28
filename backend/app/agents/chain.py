"""Base interface that all chains should implement."""

import inspect
import json
import logging
import warnings
from abc import ABC, abstractmethod
from pathlib import Path
from typing import Any, Dict, List, Optional, Type, Union, cast

from langchain_core.callbacks import (
    AsyncCallbackManager,
    AsyncCallbackManagerForChainRun,
    CallbackManager,
    CallbackManagerForChainRun,
    Callbacks,
)
from langchain_core.load.dump import dumpd
from langchain_core.memory import BaseMemory
from langchain_core.outputs import RunInfo
from langchain_core.pydantic_v1 import BaseModel, Field, root_validator, validator
from langchain_core.runnables import (
    RunnableConfig,
    RunnableSerializable,
    ensure_config,
    run_in_executor,
)
from langchain_core.runnables.utils import create_model

logger = logging.getLogger(__name__)


class Chain(RunnableSerializable[Dict[str, Any], Dict[str, Any]], ABC):
    """Abstract base class for creating structured sequences of calls to components.
    Reference: https://github.com/langchain-ai/langchain/blob/master/libs/langchain/langchain/chains/base.py

    Chains should be used to encode a sequence of calls to components like
    models, document retrievers, other chains, etc., and provide a simple interface
    to this sequence.

    The Chain interface makes it easy to create apps that are:
        - Stateful: add Memory to any Chain to give it state,
        - Observable: pass Callbacks to a Chain to execute additional functionality,
            like logging, outside the main sequence of component calls,
        - Composable: the Chain API is flexible enough that it is easy to combine
            Chains with other components, including other Chains.

    The main methods exposed by chains are:
        - `__call__`: Chains are callable. The `__call__` method is the primary way to
            execute a Chain. This takes inputs as a dictionary and returns a
            dictionary output.
        - `run`: A convenience method that takes inputs as args/kwargs and returns the
            output as a string or object. This method can only be used for a subset of
            chains and cannot return as rich of an output as `__call__`.
    """

    memory: Optional[BaseMemory] = None
    """Optional memory object. Defaults to None.
    Memory is a class that gets called at the start
    and at the end of every chain. At the start, memory loads variables and passes
    them along in the chain. At the end, it saves any returned variables.
    There are many different types of memory - please see memory docs
    for the full catalog."""
    callbacks: Callbacks = Field(default=None, exclude=True)
    """Optional list of callback handlers (or callback manager). Defaults to None.
    Callback handlers are called throughout the lifecycle of a call to a chain,
    starting with on_chain_start, ending with on_chain_end or on_chain_error.
    Each custom chain can optionally call additional callback methods, see Callback docs
    for full details."""
    verbose: bool = Field(default=False)
    """Whether or not run in verbose mode. In verbose mode, some intermediate logs
    will be printed to the console. Defaults to the global `verbose` value,
    accessible via `langchain.globals.get_verbose()`."""
    tags: Optional[List[str]] = None
    """Optional list of tags associated with the chain. Defaults to None.
    These tags will be associated with each call to this chain,
    and passed as arguments to the handlers defined in `callbacks`.
    You can use these to eg identify a specific instance of a chain with its use case.
    """
    metadata: Optional[Dict[str, Any]] = None
    """Optional metadata associated with the chain. Defaults to None.
    This metadata will be associated with each call to this chain,
    and passed as arguments to the handlers defined in `callbacks`.
    You can use these to eg identify a specific instance of a chain with its use case.
    """

    class Config:
        """Configuration for this pydantic object."""

        arbitrary_types_allowed = True

    def get_input_schema(
        self, config: Optional[RunnableConfig] = None
    ) -> Type[BaseModel]:
        # This is correct, but pydantic typings/mypy don't think so.
        return create_model(  # type: ignore[call-overload]
            "ChainInput", **{k: (Any, None) for k in self.input_keys}
        )

    def get_output_schema(
        self, config: Optional[RunnableConfig] = None
    ) -> Type[BaseModel]:
        # This is correct, but pydantic typings/mypy don't think so.
        return create_model(  # type: ignore[call-overload]
            "ChainOutput", **{k: (Any, None) for k in self.output_keys}
        )

    def invoke(
        self,
        input: Dict[str, Any],
        config: Optional[RunnableConfig] = None,
        **kwargs: Any,
    ) -> Dict[str, Any]:
        config = ensure_config(config)
        callbacks = config.get("callbacks")
        tags = config.get("tags")
        metadata = config.get("metadata")
        run_name = config.get("run_name") or self.get_name()
        run_id = config.get("run_id")
        include_run_info = kwargs.get("include_run_info", False)
        return_only_outputs = kwargs.get("return_only_outputs", False)

        inputs = self.prep_inputs(input)
        callback_manager = CallbackManager.configure(
            callbacks,
            self.callbacks,
            self.verbose,
            tags,
            self.tags,
            metadata,
            self.metadata,
        )
        new_arg_supported = inspect.signature(self._call).parameters.get("run_manager")

        run_manager = callback_manager.on_chain_start(
            dumpd(self),
            inputs,
            run_id,
            name=run_name,
        )
        try:
            self._validate_inputs(inputs)
            outputs = (
                self._call(inputs, run_manager=run_manager)
                if new_arg_supported
                else self._call(inputs)
            )

            final_outputs: Dict[str, Any] = self.prep_outputs(
                inputs, outputs, return_only_outputs
            )
        except BaseException as e:
            run_manager.on_chain_error(e)
            raise e
        run_manager.on_chain_end(outputs)

        if include_run_info:
            raise NotImplementedError()
        return final_outputs

    async def ainvoke(
        self,
        input: Dict[str, Any],
        config: Optional[RunnableConfig] = None,
        **kwargs: Any,
    ) -> Dict[str, Any]:
        config = ensure_config(config)
        callbacks = config.get("callbacks")
        tags = config.get("tags")
        metadata = config.get("metadata")
        run_name = config.get("run_name") or self.get_name()
        run_id = config.get("run_id")
        include_run_info = kwargs.get("include_run_info", False)
        return_only_outputs = kwargs.get("return_only_outputs", False)

        inputs = await self.aprep_inputs(input)
        callback_manager = AsyncCallbackManager.configure(
            callbacks,
            self.callbacks,
            self.verbose,
            tags,
            self.tags,
            metadata,
            self.metadata,
        )
        new_arg_supported = inspect.signature(self._acall).parameters.get("run_manager")
        run_manager = await callback_manager.on_chain_start(
            dumpd(self),
            inputs,
            run_id,
            name=run_name,
        )
        try:
            self._validate_inputs(inputs)
            outputs = (
                await self._acall(inputs, run_manager=run_manager)
                if new_arg_supported
                else await self._acall(inputs)
            )
            final_outputs: Dict[str, Any] = await self.aprep_outputs(
                inputs, outputs, return_only_outputs
            )
        except BaseException as e:
            await run_manager.on_chain_error(e)
            raise e
        await run_manager.on_chain_end(outputs)

        return final_outputs

    @property
    def _chain_type(self) -> str:
        raise NotImplementedError("Saving not supported for this chain type.")

    @root_validator()
    def raise_callback_manager_deprecation(cls, values: Dict) -> Dict:
        """Raise deprecation warning if callback_manager is used."""
        if values.get("callback_manager") is not None:
            if values.get("callbacks") is not None:
                raise ValueError(
                    "Cannot specify both callback_manager and callbacks. "
                    "callback_manager is deprecated, callbacks is the preferred "
                    "parameter to pass in."
                )
            warnings.warn(
                "callback_manager is deprecated. Please use callbacks instead.",
                DeprecationWarning,
            )
            values["callbacks"] = values.pop("callback_manager", None)
        return values

    @validator("verbose", pre=True, always=True)
    def set_verbose(cls, verbose: Optional[bool]) -> bool:
        """Set the chain verbosity."""
        return verbose or False

    @property
    @abstractmethod
    def input_keys(self) -> List[str]:
        """Keys expected to be in the chain input."""

    @property
    @abstractmethod
    def output_keys(self) -> List[str]:
        """Keys expected to be in the chain output."""

    def _validate_inputs(self, inputs: Dict[str, Any]) -> None:
        """Check that all inputs are present."""
        if not isinstance(inputs, dict):
            _input_keys = set(self.input_keys)
            if self.memory is not None:
                # If there are multiple input keys, but some get set by memory so that
                # only one is not set, we can still figure out which key it is.
                _input_keys = _input_keys.difference(self.memory.memory_variables)
            if len(_input_keys) != 1:
                raise ValueError(
                    f"A single string input was passed in, but this chain expects "
                    f"multiple inputs ({_input_keys}). When a chain expects "
                    f"multiple inputs, please call it by passing in a dictionary, "
                    "eg `chain({'foo': 1, 'bar': 2})`"
                )

        missing_keys = set(self.input_keys).difference(inputs)
        if missing_keys:
            raise ValueError(f"Missing some input keys: {missing_keys}")

    def _validate_outputs(self, outputs: Dict[str, Any]) -> None:
        missing_keys = set(self.output_keys).difference(outputs)
        if missing_keys:
            raise ValueError(f"Missing some output keys: {missing_keys}")

    @abstractmethod
    def _call(
        self,
        inputs: Dict[str, Any],
        run_manager: Optional[CallbackManagerForChainRun] = None,
    ) -> Dict[str, Any]:
        """Execute the chain.

        This is a private method that is not user-facing. It is only called within
            `Chain.__call__`, which is the user-facing wrapper method that handles
            callbacks configuration and some input/output processing.

        Args:
            inputs: A dict of named inputs to the chain. Assumed to contain all inputs
                specified in `Chain.input_keys`, including any inputs added by memory.
            run_manager: The callbacks manager that contains the callback handlers for
                this run of the chain.

        Returns:
            A dict of named outputs. Should contain all outputs specified in
                `Chain.output_keys`.
        """

    async def _acall(
        self,
        inputs: Dict[str, Any],
        run_manager: Optional[AsyncCallbackManagerForChainRun] = None,
    ) -> Dict[str, Any]:
        """Asynchronously execute the chain.

        This is a private method that is not user-facing. It is only called within
            `Chain.acall`, which is the user-facing wrapper method that handles
            callbacks configuration and some input/output processing.

        Args:
            inputs: A dict of named inputs to the chain. Assumed to contain all inputs
                specified in `Chain.input_keys`, including any inputs added by memory.
            run_manager: The callbacks manager that contains the callback handlers for
                this run of the chain.

        Returns:
            A dict of named outputs. Should contain all outputs specified in
                `Chain.output_keys`.
        """
        return await run_in_executor(
            None, self._call, inputs, run_manager.get_sync() if run_manager else None
        )

    def prep_outputs(
        self,
        inputs: Dict[str, str],
        outputs: Dict[str, str],
        return_only_outputs: bool = False,
    ) -> Dict[str, str]:
        """Validate and prepare chain outputs, and save info about this run to memory.

        Args:
            inputs: Dictionary of chain inputs, including any inputs added by chain
                memory.
            outputs: Dictionary of initial chain outputs.
            return_only_outputs: Whether to only return the chain outputs. If False,
                inputs are also added to the final outputs.

        Returns:
            A dict of the final chain outputs.
        """
        self._validate_outputs(outputs)
        if self.memory is not None:
            self.memory.save_context(inputs, outputs)
        if return_only_outputs:
            return outputs
        else:
            return {**inputs, **outputs}

    async def aprep_outputs(
        self,
        inputs: Dict[str, str],
        outputs: Dict[str, str],
        return_only_outputs: bool = False,
    ) -> Dict[str, str]:
        """Validate and prepare chain outputs, and save info about this run to memory.

        Args:
            inputs: Dictionary of chain inputs, including any inputs added by chain
                memory.
            outputs: Dictionary of initial chain outputs.
            return_only_outputs: Whether to only return the chain outputs. If False,
                inputs are also added to the final outputs.

        Returns:
            A dict of the final chain outputs.
        """
        self._validate_outputs(outputs)
        if self.memory is not None:
            await self.memory.asave_context(inputs, outputs)
        if return_only_outputs:
            return outputs
        else:
            return {**inputs, **outputs}

    def prep_inputs(self, inputs: Union[Dict[str, Any], Any]) -> Dict[str, str]:
        """Prepare chain inputs, including adding inputs from memory.

        Args:
            inputs: Dictionary of raw inputs, or single input if chain expects
                only one param. Should contain all inputs specified in
                `Chain.input_keys` except for inputs that will be set by the chain's
                memory.

        Returns:
            A dictionary of all inputs, including those added by the chain's memory.
        """
        if not isinstance(inputs, dict):
            _input_keys = set(self.input_keys)
            if self.memory is not None:
                # If there are multiple input keys, but some get set by memory so that
                # only one is not set, we can still figure out which key it is.
                _input_keys = _input_keys.difference(self.memory.memory_variables)
            inputs = {list(_input_keys)[0]: inputs}
        if self.memory is not None:
            external_context = self.memory.load_memory_variables(inputs)
            inputs = dict(inputs, **external_context)
        return inputs

    async def aprep_inputs(self, inputs: Union[Dict[str, Any], Any]) -> Dict[str, str]:
        """Prepare chain inputs, including adding inputs from memory.

        Args:
            inputs: Dictionary of raw inputs, or single input if chain expects
                only one param. Should contain all inputs specified in
                `Chain.input_keys` except for inputs that will be set by the chain's
                memory.

        Returns:
            A dictionary of all inputs, including those added by the chain's memory.
        """
        if not isinstance(inputs, dict):
            _input_keys = set(self.input_keys)
            if self.memory is not None:
                # If there are multiple input keys, but some get set by memory so that
                # only one is not set, we can still figure out which key it is.
                _input_keys = _input_keys.difference(self.memory.memory_variables)
            inputs = {list(_input_keys)[0]: inputs}
        if self.memory is not None:
            external_context = await self.memory.aload_memory_variables(inputs)
            inputs = dict(inputs, **external_context)
        return inputs

    @property
    def _run_output_key(self) -> str:
        if len(self.output_keys) != 1:
            raise ValueError(
                f"`run` not supported when there is not exactly "
                f"one output key. Got {self.output_keys}."
            )
        return self.output_keys[0]

    def dict(self, **kwargs: Any) -> Dict:
        """Dictionary representation of chain.

        Expects `Chain._chain_type` property to be implemented and for memory to be
            null.

        Args:
            **kwargs: Keyword arguments passed to default `pydantic.BaseModel.dict`
                method.

        Returns:
            A dictionary representation of the chain.

        Example:
            .. code-block:: python

                chain.dict(exclude_unset=True)
                # -> {"_type": "foo", "verbose": False, ...}
        """
        _dict = super().dict(**kwargs)
        try:
            _dict["_type"] = self._chain_type
        except NotImplementedError:
            pass
        return _dict
