from abc import ABC, abstractmethod

from pydantic import BaseModel, Field


class Document(BaseModel):
    page_content: str
    metadata: dict = Field(default_factory=dict)


class BaseLoader(ABC):
    @abstractmethod
    def load(self) -> list[Document]:
        """Load data into Document objects."""
