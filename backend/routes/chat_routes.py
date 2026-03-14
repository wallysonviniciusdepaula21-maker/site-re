from fastapi import APIRouter, HTTPException
from models.chat import ChatRequest, ConversationCreateRequest, ConversationTitleUpdate
from services.chat_service import ChatService

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("")
async def ask_question(request: ChatRequest):
    try:
        result = await ChatService.ask_question(
            question=request.question,
            max_sources=request.max_sources,
            conversation_id=request.conversation_id,
        )
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats")
async def get_stats():
    try:
        stats = await ChatService.get_stats()
        return {"success": True, "data": stats}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/conversations")
async def create_conversation(request: ConversationCreateRequest = None):
    try:
        title = request.title if request else None
        conv = await ChatService.create_conversation(title=title)
        return {"success": True, "data": conv}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/conversations")
async def list_conversations():
    try:
        conversations = await ChatService.list_conversations()
        return {"success": True, "data": conversations}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/conversations/{conversation_id}")
async def get_conversation(conversation_id: str):
    try:
        conv = await ChatService.get_conversation(conversation_id)
        if conv is None:
            raise HTTPException(status_code=404, detail="Conversa não encontrada")
        return {"success": True, "data": conv}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/conversations/{conversation_id}")
async def delete_conversation(conversation_id: str):
    try:
        deleted = await ChatService.delete_conversation(conversation_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Conversa não encontrada")
        return {"success": True, "message": "Conversa removida"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/conversations/{conversation_id}/title")
async def update_conversation_title(conversation_id: str, request: ConversationTitleUpdate):
    try:
        updated = await ChatService.update_conversation_title(conversation_id, request.title)
        if not updated:
            raise HTTPException(status_code=404, detail="Conversa não encontrada")
        return {"success": True, "message": "Título atualizado"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
