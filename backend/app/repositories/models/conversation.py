from typing import Literal

from app.route_schema import type_sync_status
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
    total_price: float
    message_map: dict[str, MessageModel]
    last_message_id: str
    bot_id: str | None


class ConversationMeta(BaseModel):
    id: str
    title: str
    create_time: float
    model: str
    bot_id: str | None
