from typing import Literal

from pydantic import BaseModel


class ApiUsagePlanQuotaModel(BaseModel):
    limit: int
    offset: int
    period: Literal["DAY", "WEEK", "MONTH"]


class ApiUsagePlanThrottleModel(BaseModel):
    rate_limit: float
    burst_limit: int


class ApiUsagePlanModel(BaseModel):
    id: str
    name: str
    quota: ApiUsagePlanQuotaModel
    throttle: ApiUsagePlanThrottleModel
    key_ids: list[str]


class ApiKeyModel(BaseModel):
    id: str
    description: str
    value: str
    enabled: bool
    created_date: int