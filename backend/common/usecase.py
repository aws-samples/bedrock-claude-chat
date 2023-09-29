import json
import logging
from datetime import datetime

from bedrock import _create_body, get_model_id, invoke
from repositories.conversation import (
    RecordNotFoundError,
    find_conversation_by_id,
    store_conversation,
)
from repositories.model import ContentModel, ConversationModel, MessageModel
from route_schema import ChatInput, ChatOutput, Content, MessageOutput
from ulid import ULID
from utils import get_buffer_string

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)


def prepare_conversation(user_id: str, chat_input: ChatInput) -> ConversationModel:
    try:
        # Fetch existing conversation
        conversation = find_conversation_by_id(user_id, chat_input.conversation_id)
        logger.debug(f"Found conversation: {conversation}")
    except RecordNotFoundError:
        logger.debug(
            f"No conversation found with id: {chat_input.conversation_id}. Creating new conversation."
        )
        # Create new conversation
        conversation = ConversationModel(
            id=chat_input.conversation_id,
            title="New conversation",
            create_time=datetime.now().timestamp(),
            messages=[],
        )

    # Append user chat input to the conversation
    new_message = MessageModel(
        id=str(ULID()),
        role=chat_input.message.role,
        content=ContentModel(
            content_type=chat_input.message.content.content_type,
            body=chat_input.message.content.body,
        ),
        model=chat_input.message.model,
        create_time=datetime.now().timestamp(),
    )
    conversation.messages.append(new_message)

    return conversation


def get_invoke_payload(conversation: ConversationModel, chat_input: ChatInput):
    prompt = get_buffer_string(conversation.messages)
    body = _create_body(chat_input.message.model, prompt)
    model_id = get_model_id(chat_input.message.model)
    accept = "application/json"
    content_type = "application/json"
    return {
        "body": body,
        "model_id": model_id,
        "accept": accept,
        "content_type": content_type,
    }


def chat(user_id: str, chat_input: ChatInput) -> ChatOutput:
    conversation = prepare_conversation(user_id, chat_input)

    # Invoke Bedrock
    prompt = get_buffer_string(conversation.messages)
    reply_txt = invoke(prompt=prompt, model=chat_input.message.model)

    # Append bedrock output
    message = MessageModel(
        id=str(ULID()),
        role="assistant",
        content=ContentModel(content_type="text", body=reply_txt),
        model=chat_input.message.model,
        create_time=datetime.now().timestamp(),
    )
    conversation.messages.append(message)

    # Store updated conversation
    store_conversation(user_id, conversation)

    output = ChatOutput(
        conversation_id=conversation.id,
        create_time=conversation.create_time,
        message=MessageOutput(
            id=message.id,
            role=message.role,
            content=Content(
                content_type=message.content.content_type,
                body=message.content.body,
            ),
            model=message.model,
        ),
    )

    return output


def propose_conversation_title(
    user_id: str, conversation_id: str, model="claude"
) -> str:
    assert model == "claude", "Only claude model is supported for now."
    PROMPT = """この会話に件名を一言でつけてください。出力は件名だけにしてください。その他の文字は一切出力しないでください。言語は推測してください（英語なら英語で出力）。"""

    # Fetch existing conversation
    conversation = find_conversation_by_id(user_id, conversation_id)
    # Append message to generate title
    new_message = MessageModel(
        id=str(ULID()),
        role="user",
        content=ContentModel(
            content_type="text",
            body=PROMPT,
        ),
        model=model,
        create_time=datetime.now().timestamp(),
    )
    conversation.messages.append(new_message)

    # Invoke Bedrock
    prompt = get_buffer_string(conversation.messages)
    reply_txt = invoke(prompt=prompt, model=model)
    reply_txt = reply_txt.replace("\n", "")
    return reply_txt
