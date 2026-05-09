from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ProductBase(BaseModel):
    title: str
    description: Optional[str] = None
    visual_description: Optional[str] = None
    price: float
    category: str
    sub_category: Optional[str] = None
    color: str
    gender: str
    season: Optional[str] = None
    usage_type: Optional[str] = None


class ProductCreate(ProductBase):
    is_corrupted: bool = False
    original_name: Optional[str] = None


class ProductResponse(ProductBase):
    id: str
    image_url: Optional[str] = None
    is_corrupted: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
