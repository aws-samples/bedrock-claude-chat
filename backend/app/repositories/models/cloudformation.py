from typing import Literal

from app.route_schema import type_sync_status
from pydantic import BaseModel


class PublishedApiStackModel(BaseModel):
    stack_id: str
    stack_name: str
    stack_status: str
    api_id: str
    api_name: str
    api_usage_plan_id: str
    api_allowed_origins: list[str]
    api_stage: str
    create_time: int
