from typing import Literal, Optional

from app.routes.schemas.base import BaseSchema
from pydantic import Field


class PublishedBotOutput(BaseSchema):
    id: str = Field(..., description="bot_id")
    title: str
    description: str
    published_stack_name: str | None
    published_datetime: int | None
    owner_user_id: str


class PublishedBotOutputsWithNextToken(BaseSchema):
    bots: list[PublishedBotOutput]
    next_token: str | None


class UsagePerBotOutput(BaseSchema):
    id: str = Field(..., description="bot_id")
    title: str
    description: str
    is_published: bool
    published_datetime: int | None
    owner_user_id: str
    # model_id: str
    total_price: float


class UsagePerUserOutput(BaseSchema):
    id: str = Field(..., description="user_id")
    email: str
    total_price: float
