from datetime import datetime
from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from app.schemas.user import AddressBase

class OrderStatus(str, Enum):
    PLACED = "placed"
    CONFIRMED = "confirmed"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
    FAILED_DELIVERY = "failed_delivery"

class PaymentStatus(str, Enum):
    PENDING = "pending"
    COLLECTED = "collected"
    REFUNDED = "refunded"
    FAILED = "failed"

class OrderItemSnapshot(BaseModel):
    product_id: str
    variant_id: Optional[str] = None
    product_name: str
    product_slug: str
    color: Optional[str] = None
    sku: Optional[str] = None
    unit_price: float
    original_price: Optional[float] = None
    quantity: int
    item_total: float
    image_url: Optional[str] = None

class StatusHistoryEntry(BaseModel):
    status: OrderStatus
    timestamp: datetime
    updated_by: str = "system"
    note: Optional[str] = None

class OrderCreate(BaseModel):
    customer_name: str
    customer_email: str
    customer_phone: str
    shipping_address: AddressBase
    delivery_instructions: Optional[str] = None
    payment_method: str = "cod"  # Cash on Delivery default

class OrderStatusUpdate(BaseModel):
    order_status: OrderStatus
    payment_status: Optional[PaymentStatus] = None
    note: Optional[str] = None
    tracking_number: Optional[str] = None
    courier_partner: Optional[str] = None
    estimated_delivery_date: Optional[str] = None

class OrderCancelRequest(BaseModel):
    reason: str

class OrderResponse(BaseModel):
    id: str
    order_number: str
    user_id: Optional[str] = None
    customer_name: str
    customer_email: str
    customer_phone: str
    shipping_address: AddressBase
    delivery_instructions: Optional[str] = None
    items: List[OrderItemSnapshot]
    subtotal: float
    delivery_charge: float
    discount_amount: float = 0.0
    final_total: float
    payment_method: str = "cod"
    payment_status: PaymentStatus = PaymentStatus.PENDING
    order_status: OrderStatus = OrderStatus.PLACED
    status_history: List[StatusHistoryEntry] = []
    tracking_number: Optional[str] = None
    courier_partner: Optional[str] = None
    estimated_delivery_date: Optional[str] = None
    can_cancel: bool = True
    created_at: datetime
    updated_at: Optional[datetime] = None
