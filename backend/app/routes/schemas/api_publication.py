from typing import Literal, Optional

from app.routes.schemas.base import BaseSchema
from pydantic import Field, root_validator


class PublishedApiQuota(BaseSchema):
    limit: Optional[int]
    offset: Optional[int]
    period: Optional[Literal["DAY", "WEEK", "MONTH"]]

    @root_validator(pre=True)
    def validate_quota(cls, values):
        limit, period = values.get("limit"), values.get("period")
        if (limit is None) != (period is None):
            raise ValueError("limit and period must both be None or both have values")
        if limit is not None and limit <= 0:
            raise ValueError("limit must be a positive integer")
        return values


class PublishedApiThrottle(BaseSchema):
    rate_limit: Optional[float]
    burst_limit: Optional[int]

    @root_validator(pre=True)
    def validate_throttle(cls, values):
        rate_limit, burst_limit = values.get("rate_limit"), values.get("burst_limit")
        if (rate_limit is None) != (burst_limit is None):
            raise ValueError(
                "rate_limit and burst_limit must both be None or both have values"
            )
        if rate_limit is not None and rate_limit <= 0:
            raise ValueError("rate_limit must be a positive number")
        if burst_limit is not None and burst_limit <= 0:
            raise ValueError("burst_limit must be a positive integer")
        return values


class BotPublishInput(BaseSchema):
    stage: Optional[str]  # "dev" | "stg" | "prd" | etc.
    quota: PublishedApiQuota
    throttle: PublishedApiThrottle
    allowed_origins: list[str]


class BotPublishOutput(BaseSchema):
    stage: str = Field(
        ...,
        description="The stage of the API Gateway (e.g. dev, stg, prd). Default value is `api`.",
    )
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
