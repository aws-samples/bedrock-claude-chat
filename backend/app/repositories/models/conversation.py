from typing import Literal

from app.routes.schemas.conversation import type_model_name
from pydantic import BaseModel


class ContentModel(BaseModel):
    content_type: Literal["text", "image"]
    media_type: str | None
    body: str


class MessageModel(BaseModel):
    role: str
    content: list[ContentModel]
    model: type_model_name
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
