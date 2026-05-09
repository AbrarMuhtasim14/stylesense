from pydantic import BaseModel
from typing import Optional, List


class ChatRequest(BaseModel):
    message: str
    session_id: str = "default"
    product_id: Optional[str] = None  # context: which product user is viewing


class ChatResponse(BaseModel):
    reply: str
    session_id: str
    suggested_products: Optional[List[dict]] = None
