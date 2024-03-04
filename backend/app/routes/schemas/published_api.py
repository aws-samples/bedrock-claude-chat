from typing import Literal, Optional

from app.routes.schemas.base import BaseSchema
from app.routes.schemas.conversation import Content, MessageInput, MessageOutput
from pydantic import Field


class MessageInputWithoutMessageid(BaseSchema):
    role: str
    content: Content
    model: Literal["claude-instant-v1", "claude-v2"]
    parent_message_id: str | None = Field(None, description="Parent message id.")


class ChatInputWithoutBotId(BaseSchema):
    conversation_id: str | None = Field(
        None,
        description="Unique conversation id. If not provided, new conversation will be generated.",
    )
    message: MessageInputWithoutMessageid


class ChatOutputWithoutBotId(BaseSchema):
    conversation_id: str
    message: MessageOutput
    create_time: float


class MessageRequestedResponse(BaseSchema):
    conversation_id: str
    message_id: str
