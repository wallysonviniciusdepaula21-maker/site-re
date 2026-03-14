from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone
import uuid


class Document(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    author: str = ""
    year: Optional[int] = None
    legal_subject: str = ""
    filename: str = ""
    file_size: int = 0
    status: str = "pending"  # pending, indexing, indexed, error
    total_chunks: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class DocumentCreate(BaseModel):
    title: str
    author: str = ""
    year: Optional[int] = None
    legal_subject: str = ""


class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    author: Optional[str] = None
    year: Optional[int] = None
    legal_subject: Optional[str] = None
