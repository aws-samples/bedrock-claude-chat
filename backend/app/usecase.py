import json
import logging
from datetime import datetime

from app.bedrock import _create_body, get_model_id, invoke
from app.repositories.conversation import (
    RecordNotFoundError,
    find_conversation_by_id,
    store_conversation,
)
from app.repositories.model import ContentModel, ConversationModel, MessageModel
from app.route_schema import ChatInput, ChatOutput, Content, MessageOutput
from app.utils import get_buffer_string
from ulid import ULID

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)


def prepare_conversation(
    user_id: str, chat_input: ChatInput
) -> tuple[str, ConversationModel]:
    try:
        # Fetch existing conversation
        conversation = find_conversation_by_id(user_id, chat_input.conversation_id)
        logger.debug(f"Found conversation: {conversation}")
        parent_id = chat_input.message.parent_message_id
    except RecordNotFoundError:
        logger.debug(
            f"No conversation found with id: {chat_input.conversation_id}. Creating new conversation."
        )
        # Create new conversation
        conversation = ConversationModel(
            id=chat_input.conversation_id,
            title="New conversation",
            create_time=datetime.now().timestamp(),
            message_map={
                # Dummy system message
                "system": MessageModel(
                    role="system",
                    content=ContentModel(
                        content_type="text",
                        body="",
                    ),
                    model="claude",
                    children=[],
                    parent=None,
                    create_time=datetime.now().timestamp(),
                )
            },
            last_message_id="",
        )
        parent_id = "system"

    # Append user chat input to the conversation
    message_id = str(ULID())
    new_message = MessageModel(
        role=chat_input.message.role,
        content=ContentModel(
            content_type=chat_input.message.content.content_type,
            body=chat_input.message.content.body,
        ),
        model=chat_input.message.model,
        children=[],
        parent=parent_id,
        create_time=datetime.now().timestamp(),
    )
    conversation.message_map[message_id] = new_message

    if conversation.message_map.get(chat_input.message.parent_message_id) is not None:
        conversation.message_map[chat_input.message.parent_message_id].children.append(
            message_id
        )

    return (message_id, conversation)


def get_invoke_payload(conversation: ConversationModel, chat_input: ChatInput):
    messages = trace_to_root(
        node_id=chat_input.message.parent_message_id,
        message_map=conversation.message_map,
    )
    messages.append(chat_input.message)
    prompt = get_buffer_string(messages)
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


def trace_to_root(
    node_id: str, message_map: dict[str, MessageModel]
) -> list[MessageModel]:
    """Trace message map from node to root."""
    result = []

    current_node = message_map.get(node_id)
    while current_node:
        result.append(current_node)
        parent_id = current_node.parent
        if parent_id is None:
            break
        current_node = message_map.get(parent_id)

    return result[::-1]


def chat(user_id: str, chat_input: ChatInput) -> ChatOutput:
    user_msg_id, conversation = prepare_conversation(user_id, chat_input)

    messages = trace_to_root(
        node_id=chat_input.message.parent_message_id,
        message_map=conversation.message_map,
    )
    messages.append(chat_input.message)

    # Invoke Bedrock
    prompt = get_buffer_string(messages)
    reply_txt = invoke(prompt=prompt, model=chat_input.message.model)

    # Issue id for new assistant message
    assistant_msg_id = str(ULID())
    # Append bedrock output to the existing conversation
    message = MessageModel(
        role="assistant",
        content=ContentModel(content_type="text", body=reply_txt),
        model=chat_input.message.model,
        children=[],
        parent=user_msg_id,
        create_time=datetime.now().timestamp(),
    )
    conversation.message_map[assistant_msg_id] = message

    # Append children to parent
    conversation.message_map[user_msg_id].children.append(assistant_msg_id)
    conversation.last_message_id = assistant_msg_id

    # Store updated conversation
    store_conversation(user_id, conversation)

    output = ChatOutput(
        conversation_id=conversation.id,
        create_time=conversation.create_time,
        message=MessageOutput(
            role=message.role,
            content=Content(
                content_type=message.content.content_type,
                body=message.content.body,
            ),
            model=message.model,
            children=message.children,
            parent=message.parent,
        ),
    )

    return output


def propose_conversation_title(
    user_id: str, conversation_id: str, model="claude"
) -> str:
    assert model == "claude", "Only claude model is supported for now."
    PROMPT = """この会話に以下の条件を守り、件名をつけてください。
    ### 条件 ####
    - 出力は件名のみ、その他の文字は一切出力しない
    - 言語はこれまでのやり取りから推測し、その言語でタイトルをつける
      - もし推測された言語が日本語であれば、タイトルは日本語であること
      - もし推測された言語が英語であれば、タイトルは英語であること
    - タイトルは一言であること
    """

    # Fetch existing conversation
    conversation = find_conversation_by_id(user_id, conversation_id)
    messages = trace_to_root(
        node_id=conversation.last_message_id,
        message_map=conversation.message_map,
    )

    # Append message to generate title
    new_message = MessageModel(
        role="user",
        content=ContentModel(
            content_type="text",
            body=PROMPT,
        ),
        model=model,
        children=[],
        parent=conversation.last_message_id,
        create_time=datetime.now().timestamp(),
    )
    messages.append(new_message)

    # Invoke Bedrock
    prompt = get_buffer_string(messages)
    reply_txt = invoke(prompt=prompt, model=model)
    reply_txt = reply_txt.replace("\n", "")
    return reply_txt
