from typing import Literal

from pydantic import BaseModel


class UsagePerBot(BaseModel):
    id: str  # bot_id
    title: str
    description: str
    published_api_stack_name: str | None
    published_api_datetime: int | None
    owner_user_id: str
    total_price: float


class UsagePerUser(BaseModel):
    id: str  # user_id
    email: str
    total_price: float
