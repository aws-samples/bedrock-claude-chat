"""Callback Handler that post to websocket connection.
"""

import json
from queue import Queue
from typing import Any, Literal, Optional
from uuid import UUID

from langchain_core.agents import AgentAction, AgentFinish
from langchain_core.callbacks.base import BaseCallbackHandler
from langchain_core.outputs import ChatGenerationChunk, GenerationChunk, LLMResult

DEFAULT_ANSWER_PREFIX_TOKENS = ["Final", "Answer", ":"]
FINAL_ANSWER_TAG = "final-answer"
type_status = Literal[
    "ERROR", "FETCHING_KNOWLEDGE", "STREAMING", "STREAMING_END", "THINKING"
]


# class ApigwWebsocketCallbackHandler(BaseCallbackHandler):
#     """Callback Handler that post to websocket connection.
#     `on_llm_new_token` will only send the final answer to the connection.
#     Reference implementation: Reference: https://github.com/langchain-ai/langchain/blob/74f54599f4e6af707ae5b7a7369a9225d23c6604/libs/langchain/langchain/callbacks/streaming_stdout_final_only.py
#     """

#     def append_to_last_tokens(self, token: str) -> None:
#         self.last_tokens.append(token)
#         self.last_tokens_stripped.append(token.strip())
#         if len(self.last_tokens) > len(self.answer_prefix_tokens):
#             self.last_tokens.pop(0)
#             self.last_tokens_stripped.pop(0)

#     def check_if_answer_reached(self) -> bool:
#         # return self.last_tokens == self.answer_prefix_tokens
#         return self.last_tokens_stripped == [
#             t.strip() for t in self.answer_prefix_tokens
#         ]

#     def __init__(
#         self,
#         gatewayapi: Any,
#         connection_id: str,
#         answer_prefix_tokens: Optional[list[str]] = None,
#         debug: bool = False,  # For testing purposes
#     ) -> None:
#         """Initialize callback handler.
#         Args:
#             gatewayapi (Any): ApiGateway management api client.
#             connection_id (str): Connection ID.
#         """
#         if answer_prefix_tokens is None:
#             self.answer_prefix_tokens = DEFAULT_ANSWER_PREFIX_TOKENS
#         else:
#             self.answer_prefix_tokens = answer_prefix_tokens
#         self.last_tokens = [""] * len(self.answer_prefix_tokens)
#         self.last_tokens_stripped = [""] * len(self.answer_prefix_tokens)
#         self.answer_reached = False

#         self.gatewayapi = gatewayapi
#         self.connection_id = connection_id
#         self.debug = debug

#     def _send(self, status: str, body: str):
#         if self.debug:
#             print(body)
#             return

#         if status == "STREAMING_END":
#             self.gatewayapi.post_to_connection(
#                 ConnectionId=self.connection_id,
#                 Data=json.dumps(
#                     {"status": "STREAMING", "completion": "", "stop_reason": body}
#                 ).encode("utf-8"),
#             )
#             return

#         key = "body"
#         if status == "ERROR":
#             key = "reason"
#         elif status == "STREAMING":
#             key = "completion"

#         self.gatewayapi.post_to_connection(
#             ConnectionId=self.connection_id,
#             Data=json.dumps({"status": status, key: body}).encode("utf-8"),
#         )

#     def on_chain_start(self, serialized: dict, inputs: dict, **kwargs: Any) -> None:
#         pass

#     def on_chain_end(self, outputs: dict, **kwargs: Any) -> None:
#         pass

#     def on_tool_end(
#         self,
#         output: Any,
#         observation_prefix: Optional[str] = None,
#         llm_prefix: Optional[str] = None,
#         **kwargs: Any,
#     ) -> None:
#         output = str(output)
#         if observation_prefix is not None:
#             self._send("THINKING", f"\n\n{observation_prefix}")
#         self._send("THINKING", output)
#         if llm_prefix is not None:
#             self._send("THINKING", f"\n\n{llm_prefix}")

#     def on_agent_action(self, action: AgentAction, **kwargs: Any) -> None:
#         self._send("THINKING", action.log)
#         pass

#     def on_llm_new_token(self, token: str, **kwargs: Any) -> None:
#         self.append_to_last_tokens(token)
#         # Check if the last n tokens match the answer_prefix_tokens list ...
#         if self.check_if_answer_reached():
#             self.answer_reached = True
#             return

#         # ... if yes, then print tokens from now on
#         if self.answer_reached:
#             self._send("STREAMING", token)

#     def on_llm_end(self, response: LLMResult, **kwargs: Any) -> Any:
#         """一連のchainの終わりを検知してws閉じるための信号を送る"""
#         ...
#         # generation_info = response.generations[0][0].generation_info
#         # if generation_info is None:
#         #     return
#         # stop_reason = generation_info.get("stop_reason", "")
#         # if stop_reason == "stop_sequence":
#         #     # TODO: とりあえず無視 (Observationでも実行されるのでwsが閉じてしまう)
#         #     # agent end hookで代替できないか？
#         #     return

#         # # Send `stop_reason` to websocket connection
#         # self._send("STREAMING_END", stop_reason)

#     def on_agent_finish(
#         self,
#         finish: AgentFinish,
#         **kwargs: Any,
#     ) -> Any:
#         """一連のchainの終わりを検知してws閉じるための信号を送る"""
#         # エージェントの実行が終わった後。stp_reason取れないっぽいので独自の送る
#         print(f"finish: {finish}")
#         self._send("STREAMING_END", "agent_finish")
#         return finish


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

        if status == "STREAMING_END":
            self.gatewayapi.post_to_connection(
                ConnectionId=self.connection_id,
                Data=json.dumps(
                    {"status": "STREAMING", "completion": "", "stop_reason": body}
                ).encode("utf-8"),
            )
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
        # TODO: switchable by agent_true
        self._send("STREAMING", token)

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

    def on_llm_end(self, response: LLMResult, **kwargs: Any) -> Any:
        """一連のchainの終わりを検知してws閉じるための信号を送る"""
        # TODO: エージェントモードでは実行しない？？
        generation_info = response.generations[0][0].generation_info
        if generation_info is None:
            return
        stop_reason = generation_info.get(
            "stop_reason", generation_info.get("stop_reason", "")
        )
        self._send("STREAMING_END", stop_reason)

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
        """一連のchainの終わりを検知してws閉じるための信号を送る"""
        # エージェントの実行が終わった後。stp_reason取れないっぽいので独自の送る
        print(f"finish: {finish}")
        self._send("STREAMING_END", "agent_finish")
        return finish
