from typing import Literal, Optional

from humps import camelize
from pydantic import BaseModel, Field

# Knowledge sync status type
# NOTE: `ORIGINAL_NOT_FOUND` is used when the original bot is removed.
type_sync_status = Literal[
    "QUEUED", "RUNNING", "SUCCEEDED", "FAILED", "ORIGINAL_NOT_FOUND"
]


class BaseSchema(BaseModel):
    class Config:
        alias_generator = camelize
        populate_by_name = True


class Content(BaseSchema):
    content_type: Literal["text"]
    body: str


class Knowledge(BaseSchema):
    source_urls: list[str]
    sitemap_urls: list[str]
    filenames: list[str]


class KnowledgeDiffInput(BaseSchema):
    source_urls: list[str]
    sitemap_urls: list[str]
    added_filenames: list[str]
    # updated_filenames: list[str]
    deleted_filenames: list[str]
    unchanged_filenames: list[str]


class MessageInput(BaseSchema):
    role: str
    content: Content
    model: Literal["claude-instant-v1", "claude-v2"]
    parent_message_id: str | None


class MessageOutput(BaseSchema):
    role: str
    content: Content
    # NOTE: "claude" will be deprecated (same as "claude-v2")
    model: Literal["claude-instant-v1", "claude-v2", "claude"]
    children: list[str]
    parent: str | None


class ChatInput(BaseSchema):
    conversation_id: str
    message: MessageInput
    bot_id: Optional[str | None] = Field(None)


class ChatInputWithToken(ChatInput):
    token: str


class ChatOutput(BaseSchema):
    conversation_id: str
    message: MessageOutput
    bot_id: str | None
    create_time: float


class ConversationMetaOutput(BaseSchema):
    id: str
    title: str
    create_time: float
    model: str
    bot_id: str | None


class Conversation(BaseSchema):
    id: str
    title: str
    create_time: float
    message_map: dict[str, MessageOutput]
    last_message_id: str
    bot_id: str | None


class NewTitleInput(BaseSchema):
    new_title: str


class ProposedTitle(BaseSchema):
    title: str


class BotInput(BaseSchema):
    id: str
    title: str
    instruction: str
    description: str | None
    knowledge: Knowledge | None


class BotModifyInput(BaseSchema):
    title: str
    instruction: str
    description: str | None
    knowledge: KnowledgeDiffInput | None


class BotModifyOutput(BaseSchema):
    id: str
    title: str
    instruction: str
    description: str
    knowledge: Knowledge


class BotOutput(BaseSchema):
    id: str
    title: str
    description: str
    instruction: str
    create_time: float
    last_used_time: float
    is_public: bool
    is_pinned: bool
    # Whether the bot is owned by the user
    owned: bool
    knowledge: Knowledge
    sync_status: type_sync_status
    sync_status_reason: str
    sync_last_exec_id: str


class BotMetaOutput(BaseSchema):
    id: str
    title: str
    description: str
    create_time: float
    last_used_time: float
    is_pinned: bool
    is_public: bool
    owned: bool
    # Whether the bot is available or not.
    # This can be `False` if the bot is not owned by the user and original bot is removed.
    available: bool
    sync_status: type_sync_status


class BotSummaryOutput(BaseSchema):
    id: str
    title: str
    description: str
    create_time: float
    last_used_time: float
    is_pinned: bool
    is_public: bool
    owned: bool
    sync_status: type_sync_status
    has_knowledge: bool


class BotSwitchVisibilityInput(BaseSchema):
    to_public: bool


class BotPinnedInput(BaseSchema):
    pinned: bool


class BotPresignedUrlOutput(BaseSchema):
    url: str


# ----


class PublicBotMeta(BaseSchema):
    id: str
    title: str
    description: str
    is_published: bool
    published_datetime: int | None
    owner_user_id: str
    # TODO: add `price` to the schema


class PublicBotMetaOutput(BaseSchema):
    bots: list[PublicBotMeta]
    next_token: str | None


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


class ApiKeyOutput(BaseSchema):
    id: str
    value: str
    enabled: bool
    created_date: int


# class PublishedApiUser(BaseSchema):
#     name: str
#     email: str
#     link: str


# class PublishedApiBotKnowledge(BaseSchema):
#     source_urls: list[str]
#     sitemap_urls: list[str]
#     file_s3_links: list[str]


# class PublishedApiBot(BaseSchema):
#     title: str
#     description: str
#     instruction: str
#     knowledge: PublishedApiBotKnowledge


# class PublishedApiApiGateway(BaseSchema):
#     id: str
#     link: str
#     endpoint: str
#     throttle: PublishedApiThrottle
#     quota: PublishedApiQuota
#     allowed_origins: list[str]
#     # num_published_keys: int


# class PublishedApi(BaseSchema):
#     bot_id: str
#     user: PublishedApiUser
#     bot: PublishedApiBot
#     create_time: float
#     deployment_status: str
#     cfn_stack_link: str
#     api: PublishedApiApiGateway


# class PublishedApiMeta(BaseSchema): ...
