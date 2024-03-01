from typing import Literal, Optional

from app.routes.schemas.base import BaseSchema
from pydantic import Field


class PublicBotMetaOutput(BaseSchema):
    id: str
    title: str
    description: str
    is_published: bool
    published_datetime: int | None
    owner_user_id: str
    # model_id: str
    total_price: float
