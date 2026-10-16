import os
import sys

os.environ["BEDROCK_REGION"] = "us-east-1"
sys.path.append(".")

import unittest

from app.strands_integration.agent.factory import create_strands_agent
from strands.hooks import BeforeModelCallEvent

# Blocks as ConverseStream returns them for GPT-6 with reasoning.summary=auto
SUMMARY = {"reasoningContent": {"reasoningText": {"text": "**Planning**\n\n..."}}}
REDACTED = {"reasoningContent": {"redactedContent": b"\x00\x01"}}
TEXT = {"text": "Let me use the calculator."}
TOOL_USE = {"toolUse": {"toolUseId": "t1", "name": "calculator", "input": {}}}


class TestReasoningSummaryReplay(unittest.TestCase):
    def messages(self):
        return [
            {"role": "user", "content": [{"text": "1234 * 5678?"}]},
            {"role": "assistant", "content": [SUMMARY, REDACTED, TEXT, TOOL_USE]},
            {
                "role": "user",
                "content": [
                    {
                        "toolResult": {
                            "toolUseId": "t1",
                            "content": [{"text": "7006652"}],
                        }
                    }
                ],
            },
        ]

    def test_reasoning_text_dropped_before_model_call(self):
        """GPT-6 returns 400 for reasoningText in assistant messages; redactedContent is accepted"""
        for model, enable_reasoning, expected in [
            ("gpt-6-sol", True, [REDACTED, TEXT, TOOL_USE]),
            ("gpt-6-astra", True, [REDACTED, TEXT, TOOL_USE]),
            # Summaries stored on an earlier turn also come back with the toggle off
            # and on Continue
            ("gpt-6-sol", False, [REDACTED, TEXT, TOOL_USE]),
            ("gpt-oss-120b", True, [SUMMARY, REDACTED, TEXT, TOOL_USE]),
            ("claude-v4.7-opus", True, [SUMMARY, REDACTED, TEXT, TOOL_USE]),
        ]:
            with self.subTest(model=model, enable_reasoning=enable_reasoning):
                agent = create_strands_agent(
                    bot=None,
                    instructions=[],
                    model_name=model,
                    enable_reasoning=enable_reasoning,
                )
                agent.messages = self.messages()
                agent.hooks.invoke_callbacks(BeforeModelCallEvent(agent=agent))
                self.assertEqual(agent.messages[1]["content"], expected)
                self.assertEqual(agent.messages[0], self.messages()[0])
                self.assertEqual(agent.messages[2], self.messages()[2])


if __name__ == "__main__":
    unittest.main()
