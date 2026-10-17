from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field

class CartItemAdd(BaseModel):
    product_id: str
    variant_id: Optional[str] = None
    quantity: int = Field(1, ge=1)
    color: Optional[str] = None

class CartItemUpdate(BaseModel):
    quantity: int = Field(..., ge=1)

class CartItemResponse(BaseModel):
    item_id: str
    product_id: str
    variant_id: Optional[str] = None
    product_name: str
    product_slug: str
    color: Optional[str] = None
    sku: Optional[str] = None
    unit_price: float
    quantity: int
    subtotal: float
    image_url: Optional[str] = None
    in_stock: bool = True
    available_stock: int = 10

class CartResponse(BaseModel):
    id: Optional[str] = None
    user_id: Optional[str] = None
    items: List[CartItemResponse] = []
    total_items: int = 0
    subtotal: float = 0.0
    delivery_charge: float = 0.0
    free_delivery_threshold: float = 15000.0
    free_delivery_remaining: float = 0.0
    discount: float = 0.0
    final_total: float = 0.0
    updated_at: Optional[datetime] = None
