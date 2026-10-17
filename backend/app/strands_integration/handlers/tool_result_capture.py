"""
Tool result capture handler for Strands integration.
"""

import logging
from typing import Callable

from app.agents.tools.agent_tool import ToolRunResult
from app.stream import OnThinking
from app.strands_integration.converters.tool_converter import (
    strands_tool_result_to_tool_run_result,
    tool_run_result_to_strands_tool_result,
)

from strands.hooks import (
    AfterToolCallEvent,
    BeforeToolCallEvent,
    HookProvider,
    HookRegistry,
)

logger = logging.getLogger(__name__)


class ToolResultCapture(HookProvider):
    def __init__(
        self,
        display_citation: bool,
        on_thinking: Callable[[OnThinking], None] | None = None,
        on_tool_result: Callable[[ToolRunResult], None] | None = None,
    ):
        self.display_citation = display_citation
        self.on_thinking = on_thinking
        self.on_tool_result = on_tool_result

    def register_hooks(self, registry: HookRegistry, **kwargs) -> None:
        registry.add_callback(BeforeToolCallEvent, self.before_tool_execution)
        registry.add_callback(AfterToolCallEvent, self.after_tool_execution)

    def before_tool_execution(self, event: BeforeToolCallEvent) -> None:
        """Handler called before a tool is executed."""
        logger.debug("Before tool execution: %r", event)

        # Call callback if provided
        if self.on_thinking:
            self.on_thinking(
                {
                    "tool_use_id": event.tool_use["toolUseId"],
                    "name": event.tool_use["name"],
                    "input": event.tool_use["input"],
                }
            )

    def after_tool_execution(self, event: AfterToolCallEvent) -> None:
        """Handler called after a tool is executed."""
        logger.debug("After tool execution: %r", event)

        # Convert event to ToolRunResult using the new function
        tool_result = strands_tool_result_to_tool_run_result(
            tool_name=event.tool_use["name"],
            result=event.result,
        )

        # Call callback if provided
        if self.on_tool_result:
            self.on_tool_result(tool_result)

        # Convert ToolRunResult back to Strands ToolResult format with `source_id` for citation
        enhanced_result = tool_run_result_to_strands_tool_result(
            result=tool_result,
            display_citation=self.display_citation,
        )
        event.result = enhanced_result
