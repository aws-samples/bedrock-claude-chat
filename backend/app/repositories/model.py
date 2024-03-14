from typing import Literal, Optional

from app.route_schema import type_sync_status
from pydantic import BaseModel


class ContentModel(BaseModel):
    content_type: Literal["text", "image"]
    media_type: Optional[str]
    body: str


class KnowledgeModel(BaseModel):
    source_urls: list[str]
    sitemap_urls: list[str]
    filenames: list[str]


class MessageModel(BaseModel):
    role: str
    content: list[ContentModel]
    model: Literal[
        "claude-instant-v1", "claude-v2", "claude-v3-sonnet", "claude-v3-haiku"
    ]
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
    knowledge: KnowledgeModel
    sync_status: type_sync_status
    sync_status_reason: str
    sync_last_exec_id: str


class BotAliasModel(BaseModel):
    id: str
    title: str
    description: str
    original_bot_id: str
    create_time: float
    last_used_time: float
    is_pinned: bool
    sync_status: type_sync_status
    has_knowledge: bool


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
    sync_status: type_sync_status
