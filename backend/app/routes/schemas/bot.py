from typing import Literal

from app.routes.schemas.base import BaseSchema
from pydantic import Field

# Knowledge sync status type
# NOTE: `ORIGINAL_NOT_FOUND` is used when the original bot is removed.
type_sync_status = Literal[
    "QUEUED", "RUNNING", "SUCCEEDED", "FAILED", "ORIGINAL_NOT_FOUND"
]


class EmbeddingParams(BaseSchema):
    chunk_size: int
    chunk_overlap: int


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


class BotInput(BaseSchema):
    id: str
    title: str
    instruction: str
    description: str | None
    embedding_params: EmbeddingParams | None
    knowledge: Knowledge | None


class BotModifyInput(BaseSchema):
    title: str
    instruction: str
    description: str | None
    embedding_params: EmbeddingParams | None
    knowledge: KnowledgeDiffInput | None


class BotModifyOutput(BaseSchema):
    id: str
    title: str
    instruction: str
    description: str
    embedding_params: EmbeddingParams
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
    embedding_params: EmbeddingParams
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
