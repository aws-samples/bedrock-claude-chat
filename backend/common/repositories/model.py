from pydantic import BaseModel, Field


class ContentModel(BaseModel):
    content_type: str
    body: str


class MessageModel(BaseModel):
    id: str
    role: str
    content: ContentModel
    model: str
    create_time: float


class ConversationModel(BaseModel):
    id: str
    create_time: float
    title: str
    messages: list[MessageModel]
