from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone
import uuid


class ChatSource(BaseModel):
    title: str
    author: str = ""
    page: Optional[int] = None
    chunk_text: str = ""
    relevance_score: float = 0.0


class ChatMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    question: str
    answer: str = ""
    sources: List[ChatSource] = []
    processing_time: float = 0.0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ChatRequest(BaseModel):
    question: str
    max_sources: int = 5


class ChatStats(BaseModel):
    total_documents: int = 0
    total_chunks: int = 0
    indexed_documents: int = 0
    pending_documents: int = 0
