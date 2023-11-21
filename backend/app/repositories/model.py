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
    bot_id: str | None


class ConversationMetaModel(BaseModel):
    id: str
    title: str
    create_time: float
    model: str
    bot_id: str | None


class BotModel(BaseModel):
    id: str
    title: str
    description: str | None
    instruction: str
    create_time: float
    last_used_time: float


class BotMetaModel(BaseModel):
    id: str
    title: str
    create_time: float
    last_used_time: float
