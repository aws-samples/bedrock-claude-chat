from typing import Literal

from pydantic import BaseModel


class ContentModel(BaseModel):
    content_type: Literal["text"]
    body: str


class MessageModel(BaseModel):
    role: str
    content: ContentModel
    model: Literal["claude-instant-v1", "claude-v2"]
    children: list[str]
    parent: str | None
    create_time: float


class ConversationModel(BaseModel):
    id: str
    create_time: float
    title: str
    message_map: dict[str, MessageModel]
    last_message_id: str
    bot_id: str | None


class BotModel(BaseModel):
    id: str
    title: str
    description: str
    instruction: str
    create_time: float
    last_used_time: float
    # This can be used as the bot is public or not. Also used for GSI PK
    public_bot_id: str | None
    is_pinned: bool


class BotAliasModel(BaseModel):
    id: str
    title: str
    original_bot_id: str
    create_time: float
    last_used_time: float
    is_pinned: bool


class ConversationMeta(BaseModel):
    id: str
    title: str
    create_time: float
    model: str
    bot_id: str | None


class BotMeta(BaseModel):
    id: str
    title: str
    description: str
    create_time: float
    last_used_time: float
    is_pinned: bool
    is_public: bool
    # Whether the bot is owned by the user
    owned: bool
    # Whether the bot is available or not.
    # This can be `False` if the bot is not owned by the user and original bot is removed.
    available: bool
