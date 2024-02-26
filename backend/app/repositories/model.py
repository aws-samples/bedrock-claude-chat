from typing import Literal

from app.route_schema import type_sync_status
from pydantic import BaseModel


class ContentModel(BaseModel):
    content_type: Literal["text"]
    body: str


class KnowledgeModel(BaseModel):
    source_urls: list[str]
    sitemap_urls: list[str]
    filenames: list[str]


class MessageModel(BaseModel):
    role: str
    content: ContentModel
    model: Literal["claude-instant-v1", "claude-v2"]
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


class BotModel(BaseModel):
    id: str
    title: str
    description: str
    instruction: str
    create_time: float
    last_used_time: float
    # This can be used as the bot is public or not. Also used for GSI PK
    public_bot_id: str | None
    is_pinned: bool
    knowledge: KnowledgeModel
    sync_status: type_sync_status
    sync_status_reason: str
    sync_last_exec_id: str


class BotAliasModel(BaseModel):
    id: str
    title: str
    description: str
    original_bot_id: str
    create_time: float
    last_used_time: float
    is_pinned: bool
    sync_status: type_sync_status
    has_knowledge: bool


class ConversationMeta(BaseModel):
    id: str
    title: str
    create_time: float
    model: str
    bot_id: str | None


class BotMeta(BaseModel):
    id: str
    title: str
    description: str
    create_time: float
    last_used_time: float
    is_pinned: bool
    is_public: bool
    # Whether the bot is owned by the user
    owned: bool
    # Whether the bot is available or not.
    # This can be `False` if the bot is not owned by the user and original bot is removed.
    available: bool
    sync_status: type_sync_status


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


class CognitoUserModel(BaseModel):
    name: str
    email: str
    link: str


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
