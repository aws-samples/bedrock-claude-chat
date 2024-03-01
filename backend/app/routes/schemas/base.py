from typing import Literal, Optional

from humps import camelize
from pydantic import BaseModel, Field


class BaseSchema(BaseModel):
    class Config:
        alias_generator = camelize
        populate_by_name = True
