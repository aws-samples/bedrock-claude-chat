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
    content_type: Literal["text", "image"]
    media_type: Optional[str] = Field(
        None,
        description="MIME type of the image. Must be specified if `content_type` is `image`.",
    )
    body: str = Field(..., description="Content body. Text or base64 encoded image.")


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
    content: list[Content]
    model: Literal[
        "claude-instant-v1", "claude-v2", "claude-v3-sonnet", "claude-v3-haiku"
    ]
    parent_message_id: str | None


class MessageOutput(BaseSchema):
    role: str
    content: list[Content]
    # NOTE: "claude" will be deprecated (same as "claude-v2")
    model: Literal[
        "claude-instant-v1",
        "claude-v2",
        "claude",
        "claude-v3-sonnet",
        "claude-v3-haiku",
    ]
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


class User(BaseSchema):
    id: str
    name: str
