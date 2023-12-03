from typing import Literal, Optional

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


class BotInput(BaseSchema):
    id: str
    title: str
    instruction: str
    description: str | None


class BotModifyInput(BaseSchema):
    title: str
    instruction: str
    description: str | None


class BotModifyOutput(BaseSchema):
    id: str
    title: str
    instruction: str
    description: str | None


class BotOutput(BaseSchema):
    id: str
    title: str
    description: str | None
    instruction: str
    create_time: float
    last_used_time: float
    is_public: bool
    is_pinned: bool
    # Whether the bot is owned by the user
    owned: bool


class BotMetaOutput(BaseSchema):
    id: str
    title: str
    description: str
    create_time: float
    last_used_time: float
    is_pinned: bool
    is_public: bool
    owned: bool
    # Whether the bot is available or not.
    # This can be `False` if the bot is not owned by the user and original bot is removed.
    available: bool


class BotSwitchVisibilityInput(BaseSchema):
    to_public: bool


class BotPinnedInput(BaseSchema):
    pinned: bool


class User(BaseSchema):
    id: str
    name: str
