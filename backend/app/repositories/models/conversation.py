from typing import Literal

from app.routes.schemas.conversation import type_model_name
from pydantic import BaseModel, Field


class ContentModel(BaseModel):
    content_type: Literal["text", "image"]
    media_type: str | None
    body: str


class FeedbackModel(BaseModel):
    thumbs_up: bool
    category: str
    comment: str


class ChunkModel(BaseModel):
    content: str
    content_type: str
    source: str
    rank: int


class MessageModel(BaseModel):
    role: str
    content: list[ContentModel]
    model: type_model_name
    children: list[str]
    parent: str | None
    create_time: float
    feedback: FeedbackModel | None
    used_chunks: list[ChunkModel] | None
    thinking_log: str | None = Field(None, description="Only available for agent.")


class ConversationModel(BaseModel):
    id: str
    create_time: float
    title: str
    total_price: float
    message_map: dict[str, MessageModel]
    last_message_id: str
    bot_id: str | None
    should_continue: bool


class ConversationMeta(BaseModel):
    id: str
    title: str
    create_time: float
    model: str
    bot_id: str | None
