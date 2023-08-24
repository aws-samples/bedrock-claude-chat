import json
from datetime import datetime

from bedrock import invoke, invoke_with_stream
from repositories.conversation import find_conversation_by_id, store_conversation
from repositories.model import ContentModel, ConversationModel, MessageModel
from route_schema import ChatInput, ChatOutput, Content, MessageOutput
from ulid import ULID
from utils import get_buffer_string


def chat(user_id: str, chat_input: ChatInput) -> ChatOutput:
    if chat_input.conversation_id:
        # Fetch existing conversation
        conversation = find_conversation_by_id(user_id, chat_input.conversation_id)
    else:
        # Create new conversation
        conversation = ConversationModel(
            # Add user_id as prefix for row-level security.
            # See also: repositories/conversation.py
            id=f"{user_id}_{str(ULID())}",
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


def chat_stream(user_id: str, chat_input: ChatInput):
    raise NotImplementedError("Not supported yet")

    if chat_input.conversation_id:
        # Fetch existing conversation
        conversation = find_conversation_by_id(chat_input.conversation_id)
    else:
        # Create new conversation
        conversation = ConversationModel(
            id=str(ULID()),
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

    # Invoke Bedrock
    prompt = get_buffer_string(conversation.messages)
    reply = []
    for chunk in invoke_with_stream(prompt=prompt, model=chat_input.message.model):
        message = MessageModel(
            id=str(ULID()),
            role="assistant",
            content=ContentModel(content_type="text", body=chunk),
            model=chat_input.message.model,
            create_time=datetime.now().timestamp(),
        )
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
        reply.append(chunk)
        yield f"data: {output.model_dump()}\n\n"

    reply_txt = "".join(reply)

    # Append bedrock output
    conversation.messages.append(
        MessageModel(
            id=str(ULID()),
            role="assistant",
            content=ContentModel(content_type="text", body=reply_txt),
            model=chat_input.message.model,
            create_time=datetime.now().timestamp(),
        )
    )

    # Store updated conversation
    store_conversation(user_id, conversation)


def propose_conversation_title(
    user_id: str, conversation_id: str, model="claude"
) -> str:
    assert model == "claude", "Only claude model is supported for now."
    PROMPT = """この会話に件名を一言でつけてください。出力は件名だけにしてください。その他の文字は一切出力しないでください"""

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
