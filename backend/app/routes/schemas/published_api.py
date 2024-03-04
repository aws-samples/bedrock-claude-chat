from typing import Literal, Optional

from app.routes.schemas.base import BaseSchema
from app.routes.schemas.conversation import MessageInput, MessageOutput
from pydantic import Field


class ChatInputWithoutBotId(BaseSchema):
    conversation_id: str
    message: MessageInput


class ChatOutputWithoutBotId(BaseSchema):
    conversation_id: str
    message: MessageOutput
    create_time: float
