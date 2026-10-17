import random
import string
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Header, Query, status
from bson import ObjectId
from app.api.deps import get_db, get_current_user_optional, get_current_user
from app.schemas.order import (
    OrderCreate, OrderResponse, OrderStatus, PaymentStatus, 
    OrderItemSnapshot, StatusHistoryEntry, OrderCancelRequest
)
from app.schemas.common import PaginatedResponse

router = APIRouter(prefix="/orders", tags=["Orders"])

def generate_order_number() -> str:
    year = datetime.now().year
    suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=5))
    return f"SSE-{year}-{suffix}"

def format_order(order: dict) -> OrderResponse:
    order_id = str(order.get("_id") or order.get("id"))
    data = dict(order)
    data["id"] = order_id
    if "_id" in data:
        del data["_id"]
    # Check if cancellable
    current_status = data.get("order_status", OrderStatus.PLACED)
    data["can_cancel"] = current_status in [OrderStatus.PLACED, OrderStatus.CONFIRMED]
    return OrderResponse(**data)

@router.post("", response_model=OrderResponse)
async def create_order(
    order_in: OrderCreate,
    x_cart_session_id: Optional[str] = Header(None),
    current_user: Optional[dict] = Depends(get_current_user_optional),
    db = Depends(get_db)
):
    # Fetch active cart
    cart_filter = {}
    if current_user:
        cart_filter = {"user_id": current_user["id"]}
    elif x_cart_session_id:
        cart_filter = {"session_id": x_cart_session_id}
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No active cart session provided")
        
    cart = await db.carts.find_one(cart_filter)
    if not cart or not cart.get("items"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cart is empty")
        
    # Revalidate all items and calculate totals strictly on server
    settings_doc = await db.site_settings.find_one({}) or {}
    standard_fee = settings_doc.get("standard_delivery_fee", 499.0)
    free_threshold = settings_doc.get("free_delivery_threshold", 15000.0)
    
    order_items: List[dict] = []
    subtotal = 0.0
    
    for item in cart.get("items", []):
        prod_id = item.get("product_id")
        try:
            prod = await db.products.find_one({"_id": ObjectId(prod_id)})
        except Exception:
            prod = await db.products.find_one({"_id": prod_id})
            
        if not prod or not prod.get("is_published", True) or prod.get("is_archived", False):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail=f"Product {item.get('product_id')} is no longer available"
            )
            
        unit_price = prod.get("selling_price", 0.0)
        original_price = prod.get("original_price")
        available_stock = prod.get("total_stock", 0)
        sku = prod.get("sku")
        image_url = prod.get("images", [{}])[0].get("url") if prod.get("images") else None
        
        variant_id = item.get("variant_id")
        if variant_id:
            for v in prod.get("variants", []):
                if v.get("variant_id") == variant_id:
                    if v.get("price_override"):
                        unit_price = v["price_override"]
                    if v.get("stock_quantity") is not None:
                        available_stock = v["stock_quantity"]
                    if v.get("sku"):
                        sku = v["sku"]
                    if v.get("image_url"):
                        image_url = v["image_url"]
                    break
                    
        qty = item.get("quantity", 1)
        if available_stock < qty:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for {prod.get('name')}. Only {available_stock} available."
            )
            
        item_total = unit_price * qty
        subtotal += item_total
        
        order_items.append({
            "product_id": str(prod["_id"]),
            "variant_id": variant_id,
            "product_name": prod.get("name"),
            "product_slug": prod.get("slug"),
            "color": item.get("color"),
            "sku": sku,
            "unit_price": unit_price,
            "original_price": original_price,
            "quantity": qty,
            "item_total": item_total,
            "image_url": image_url
        })
        
    delivery_charge = 0.0 if subtotal >= free_threshold else standard_fee
    final_total = subtotal + delivery_charge
    
    # Decrement stock atomically
    for it in order_items:
        prod_id = ObjectId(it["product_id"]) if ObjectId.is_valid(it["product_id"]) else it["product_id"]
        variant_id = it.get("variant_id")
        qty = it["quantity"]
        
        # Decrement product total stock
        await db.products.update_one(
            {"_id": prod_id},
            {"$inc": {"total_stock": -qty}}
        )
        # If variant, decrement variant stock
        if variant_id:
            await db.products.update_one(
                {"_id": prod_id, "variants.variant_id": variant_id},
                {"$inc": {"variants.$.stock_quantity": -qty}}
            )
            
    # Check if stock hit 0 and update in_stock flag
    await db.products.update_many(
        {"total_stock": {"$lte": 0}},
        {"$set": {"in_stock": False}}
    )

    now = datetime.now(timezone.utc)
    order_number = generate_order_number()
    
    initial_history = [{
        "status": OrderStatus.PLACED,
        "timestamp": now,
        "updated_by": "customer",
        "note": "Order placed successfully with Cash on Delivery (COD)"
    }]
    
    order_doc = {
        "order_number": order_number,
        "user_id": current_user["id"] if current_user else None,
        "customer_name": order_in.customer_name.strip(),
        "customer_email": order_in.customer_email.strip().lower(),
        "customer_phone": order_in.customer_phone.strip(),
        "shipping_address": order_in.shipping_address.model_dump(),
        "delivery_instructions": order_in.delivery_instructions.strip() if order_in.delivery_instructions else None,
        "items": order_items,
        "subtotal": subtotal,
        "delivery_charge": delivery_charge,
        "discount_amount": 0.0,
        "final_total": final_total,
        "payment_method": "cod",
        "payment_status": PaymentStatus.PENDING,
        "order_status": OrderStatus.PLACED,
        "status_history": initial_history,
        "tracking_number": None,
        "courier_partner": None,
        "estimated_delivery_date": None,
        "created_at": now,
        "updated_at": now
    }
    
    result = await db.orders.insert_one(order_doc)
    order_doc["_id"] = result.inserted_id
    
    # Clear the cart after placing order
    await db.carts.delete_one(cart_filter)
    
    return format_order(order_doc)

@router.get("/me", response_model=List[OrderResponse])
async def get_my_orders(
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    cursor = db.orders.find({"user_id": current_user["id"]}).sort("created_at", -1)
    orders = await cursor.to_list(length=100)
    return [format_order(o) for o in orders]

@router.get("/{order_identifier}", response_model=OrderResponse)
async def get_order_by_id_or_number(
    order_identifier: str,
    phone: Optional[str] = Query(None, description="Optional phone for tracking without login"),
    current_user: Optional[dict] = Depends(get_current_user_optional),
    db = Depends(get_db)
):
    query = {"$or": [{"order_number": order_identifier}]}
    try:
        query["$or"].append({"_id": ObjectId(order_identifier)})
    except Exception:
        query["$or"].append({"_id": order_identifier})
        
    order = await db.orders.find_one(query)
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
        
    # Security check: if customer is logged in, ensure it belongs to them or phone matches
    if current_user and current_user.get("role") == "customer":
        if order.get("user_id") and order.get("user_id") != current_user["id"] and order.get("customer_email") != current_user["email"]:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this order")
    elif not current_user:
        # If guest tracking, verify phone matches
        if phone:
            order_phone = order.get("customer_phone", "").replace(" ", "").replace("-", "")
            check_phone = phone.replace(" ", "").replace("-", "")
            if order_phone and check_phone not in order_phone and order_phone not in check_phone:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Phone verification does not match this order")
                
    return format_order(order)

@router.post("/{order_id}/cancel", response_model=OrderResponse)
async def cancel_order(
    order_id: str,
    cancel_req: OrderCancelRequest,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    query = {"user_id": current_user["id"], "$or": [{"order_number": order_id}]}
    try:
        query["$or"].append({"_id": ObjectId(order_id)})
    except Exception:
        pass
        
    order = await db.orders.find_one(query)
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
        
    if order.get("order_status") not in [OrderStatus.PLACED, OrderStatus.CONFIRMED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Order cannot be cancelled in status '{order.get('order_status')}'. Please contact customer support."
        )
        
    now = datetime.now(timezone.utc)
    new_entry = {
        "status": OrderStatus.CANCELLED,
        "timestamp": now,
        "updated_by": f"customer ({current_user.get('email')})",
        "note": f"Cancellation requested by customer: {cancel_req.reason}"
    }
    
    # Restore stock atomically
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
            "$set": {
                "order_status": OrderStatus.CANCELLED,
                "updated_at": now
            },
            "$push": {"status_history": new_entry}
        }
    )
    
    updated_order = await db.orders.find_one({"_id": order["_id"]})
    return format_order(updated_order)
