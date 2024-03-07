from typing import Literal, Optional

from app.routes.schemas.base import BaseSchema
from pydantic import Field


class Content(BaseSchema):
    content_type: Literal["text", "image"]
    media_type: Optional[str] = Field(
        None,
        description="MIME type of the image. Must be specified if `content_type` is `image`.",
    )
    body: str = Field(..., description="Content body. Text or base64 encoded image.")


class MessageInput(BaseSchema):
    role: str
    content: list[Content]
    model: Literal["claude-instant-v1", "claude-v2", "claude-v3-sonnet"]
    parent_message_id: str | None
    message_id: str | None = Field(
        ..., description="Unique message id. If not provided, it will be generated."
    )


class MessageOutput(BaseSchema):
    role: str
    content: list[Content]
    # NOTE: "claude" will be deprecated (same as "claude-v2")
    model: Literal["claude-instant-v1", "claude-v2", "claude", "claude-v3-sonnet"]
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
