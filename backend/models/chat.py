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
    conversation_id: Optional[str] = None


class ChatStats(BaseModel):
    total_documents: int = 0
    total_chunks: int = 0
    indexed_documents: int = 0
    pending_documents: int = 0


class Conversation(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str = ""
    messages: List[ChatMessage] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ConversationListItem(BaseModel):
    id: str
    title: str
    message_count: int = 0
    last_message_preview: str = ""
    created_at: datetime
    updated_at: datetime


class ConversationCreateRequest(BaseModel):
    title: Optional[str] = None


class ConversationTitleUpdate(BaseModel):
    title: str
