from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import Optional
from services.document_service import DocumentService

router = APIRouter(prefix="/documents", tags=["documents"])


@router.post("/upload")
async def upload_document(
    title: str = Form(...),
    author: str = Form(""),
    year: Optional[int] = Form(None),
    legal_subject: str = Form(""),
    file: UploadFile = File(None),
):
    filename = file.filename if file else ""
    file_size = 0
    if file:
        content = await file.read()
        file_size = len(content)

    document = await DocumentService.upload_document(
        title=title,
        author=author,
        year=year,
        legal_subject=legal_subject,
        filename=filename,
        file_size=file_size,
    )

    # Auto-start indexing
    indexed_doc = await DocumentService.start_indexing(document["id"])
    return {"success": True, "data": indexed_doc or document}


@router.get("")
async def list_documents(status: Optional[str] = None):
    documents = await DocumentService.list_documents(status=status)
    return {"success": True, "data": documents}


@router.get("/subjects")
async def get_legal_subjects():
    subjects = DocumentService.get_legal_subjects()
    return {"success": True, "data": subjects}


@router.get("/stats")
async def get_document_stats():
    stats = await DocumentService.get_stats()
    return {"success": True, "data": stats}


@router.get("/{doc_id}")
async def get_document(doc_id: str):
    document = await DocumentService.get_document(doc_id)
    if not document:
        raise HTTPException(status_code=404, detail="Documento não encontrado")
    return {"success": True, "data": document}


@router.put("/{doc_id}")
async def update_document(doc_id: str, updates: dict):
    document = await DocumentService.update_document(doc_id, updates)
    if not document:
        raise HTTPException(status_code=404, detail="Documento não encontrado")
    return {"success": True, "data": document}


@router.delete("/{doc_id}")
async def delete_document(doc_id: str):
    deleted = await DocumentService.delete_document(doc_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Documento não encontrado")
    return {"success": True, "message": "Documento removido com sucesso"}


@router.post("/{doc_id}/index")
async def index_document(doc_id: str):
    document = await DocumentService.start_indexing(doc_id)
    if not document:
        raise HTTPException(status_code=404, detail="Documento não encontrado")
    return {"success": True, "data": document}
