from typing import Literal, Optional

from app.routes.schemas.base import BaseSchema
from pydantic import Field


class Content(BaseSchema):
    content_type: Literal["text"]
    body: str


class MessageInput(BaseSchema):
    role: str
    content: Content
    model: Literal["claude-instant-v1", "claude-v2"]
    parent_message_id: str | None
    message_id: str | None = Field(
        ..., description="Unique message id. If not provided, it will be generated."
    )


class MessageOutput(BaseSchema):
    role: str
    content: Content
    # NOTE: "claude" will be deprecated (same as "claude-v2")
    model: Literal["claude-instant-v1", "claude-v2", "claude"]
    children: list[str]
    parent: str | None


class ChatInput(BaseSchema):
    conversation_id: str
    message: MessageInput
    bot_id: Optional[str | None] = Field(None)


class ChatInputWithToken(ChatInput):
    token: str


class ChatOutput(BaseSchema):
    conversation_id: str
    message: MessageOutput
    bot_id: str | None
    create_time: float


class ConversationMetaOutput(BaseSchema):
    id: str
    title: str
    create_time: float
    model: str
    bot_id: str | None


class Conversation(BaseSchema):
    id: str
    title: str
    create_time: float
    message_map: dict[str, MessageOutput]
    last_message_id: str
    bot_id: str | None


class NewTitleInput(BaseSchema):
    new_title: str


class ProposedTitle(BaseSchema):
    title: str
