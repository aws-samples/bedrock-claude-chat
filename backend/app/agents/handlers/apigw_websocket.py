"""Callback Handler that post to websocket connection.
"""

import json
from typing import Any, Literal, Optional

from langchain_core.agents import AgentAction, AgentFinish
from langchain_core.callbacks.base import BaseCallbackHandler

DEFAULT_ANSWER_PREFIX_TOKENS = ["Final", "Answer", ":"]
FINAL_ANSWER_TAG = "final-answer"
type_status = Literal[
    "ERROR", "FETCHING_KNOWLEDGE", "STREAMING", "STREAMING_END", "THINKING"
]


class ApigwWebsocketCallbackHandler(BaseCallbackHandler):
    """Callback Handler that post to websocket connection.
    `on_llm_new_token` will only send the final answer to the connection.
    Reference implementation: Reference: https://github.com/langchain-ai/langchain/blob/74f54599f4e6af707ae5b7a7369a9225d23c6604/libs/langchain/langchain/callbacks/streaming_stdout_final_only.py
    """

    def __init__(
        self,
        gatewayapi: Any,
        connection_id: str,
        debug: bool = False,  # For testing purposes
    ) -> None:
        """Initialize callback handler.
        Args:
            gatewayapi (Any): ApiGateway management api client.
            connection_id (str): Connection ID.
        """
        self.final_answer_reached = False
        self.current_chunk = ""
        self.gatewayapi = gatewayapi
        self.connection_id = connection_id
        self.debug = debug

    def _send(self, status: str, body: str):
        if self.debug:
            print(body)
            return

        key = "body"
        if status == "ERROR":
            key = "reason"
        elif status == "STREAMING":
            key = "completion"

        self.gatewayapi.post_to_connection(
            ConnectionId=self.connection_id,
            Data=json.dumps({"status": status, key: body}).encode("utf-8"),
        )

    def on_llm_new_token(self, token: str, **kwargs: Any) -> None:
        self.current_chunk += token
        if not self.final_answer_reached:
            if (
                f"<{FINAL_ANSWER_TAG}>" in self.current_chunk
                and f"</{FINAL_ANSWER_TAG}>" in self.current_chunk
            ):
                self.final_answer_reached = True
                start_index = self.current_chunk.index(f"<{FINAL_ANSWER_TAG}>") + len(
                    f"<{FINAL_ANSWER_TAG}>"
                )
                end_index = self.current_chunk.index(f"</{FINAL_ANSWER_TAG}>")
                self._send("STREAMING", self.current_chunk[start_index:end_index])

    def on_tool_end(
        self,
        output: Any,
        observation_prefix: Optional[str] = None,
        llm_prefix: Optional[str] = None,
        **kwargs: Any,
    ) -> None:
        output = str(output)
        if observation_prefix is not None:
            self._send("THINKING", f"\n\n{observation_prefix}")
        self._send("THINKING", output)
        if llm_prefix is not None:
            self._send("THINKING", f"\n\n{llm_prefix}")

    def on_agent_action(self, action: AgentAction, **kwargs: Any) -> None:
        self._send("THINKING", action.log)
        pass

    def on_agent_finish(
        self,
        finish: AgentFinish,
        **kwargs: Any,
    ) -> Any:
        """Callback when agent finishes."""
        print(f"finish: {finish}")
        return finish
