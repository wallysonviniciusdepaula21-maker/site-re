from fastapi import APIRouter, HTTPException
from models.chat import ChatRequest
from services.chat_service import ChatService

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("")
async def ask_question(request: ChatRequest):
    try:
        result = await ChatService.ask_question(
            question=request.question,
            max_sources=request.max_sources
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
