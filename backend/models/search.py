from pydantic import BaseModel
from typing import Optional


class TextSearchRequest(BaseModel):
    query: str
    limit: int = 10


class SearchResult(BaseModel):
    id: str
    title: str
    description: Optional[str]
    image_url: Optional[str]
    price: float
    category: str
    color: str
    similarity_score: float
    match_type: str  # "text", "image", "combined"
