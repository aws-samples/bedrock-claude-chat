from typing import Literal, Optional

from app.routes.schemas.base import BaseSchema
from pydantic import Field


class PublishedApiQuota(BaseSchema):
    limit: Optional[int]
    offset: Optional[int]
    period: Optional[Literal["DAY", "WEEK", "MONTH"]]


class PublishedApiThrottle(BaseSchema):
    rate_limit: Optional[float]
    burst_limit: Optional[int]


class BotPublishInput(BaseSchema):
    stage: Optional[str]  # "dev" | "stg" | "prd" | etc.
    quota: PublishedApiQuota
    throttle: PublishedApiThrottle
    allowed_origins: list[str]


class BotPublishOutput(BaseSchema):
    stage: str  # "dev" | "stg" | "prd" | etc.
    quota: PublishedApiQuota
    throttle: PublishedApiThrottle
    allowed_origins: list[str]
    cfn_status: str = Field(
        ..., description="The status of the cloudformation deployment."
    )
    codebuild_id: str = Field(
        ..., description="The id of the codebuild for cfn deployment."
    )
    codebuild_status: str = Field(..., description="The status of the codebuild.")
    endpoint: str | None = Field(..., description="The endpoint of the API Gateway.")
    api_key_ids: list[str]


class ApiKeyInput(BaseSchema):
    description: str


class ApiKeyOutput(BaseSchema):
    id: str
    description: str
    value: str
    enabled: bool
    created_date: int
