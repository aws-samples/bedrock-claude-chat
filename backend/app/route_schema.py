from typing import Literal

from humps import camelize
from pydantic import BaseModel, Field


class BaseSchema(BaseModel):
    class Config:
        alias_generator = camelize
        populate_by_name = True


class Content(BaseSchema):
    content_type: Literal["text"] = Field(..., description="現在textのみ")
    body: str


class MessageInput(BaseSchema):
    role: str
    content: Content
    model: Literal["claude-instant-v1", "claude-v2"]
    parent_message_id: str | None


class MessageOutput(BaseSchema):
    role: str
    content: Content
    model: Literal["claude-instant-v1", "claude-v2"]
    children: list[str]
    parent: str | None


class ChatInput(BaseSchema):
    conversation_id: str = Field("", description="会話ID")
    message: MessageInput = Field(..., description="メッセージの内容")


class ChatInputWithToken(ChatInput):
    token: str


class ChatOutput(BaseSchema):
    conversation_id: str | None = Field(...)
    message: MessageOutput = Field(..., description="メッセージの内容")
    create_time: float = Field(..., description="作成日時")


class ConversationMeta(BaseSchema):
    id: str
    title: str
    create_time: float


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


class User(BaseSchema):
    id: str
    name: str
