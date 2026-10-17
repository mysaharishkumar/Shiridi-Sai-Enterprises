from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field

class SubcategoryBase(BaseModel):
    id: Optional[str] = None
    name: str
    slug: str
    description: Optional[str] = None
    image_url: Optional[str] = None

class CategoryBase(BaseModel):
    name: str
    slug: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    display_order: int = 0
    is_active: bool = True
    subcategories: List[SubcategoryBase] = []

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    display_order: Optional[int] = None
    is_active: Optional[bool] = None
    subcategories: Optional[List[SubcategoryBase]] = None

class CategoryResponse(CategoryBase):
    id: str
    product_count: int = 0
    created_at: datetime
    updated_at: Optional[datetime] = None
