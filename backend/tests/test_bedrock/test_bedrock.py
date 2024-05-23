import sys
import unittest

sys.path.append(".")
from app.bedrock import BedrockLLM, MyChatPromptTemplate
from app.repositories.conversation import store_conversation
from app.repositories.models.conversation import (
    ContentModel,
    ConversationModel,
    MessageModel,
)
from app.routes.schemas.conversation import (
    ChatInput,
    Content,
    MessageInput,
    type_model_name,
)
from app.usecases.chat import prepare_conversation
from app.utils import get_current_time


class TestBedrockLLM(unittest.TestCase):
    """Test BedrockLLM class which is a wrapper for LangChain Agent."""

    MODEL_CLAUDE: type_model_name = "claude-v3-haiku"
    MODEL_MISTRAL: type_model_name = "mistral-7b-instruct"

    def setUp(self) -> None:
        self.user_id = "user2"
        self.conversation_id = "conversation2"
        store_conversation(
            user_id=self.user_id,
            conversation=ConversationModel(
                last_message_id="b-2",
                id=self.conversation_id,
                create_time=1627984879.9,
                title="Test Conversation",
                total_price=0,
                message_map={
                    "1-user": MessageModel(
                        role="user",
                        content=[
                            ContentModel(
                                content_type="text",
                                body="こんにちは",
                                media_type=None,
                            )
                        ],
                        model=self.MODEL_CLAUDE,
                        children=["1-assistant"],
                        parent=None,
                        create_time=1627984879.9,
                        feedback=None,
                        used_chunks=None,
                    ),
                    "1-assistant": MessageModel(
                        role="assistant",
                        content=[
                            ContentModel(
                                content_type="text",
                                body="はい、こんにちは。どうしましたか?",
                                media_type=None,
                            )
                        ],
                        model=self.MODEL_CLAUDE,
                        children=[],
                        parent="1-user",
                        create_time=1627984879.9,
                        feedback=None,
                        used_chunks=None,
                    ),
                },
                bot_id=None,
            ),
        )

    def test_invoke(self):
        # messages = [
        #     MessageModel(
        #         role="instruction",
        #         content=[
        #             ContentModel(
        #                 content_type="text",
        #                 media_type=None,
        #                 body="日本語で応答して",
        #             )
        #         ],
        #         model=self.MODEL_CLAUDE,
        #         children=[],
        #         parent=None,
        #         create_time=get_current_time(),
        #         feedback=None,
        #         used_chunks=None,
        #     ),
        #     MessageModel(
        #         role="user",
        #         content=[
        #             ContentModel(
        #                 content_type="text",
        #                 media_type=None,
        #                 body="Hello, World!",
        #             )
        #         ],
        #         model=self.MODEL_CLAUDE,
        #         children=[],
        #         parent=None,
        #         create_time=get_current_time(),
        #         feedback=None,
        #         used_chunks=None,
        #     ),
        # ]
        # message_map = {
        #     "system": MessageModel(
        #         role="system",
        #         content=[
        #             ContentModel(
        #                 content_type="text",
        #                 body="",
        #                 media_type=None,
        #             )
        #         ],
        #         model=self.MODEL_CLAUDE,
        #         children=["instruction", "1-user"],
        #         parent=None,
        #         create_time=1627984879.9,
        #         feedback=None,
        #         used_chunks=None,
        #     ),
        #     "instruction": MessageModel(
        #         role="instruction",
        #         content=[
        #             ContentModel(
        #                 content_type="text",
        #                 body="いかなる時も日本語で応答して",
        #                 media_type=None,
        #             )
        #         ],
        #         model=self.MODEL_CLAUDE,
        #         children=[],
        #         parent="system",
        #         create_time=1627984879.9,
        #         feedback=None,
        #         used_chunks=None,
        #     ),
        #     "1-user": MessageModel(
        #         role="user",
        #         content=[
        #             ContentModel(
        #                 content_type="text",
        #                 body="Hello!",
        #                 media_type=None,
        #             )
        #         ],
        #         model=self.MODEL_CLAUDE,
        #         children=[],
        #         parent="system",
        #         create_time=1627984879.9,
        #         feedback=None,
        #         used_chunks=None,
        #     ),
        # }
        chat_input = ChatInput(
            conversation_id=self.conversation_id,
            message=MessageInput(
                role="user",
                content=[
                    Content(
                        content_type="text",
                        body="あなたの名前は？",
                        media_type=None,
                    )
                ],
                model=self.MODEL_CLAUDE,
                parent_message_id="1-assistant",
                message_id=None,
            ),
            bot_id=None,
        )
        user_msg_id, conversation, bot = prepare_conversation(self.user_id, chat_input)

        prompt = MyChatPromptTemplate.from_message_map(
            message_map=conversation.message_map,
            parent_message_id=chat_input.message.parent_message_id,
        )
        # prompt = MyChatPromptTemplate.from_messages(messages)

        # print(prompt)
        llm = BedrockLLM.from_model(model=self.MODEL_CLAUDE)
        chain = prompt | llm
        result = chain.invoke({})
        print(result)

    # def test_invoke(self):
    #     llm = BedrockLLM(model=self.MODEL_CLAUDE)
    #     result = llm.invoke("Hello, World!")
    #     print(result)

    # def test_invoke_stream(self):
    #     llm = BedrockLLM(model=self.MODEL_CLAUDE)
    #     for event in llm.stream("Hello, World!"):
    #         print(event)

    # def test_invoke_mistral(self):
    #     llm = BedrockLLM(model=self.MODEL_MISTRAL)
    #     result = llm.invoke("Hello, World!")
    #     print(result)

    # def test_invoke_stream_mistral(self):
    #     llm = BedrockLLM(model=self.MODEL_MISTRAL)
    #     for event in llm.stream("Hello, World!"):
    #         print(event)


if __name__ == "__main__":
    unittest.main()
