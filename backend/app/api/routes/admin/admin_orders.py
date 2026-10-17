import re
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from bson import ObjectId
from app.api.deps import get_db, check_admin_roles, record_audit_log
from app.schemas.order import OrderResponse, OrderStatusUpdate, OrderStatus, PaymentStatus
from app.schemas.common import PaginatedResponse

router = APIRouter(prefix="/admin/orders", tags=["Admin Orders"])

def format_order(order: dict) -> OrderResponse:
    order_id = str(order.get("_id") or order.get("id"))
    data = dict(order)
    data["id"] = order_id
    if "_id" in data:
        del data["_id"]
    current_status = data.get("order_status", OrderStatus.PLACED)
    data["can_cancel"] = current_status in [OrderStatus.PLACED, OrderStatus.CONFIRMED]
    return OrderResponse(**data)

@router.get("", response_model=PaginatedResponse[OrderResponse])
async def list_admin_orders(
    search: Optional[str] = Query(None, description="Search by order number, customer name, phone, email"),
    order_status: Optional[str] = Query(None),
    payment_status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(15, ge=1, le=100),
    admin: dict = Depends(check_admin_roles(["admin", "super_admin", "order_manager"])),
    db = Depends(get_db)
):
    query = {}
    if order_status and order_status != "all":
        query["order_status"] = order_status
    if payment_status and payment_status != "all":
        query["payment_status"] = payment_status
        
    if search and search.strip():
        term = search.strip()
        regex_pattern = {"$regex": re.escape(term), "$options": "i"}
        query["$or"] = [
            {"order_number": regex_pattern},
            {"customer_name": regex_pattern},
            {"customer_email": regex_pattern},
            {"customer_phone": regex_pattern},
            {"shipping_address.city": regex_pattern},
            {"shipping_address.pincode": regex_pattern}
        ]
        
    total = await db.orders.count_documents(query)
    skip = (page - 1) * limit
    cursor = db.orders.find(query).sort("created_at", -1).skip(skip).limit(limit)
    raw = await cursor.to_list(length=limit)
    
    return PaginatedResponse[OrderResponse](
        items=[format_order(o) for o in raw],
        total=total,
        page=page,
        limit=limit,
        total_pages=(total + limit - 1) // limit if total > 0 else 1
    )

@router.get("/{order_id}", response_model=OrderResponse)
async def get_admin_order(
    order_id: str,
    admin: dict = Depends(check_admin_roles(["admin", "super_admin", "order_manager"])),
    db = Depends(get_db)
):
    try:
        oid = ObjectId(order_id)
    except Exception:
        oid = order_id
    order = await db.orders.find_one({"$or": [{"_id": oid}, {"order_number": order_id}]})
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    return format_order(order)

@router.patch("/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
    order_id: str,
    update_in: OrderStatusUpdate,
    request: Request,
    admin: dict = Depends(check_admin_roles(["admin", "super_admin", "order_manager"])),
    db = Depends(get_db)
):
    try:
        oid = ObjectId(order_id)
    except Exception:
        oid = order_id
    order = await db.orders.find_one({"$or": [{"_id": oid}, {"order_number": order_id}]})
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
        
    now = datetime.now(timezone.utc)
    admin_identifier = f"{admin.get('name', 'Admin')} ({admin.get('email')})"
    
    history_entry = {
        "status": update_in.order_status,
        "timestamp": now,
        "updated_by": admin_identifier,
        "note": update_in.note or f"Status transitioned to {update_in.order_status.value}"
    }
    
    set_fields = {
        "order_status": update_in.order_status,
        "updated_at": now
    }
    
    # If order is marked delivered and payment method is COD, automatically mark payment collected if not specified
    if update_in.order_status == OrderStatus.DELIVERED:
        if not update_in.payment_status and order.get("payment_method") == "cod":
            set_fields["payment_status"] = PaymentStatus.COLLECTED
            
    if update_in.payment_status:
        set_fields["payment_status"] = update_in.payment_status
        
    if update_in.tracking_number:
        set_fields["tracking_number"] = update_in.tracking_number.strip()
    if update_in.courier_partner:
        set_fields["courier_partner"] = update_in.courier_partner.strip()
    if update_in.estimated_delivery_date:
        set_fields["estimated_delivery_date"] = update_in.estimated_delivery_date.strip()
        
    # If transitioning to CANCELLED and was not previously cancelled, restore stock
    if update_in.order_status == OrderStatus.CANCELLED and order.get("order_status") != OrderStatus.CANCELLED:
        for it in order.get("items", []):
            try:
                prod_id = ObjectId(it["product_id"]) if ObjectId.is_valid(it["product_id"]) else it["product_id"]
                variant_id = it.get("variant_id")
                qty = it["quantity"]
                await db.products.update_one(
                    {"_id": prod_id},
                    {"$inc": {"total_stock": qty}, "$set": {"in_stock": True}}
                )
                if variant_id:
                    await db.products.update_one(
                        {"_id": prod_id, "variants.variant_id": variant_id},
                        {"$inc": {"variants.$.stock_quantity": qty}}
                    )
            except Exception:
                pass
                
    await db.orders.update_one(
        {"_id": order["_id"]},
        {
            "$set": set_fields,
            "$push": {"status_history": history_entry}
        }
    )
    
    await record_audit_log(
        db, admin, "update_order_status", "order", str(order["_id"]),
        f"Order {order.get('order_number')} status updated to {update_in.order_status.value}. Note: {update_in.note or 'N/A'}",
        request
    )
    
    updated_order = await db.orders.find_one({"_id": order["_id"]})
    return format_order(updated_order)
