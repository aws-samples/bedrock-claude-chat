import sys
import unittest


sys.path.append(".")

from app.config import EMBEDDING_CONFIG
from app.repositories.models.custom_bot import (
    BotAliasModel,
    BotModel,
    EmbeddingParamsModel,
    KnowledgeModel,
)

def create_private_bot(id, is_pinned, owner_user_id):
    return BotModel(
        id=id,
        title="Test Bot",
        description="Test Bot Description",
        instruction="Test Bot Prompt",
        create_time=1627984879.9,
        last_used_time=1627984879.9,
        # Pinned
        is_pinned=is_pinned,
        public_bot_id=None,
        owner_user_id=owner_user_id,
        embedding_params=EmbeddingParamsModel(
            chunk_size=EMBEDDING_CONFIG["chunk_size"],
            chunk_overlap=EMBEDDING_CONFIG["chunk_overlap"],
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
    )


def create_public_bot(id, is_pinned, owner_user_id):
    return BotModel(
        id=id,
        title="Test Public Bot",
        description="Test Public Bot Description",
        instruction="Test Public Bot Prompt",
        create_time=1627984879.9,
        last_used_time=1627984879.9,
        is_pinned=is_pinned,
        public_bot_id=None,
        owner_user_id=owner_user_id,
        embedding_params=EmbeddingParamsModel(
            chunk_size=EMBEDDING_CONFIG["chunk_size"],
            chunk_overlap=EMBEDDING_CONFIG["chunk_overlap"],
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
    )


def create_bot_alias(id, original_bot_id, is_pinned):
    return BotAliasModel(
        id=id,
        # Different from original. Should be updated after `fetch_all_bots_by_user_id`
        title="Test Alias",
        description="Test Alias Description",
        original_bot_id=original_bot_id,
        last_used_time=1627984879.9,
        create_time=1627984879.9,
        is_pinned=is_pinned,
        sync_status="RUNNING",
        has_knowledge=True,
    )

if __name__ == "__main__":
    unittest.main()