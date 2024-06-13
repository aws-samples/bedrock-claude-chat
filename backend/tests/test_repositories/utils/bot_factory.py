import sys
import unittest

sys.path.append(".")

from app.config import DEFAULT_EMBEDDING_CONFIG
from app.repositories.models.custom_bot import (
    AgentModel,
    AgentToolModel,
    BotAliasModel,
    BotModel,
    EmbeddingParamsModel,
    GenerationParamsModel,
    KnowledgeModel,
    SearchParamsModel,
    ConversationQuickStarterModel,
)
from app.routes.schemas.bot import type_sync_status


def create_test_private_bot(
    id,
    is_pinned: bool,
    owner_user_id: str,
    instruction: str = "Test Bot Prompt",
    sync_status: type_sync_status = "RUNNING",
    published_api_stack_name: str | None = None,
    published_api_datetime: int | None = None,
    published_api_codebuild_id: str | None = None,
    display_retrieved_chunks: bool = True,
    conversation_quick_starters: list[ConversationQuickStarterModel] | None = None,
):
    return BotModel(
        id=id,
        title="Test Bot",
        description="Test Bot Description",
        instruction=instruction,
        create_time=1627984879.9,
        last_used_time=1627984879.9,
        is_pinned=is_pinned,
        public_bot_id=None,
        owner_user_id=owner_user_id,
        embedding_params=EmbeddingParamsModel(
            chunk_size=DEFAULT_EMBEDDING_CONFIG["chunk_size"],
            chunk_overlap=DEFAULT_EMBEDDING_CONFIG["chunk_overlap"],
            enable_partition_pdf=DEFAULT_EMBEDDING_CONFIG["enable_partition_pdf"],
        ),
        generation_params=GenerationParamsModel(
            max_tokens=2000,
            top_k=250,
            top_p=0.999,
            temperature=0.6,
            stop_sequences=["Human: ", "Assistant: "],
        ),
        search_params=SearchParamsModel(
            max_results=20,
        ),
        agent=AgentModel(
            tools=[
                AgentToolModel(name="tool1", description="tool1 description"),
                AgentToolModel(name="tool2", description="tool2 description"),
            ]
        ),
        knowledge=KnowledgeModel(
            source_urls=["https://aws.amazon.com/"],
            sitemap_urls=["https://aws.amazon.sitemap.xml"],
            filenames=["test.txt"],
        ),
        sync_status=sync_status,
        sync_status_reason="reason",
        sync_last_exec_id="",
        published_api_stack_name=published_api_stack_name,
        published_api_datetime=published_api_datetime,
        published_api_codebuild_id=published_api_codebuild_id,
        display_retrieved_chunks=display_retrieved_chunks,
        conversation_quick_starters=(
            [] if conversation_quick_starters is None else conversation_quick_starters
        ),
    )


def create_test_public_bot(
    id,
    is_pinned,
    owner_user_id,
    public_bot_id=None,
    instruction="Test Public Bot Prompt",
):
    return BotModel(
        id=id,
        title="Test Public Bot",
        description="Test Public Bot Description",
        instruction=instruction,
        create_time=1627984879.9,
        last_used_time=1627984879.9,
        is_pinned=is_pinned,
        public_bot_id=public_bot_id,
        owner_user_id=owner_user_id,
        embedding_params=EmbeddingParamsModel(
            chunk_size=DEFAULT_EMBEDDING_CONFIG["chunk_size"],
            chunk_overlap=DEFAULT_EMBEDDING_CONFIG["chunk_overlap"],
            enable_partition_pdf=DEFAULT_EMBEDDING_CONFIG["enable_partition_pdf"],
        ),
        generation_params=GenerationParamsModel(
            max_tokens=2000,
            top_k=250,
            top_p=0.999,
            temperature=0.6,
            stop_sequences=["Human: ", "Assistant: "],
        ),
        search_params=SearchParamsModel(
            max_results=20,
        ),
        agent=AgentModel(
            tools=[
                AgentToolModel(name="tool1", description="tool1 description"),
                AgentToolModel(name="tool2", description="tool2 description"),
            ]
        ),
        knowledge=KnowledgeModel(
            source_urls=["https://aws.amazon.com/"],
            sitemap_urls=["https://aws.amazon.sitemap.xml"],
            filenames=["test.txt"],
        ),
        sync_status="RUNNING",
        sync_status_reason="reason",
        sync_last_exec_id="",
        published_api_stack_name=None,
        published_api_datetime=None,
        published_api_codebuild_id=None,
        display_retrieved_chunks=True,
    )
