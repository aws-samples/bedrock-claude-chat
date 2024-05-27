from app.routes.schemas.bot import type_sync_status
from pydantic import BaseModel
from app.repositories.models.common import Float


class EmbeddingParamsModel(BaseModel):
    chunk_size: int
    chunk_overlap: int
    enable_partition_pdf: bool


class KnowledgeModel(BaseModel):
    source_urls: list[str]
    sitemap_urls: list[str]
    filenames: list[str]


class GenerationParamsModel(BaseModel):
    max_tokens: int
    top_k: int
    top_p: Float
    temperature: Float
    stop_sequences: list[str]


class SearchParamsModel(BaseModel):
    max_results: int


class BotModel(BaseModel):
    id: str
    title: str
    description: str
    instruction: str
    create_time: float
    last_used_time: float
    # This can be used as the bot is public or not. Also used for GSI PK
    public_bot_id: str | None
    owner_user_id: str
    is_pinned: bool
    embedding_params: EmbeddingParamsModel
    generation_params: GenerationParamsModel
    search_params: SearchParamsModel
    knowledge: KnowledgeModel
    sync_status: type_sync_status
    sync_status_reason: str
    sync_last_exec_id: str
    published_api_stack_name: str | None
    published_api_datetime: int | None
    published_api_codebuild_id: str | None
    display_retrieved_chunks: bool

    def has_knowledge(self) -> bool:
        return (
            len(self.knowledge.source_urls) > 0
            or len(self.knowledge.sitemap_urls) > 0
            or len(self.knowledge.filenames) > 0
        )


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


class BotMetaWithStackInfo(BotMeta):
    owner_user_id: str
    published_api_stack_name: str | None
    published_api_datetime: int | None
