from typing import Literal

from humps import camelize
from pydantic import BaseModel, Field


class BaseSchema(BaseModel):
    class Config:
        alias_generator = camelize
        populate_by_name = True


class Content(BaseSchema):
    content_type: Literal["text"]
    body: str


class MessageInput(BaseSchema):
    role: str
    content: Content
    model: Literal["claude-instant-v1", "claude-v2"]
    parent_message_id: str | None


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


class ChatInputWithToken(ChatInput):
    token: str


class ChatOutput(BaseSchema):
    conversation_id: str | None = Field(...)
    message: MessageOutput
    create_time: float


class ConversationMetaOutput(BaseSchema):
    id: str
    title: str
    create_time: float
    model: str


class Conversation(BaseSchema):
    id: str
    title: str
    create_time: float
    message_map: dict[str, MessageOutput]
    last_message_id: str


class NewTitleInput(BaseSchema):
    new_title: str


class ProposedTitle(BaseSchema):
    title: str


class BotInput(BaseSchema):
    id: str
    title: str
    instruction: str
    description: str | None


class BotOutput(BaseSchema):
    id: str
    create_time: float
    last_used_time: float
    title: str
    instruction: str
    description: str | None
    is_public: bool


class BotMetaOutput(BaseSchema):
    id: str
    title: str
    create_time: float
    last_used_time: float


class User(BaseSchema):
    id: str
    name: str
