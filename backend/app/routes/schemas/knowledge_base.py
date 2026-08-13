from app.routes.schemas.base import BaseSchema


class KnowledgeBaseListItem(BaseSchema):
    """Knowledge Base list item for dropdown selection."""

    knowledge_base_id: str
    name: str
    description: str | None = None
    status: str


class ListKnowledgeBasesResponse(BaseSchema):
    """Response containing list of available knowledge bases."""

    knowledge_bases: list[KnowledgeBaseListItem]
