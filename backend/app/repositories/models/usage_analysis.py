from typing import Literal

from pydantic import BaseModel


class BotUsage(BaseModel):
    id: str
    title: str
    description: str
    published_api_stack_name: str | None
    published_api_datetime: int | None
    owner_user_id: str
    # model_id: str
    total_price: float
