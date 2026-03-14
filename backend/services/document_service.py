from datetime import datetime, timezone
from typing import Optional, List
import uuid
import logging

logger = logging.getLogger(__name__)

# In-memory document store (simulates MongoDB)
_documents = {}

# Legal subject categories
LEGAL_SUBJECTS = [
    "Direito Civil",
    "Direito Penal",
    "Direito Constitucional",
    "Direito Administrativo",
    "Direito do Trabalho",
    "Direito Tributário",
    "Direito Processual Civil",
    "Direito Processual Penal",
    "Direito Empresarial",
    "Direito Ambiental",
    "Direito do Consumidor",
    "Direito Internacional",
    "Direito Previdenciário",
]


class DocumentService:

    @staticmethod
    async def upload_document(title: str, author: str = "", year: int = None,
                              legal_subject: str = "", filename: str = "",
                              file_size: int = 0) -> dict:
        doc_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()

        document = {
            "id": doc_id,
            "title": title,
            "author": author,
            "year": year,
            "legal_subject": legal_subject,
            "filename": filename,
            "file_size": file_size,
            "status": "pending",
            "total_chunks": 0,
            "created_at": now,
            "updated_at": now,
        }

        _documents[doc_id] = document
        logger.info(f"Document uploaded: {title} (id={doc_id})")
        return document

    @staticmethod
    async def list_documents(status: Optional[str] = None) -> List[dict]:
        docs = list(_documents.values())
        if status:
            docs = [d for d in docs if d["status"] == status]
        return sorted(docs, key=lambda d: d["created_at"], reverse=True)

    @staticmethod
    async def get_document(doc_id: str) -> Optional[dict]:
        return _documents.get(doc_id)

    @staticmethod
    async def update_document(doc_id: str, updates: dict) -> Optional[dict]:
        if doc_id not in _documents:
            return None
        doc = _documents[doc_id]
        for key, value in updates.items():
            if value is not None and key in doc:
                doc[key] = value
        doc["updated_at"] = datetime.now(timezone.utc).isoformat()
        return doc

    @staticmethod
    async def delete_document(doc_id: str) -> bool:
        if doc_id in _documents:
            del _documents[doc_id]
            return True
        return False

    @staticmethod
    async def start_indexing(doc_id: str) -> Optional[dict]:
        if doc_id not in _documents:
            return None
        doc = _documents[doc_id]
        doc["status"] = "indexing"
        doc["updated_at"] = datetime.now(timezone.utc).isoformat()
        # Simulate indexing completing immediately with mock chunks
        import random
        doc["status"] = "indexed"
        doc["total_chunks"] = random.randint(50, 500)
        doc["updated_at"] = datetime.now(timezone.utc).isoformat()
        logger.info(f"Document indexed: {doc['title']} ({doc['total_chunks']} chunks)")
        return doc

    @staticmethod
    async def get_stats() -> dict:
        docs = list(_documents.values())
        return {
            "total_documents": len(docs),
            "total_chunks": sum(d.get("total_chunks", 0) for d in docs),
            "indexed_documents": len([d for d in docs if d["status"] == "indexed"]),
            "pending_documents": len([d for d in docs if d["status"] == "pending"]),
        }

    @staticmethod
    def get_legal_subjects() -> List[str]:
        return LEGAL_SUBJECTS
