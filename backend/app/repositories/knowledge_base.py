import logging
from typing import List

from app.utils import get_bedrock_agent_client
from app.repositories.models.custom_bot_kb import (
    BedrockAgentGetKnowledgeBaseResponse,
    KnowledgeBase,
    KnowledgeBaseConfiguration,
)
from app.routes.schemas.knowledge_base import KnowledgeBaseListItem

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)


def get_knowledge_base_info(
    knowledge_base_id: str | None,
) -> BedrockAgentGetKnowledgeBaseResponse:
    client = get_bedrock_agent_client()
    try:
        response = client.get_knowledge_base(knowledgeBaseId=knowledge_base_id)
        return BedrockAgentGetKnowledgeBaseResponse(
            knowledge_base=KnowledgeBase(
                knowledge_base_configuration=KnowledgeBaseConfiguration(
                    type=response.get("knowledgeBase", {})
                    .get("knowledgeBaseConfiguration", {})
                    .get("type", "VECTOR")
                )
            )
        )
    except Exception as e:
        logger.error(f"Failed to get knowledge base info: {e}")
        return BedrockAgentGetKnowledgeBaseResponse(
            knowledge_base=KnowledgeBase(
                knowledge_base_configuration=KnowledgeBaseConfiguration(type="VECTOR")
            )
        )


def list_knowledge_bases() -> List[KnowledgeBaseListItem]:
    """List all available knowledge bases in the account."""
    client = get_bedrock_agent_client()
    knowledge_bases: List[KnowledgeBaseListItem] = []

    try:
        paginator = client.get_paginator("list_knowledge_bases")
        page_iterator = paginator.paginate()

        for page in page_iterator:
            for kb in page.get("knowledgeBaseSummaries", []):
                kb_id = kb.get("knowledgeBaseId")
                kb_name = kb.get("name", kb_id)  # Fallback to ID if name is missing
                logger.debug(f"Found knowledge base: ID={kb_id}, Name={kb_name}")
                knowledge_bases.append(
                    KnowledgeBaseListItem(
                        knowledge_base_id=kb_id,
                        name=kb_name,
                        description=kb.get("description", ""),
                        status=kb.get("status", "UNKNOWN"),
                    )
                )

        logger.info(f"Found {len(knowledge_bases)} knowledge bases")
        return knowledge_bases

    except Exception as e:
        logger.error(f"Failed to list knowledge bases: {e}")
        return []
