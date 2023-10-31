from pydantic import BaseModel, Field


class ContentModel(BaseModel):
    content_type: str
    body: str


class MessageModel(BaseModel):
    role: str
    content: ContentModel
    model: str
    children: list[str]
    parent: str | None
    create_time: float


class ConversationModel(BaseModel):
    id: str
    create_time: float
    title: str
    message_map: dict[str, MessageModel]
    last_message_id: str


class ConversationMetaModel(BaseModel):
    id: str
    title: str
    create_time: float
