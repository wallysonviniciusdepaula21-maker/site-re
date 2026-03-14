import time
import random
import logging
import uuid
from typing import List, Optional
from datetime import datetime, timezone
from services.document_service import DocumentService

logger = logging.getLogger(__name__)

# Pre-built legal knowledge base (mock RAG responses)
LEGAL_KNOWLEDGE = {
    "responsabilidade civil": {
        "answer": (
            "A responsabilidade civil é a obrigação de reparar o dano causado a outrem. "
            "No direito brasileiro, divide-se em:\n\n"
            "**Responsabilidade Civil Subjetiva** (art. 186, CC): Exige comprovação de culpa "
            "(negligência, imprudência ou imperícia) do agente causador do dano.\n\n"
            "**Responsabilidade Civil Objetiva** (art. 927, parágrafo único, CC): Independe de "
            "culpa, bastando a comprovação do dano e do nexo causal. Aplica-se quando a atividade "
            "normalmente desenvolvida pelo autor do dano implicar risco para os direitos de outrem.\n\n"
            "Segundo Carlos Roberto Gonçalves, 'a responsabilidade civil objetiva representa uma "
            "evolução do direito, adequando-se às necessidades da sociedade moderna.'\n\n"
            "Os elementos essenciais são: conduta (ação ou omissão), dano (material ou moral), "
            "nexo causal e, na subjetiva, a culpa."
        ),
        "sources": [
            {"title": "Direito Civil Brasileiro - Vol. 4", "author": "Carlos Roberto Gonçalves", "page": 45},
            {"title": "Curso de Direito Civil", "author": "Flávio Tartuce", "page": 312},
            {"title": "Responsabilidade Civil", "author": "Sérgio Cavalieri Filho", "page": 18},
        ]
    },
    "habeas corpus": {
        "answer": (
            "O **Habeas Corpus** é uma garantia constitucional prevista no art. 5º, LXVIII, "
            "da Constituição Federal de 1988, que estabelece:\n\n"
            "'Conceder-se-á habeas corpus sempre que alguém sofrer ou se achar ameaçado de "
            "sofrer violência ou coação em sua liberdade de locomoção, por ilegalidade ou "
            "abuso de poder.'\n\n"
            "**Modalidades:**\n"
            "- **Liberatório (repressivo):** quando a coação já se consumou\n"
            "- **Preventivo (salvo-conduto):** quando há ameaça de coação\n\n"
            "**Legitimidade:** Qualquer pessoa pode impetrar, não exigindo advogado. "
            "Pode ser impetrado em favor próprio ou de terceiro.\n\n"
            "**Competência:** Depende da autoridade coatora, podendo ser dirigido ao "
            "STF, STJ, TRFs, TJs ou juízes de primeiro grau."
        ),
        "sources": [
            {"title": "Curso de Direito Constitucional", "author": "Gilmar Mendes", "page": 587},
            {"title": "Direito Processual Penal", "author": "Aury Lopes Jr.", "page": 923},
        ]
    },
    "contrato": {
        "answer": (
            "O **contrato** é definido pelo Código Civil como o acordo de vontades entre "
            "duas ou mais partes para constituir, regular ou extinguir uma relação jurídica "
            "de natureza patrimonial.\n\n"
            "**Princípios fundamentais:**\n"
            "- **Autonomia da vontade:** Liberdade de contratar (art. 421, CC)\n"
            "- **Função social:** O contrato deve atender à sua função social (art. 421, CC)\n"
            "- **Boa-fé objetiva:** Probidade e boa-fé na execução (art. 422, CC)\n"
            "- **Pacta sunt servanda:** Força obrigatória dos contratos\n\n"
            "**Classificação:**\n"
            "- Unilaterais e bilaterais\n"
            "- Onerosos e gratuitos\n"
            "- Comutativo e aleatórios\n"
            "- Típicos e atípicos\n\n"
            "Conforme Orlando Gomes, 'o contrato é o negócio jurídico bilateral ou "
            "plurilateral que sujeita as partes à observância de conduta idônea à "
            "satisfação dos interesses que regularam.'"
        ),
        "sources": [
            {"title": "Contratos", "author": "Orlando Gomes", "page": 4},
            {"title": "Curso de Direito Civil - Vol. 3", "author": "Carlos Roberto Gonçalves", "page": 22},
            {"title": "Manual de Direito Civil", "author": "Flávio Tartuce", "page": 478},
        ]
    },
    "direito do consumidor": {
        "answer": (
            "O **Direito do Consumidor** é regulado pela Lei 8.078/1990 (Código de Defesa "
            "do Consumidor - CDC), que estabelece normas de proteção e defesa do consumidor.\n\n"
            "**Conceitos fundamentais:**\n"
            "- **Consumidor** (art. 2º): Toda pessoa física ou jurídica que adquire ou "
            "utiliza produto ou serviço como destinatário final\n"
            "- **Fornecedor** (art. 3º): Toda pessoa que desenvolve atividades de produção, "
            "montagem, criação, construção, transformação, importação, exportação, distribuição "
            "ou comercialização de produtos ou prestação de serviços\n\n"
            "**Direitos básicos (art. 6º):**\n"
            "- Proteção da vida, saúde e segurança\n"
            "- Informação adequada sobre produtos e serviços\n"
            "- Proteção contra publicidade enganosa\n"
            "- Inversão do ônus da prova\n"
            "- Acesso à justiça\n\n"
            "O CDC é considerado uma norma de ordem pública e interesse social."
        ),
        "sources": [
            {"title": "Manual de Direito do Consumidor", "author": "Rizzatto Nunes", "page": 67},
            {"title": "Código de Defesa do Consumidor Comentado", "author": "Claudia Lima Marques", "page": 102},
        ]
    },
}

# Default response for unmatched queries
DEFAULT_RESPONSE = {
    "answer": (
        "Com base no acervo jurídico disponível, não foi possível encontrar uma resposta "
        "suficientemente fundamentada para esta consulta específica.\n\n"
        "**Sugestões:**\n"
        "- Tente reformular a pergunta com termos jurídicos mais específicos\n"
        "- Indique a área do direito (civil, penal, constitucional, etc.)\n"
        "- Faça upload de documentos relacionados ao tema para enriquecer a base de conhecimento\n\n"
        "O sistema JuristaAI funciona melhor com perguntas sobre doutrina jurídica brasileira, "
        "como responsabilidade civil, contratos, direito constitucional, direito penal e "
        "direito do consumidor."
    ),
    "sources": []
}


class ChatService:
    _db = None

    @classmethod
    def set_db(cls, db):
        cls._db = db

    @staticmethod
    async def ask_question(question: str, max_sources: int = 5, conversation_id: str = None) -> dict:
        start_time = time.time()

        # Simple keyword matching to simulate RAG retrieval
        question_lower = question.lower()
        response_data = None

        for keyword, data in LEGAL_KNOWLEDGE.items():
            if keyword in question_lower:
                response_data = data
                break

        if response_data is None:
            response_data = DEFAULT_RESPONSE

        # Simulate processing time (1-3 seconds)
        simulated_delay = random.uniform(0.5, 2.0)
        import asyncio
        await asyncio.sleep(simulated_delay)

        processing_time = time.time() - start_time

        sources = response_data["sources"][:max_sources]
        formatted_sources = []
        for s in sources:
            formatted_sources.append({
                "title": s["title"],
                "author": s["author"],
                "page": s.get("page"),
                "chunk_text": f"Trecho extraído de '{s['title']}' por {s['author']}",
                "relevance_score": round(random.uniform(0.75, 0.98), 2),
            })

        result = {
            "question": question,
            "answer": response_data["answer"],
            "sources": formatted_sources,
            "processing_time": round(processing_time, 2),
        }

        # Save message to conversation if conversation_id provided
        if conversation_id and ChatService._db is not None:
            try:
                message = {
                    "id": str(uuid.uuid4()),
                    "question": question,
                    "answer": result["answer"],
                    "sources": formatted_sources,
                    "processing_time": result["processing_time"],
                    "created_at": datetime.now(timezone.utc).isoformat(),
                }
                await ChatService._db.conversations.update_one(
                    {"id": conversation_id},
                    {
                        "$push": {"messages": message},
                        "$set": {"updated_at": datetime.now(timezone.utc).isoformat()},
                    }
                )
                result["conversation_id"] = conversation_id
            except Exception as e:
                logger.error(f"Failed to save message to conversation: {e}")

        logger.info(f"Chat query processed in {processing_time:.2f}s: {question[:50]}...")
        return result

    @staticmethod
    async def create_conversation(title: str = None) -> dict:
        conv_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        conversation = {
            "id": conv_id,
            "title": title or "Nova conversa",
            "messages": [],
            "created_at": now,
            "updated_at": now,
        }
        if ChatService._db is not None:
            await ChatService._db.conversations.insert_one(conversation)
        return {"id": conv_id, "title": conversation["title"], "created_at": now, "updated_at": now}

    @staticmethod
    async def list_conversations() -> list:
        if ChatService._db is None:
            return []
        cursor = ChatService._db.conversations.find(
            {}, {"_id": 0, "id": 1, "title": 1, "messages": {"$slice": -1}, "created_at": 1, "updated_at": 1}
        ).sort("updated_at", -1).limit(50)
        conversations = await cursor.to_list(50)
        result = []
        for conv in conversations:
            msgs = conv.get("messages", [])
            msg_count_doc = await ChatService._db.conversations.find_one(
                {"id": conv["id"]}, {"_id": 0, "messages": 1}
            )
            msg_count = len(msg_count_doc.get("messages", [])) if msg_count_doc else 0
            last_preview = ""
            if msgs:
                last_preview = msgs[-1].get("question", "")[:80]
            result.append({
                "id": conv["id"],
                "title": conv.get("title", ""),
                "message_count": msg_count,
                "last_message_preview": last_preview,
                "created_at": conv.get("created_at", ""),
                "updated_at": conv.get("updated_at", ""),
            })
        return result

    @staticmethod
    async def get_conversation(conversation_id: str) -> dict:
        if ChatService._db is None:
            return None
        conv = await ChatService._db.conversations.find_one(
            {"id": conversation_id}, {"_id": 0}
        )
        return conv

    @staticmethod
    async def delete_conversation(conversation_id: str) -> bool:
        if ChatService._db is None:
            return False
        result = await ChatService._db.conversations.delete_one({"id": conversation_id})
        return result.deleted_count > 0

    @staticmethod
    async def update_conversation_title(conversation_id: str, title: str) -> bool:
        if ChatService._db is None:
            return False
        result = await ChatService._db.conversations.update_one(
            {"id": conversation_id},
            {"$set": {"title": title, "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
        return result.modified_count > 0

    @staticmethod
    async def get_stats() -> dict:
        doc_stats = await DocumentService.get_stats()
        return {
            "total_documents": doc_stats["total_documents"],
            "total_chunks": doc_stats["total_chunks"],
            "indexed_documents": doc_stats["indexed_documents"],
            "pending_documents": doc_stats["pending_documents"],
        }
