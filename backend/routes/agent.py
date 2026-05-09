from fastapi import APIRouter
from models.agent import ChatRequest, ChatResponse
from services.agent_service import chat

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def agent_chat(request: ChatRequest):
    result = await chat(
        message=request.message,
        session_id=request.session_id,
        product_id=request.product_id,
    )
    return ChatResponse(
        reply=result["reply"],
        session_id=result["session_id"],
    )
