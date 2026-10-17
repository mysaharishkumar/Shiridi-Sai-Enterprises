from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Header, status
from bson import ObjectId
from app.api.deps import get_db, get_current_user_optional
from app.schemas.cart import CartItemAdd, CartItemUpdate, CartResponse, CartItemResponse

router = APIRouter(prefix="/cart", tags=["Cart"])

async def get_cart_filter(current_user: Optional[dict], session_id: Optional[str]) -> dict:
    if current_user:
        return {"user_id": current_user["id"]}
    if session_id:
        return {"session_id": session_id}
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cart session identifier required")

async def build_cart_response(cart_doc: dict, db) -> CartResponse:
    raw_items = cart_doc.get("items", [])
    
    # Load settings for delivery fee calculation
    settings_doc = await db.site_settings.find_one({}) or {}
    standard_fee = settings_doc.get("standard_delivery_fee", 499.0)
    free_threshold = settings_doc.get("free_delivery_threshold", 15000.0)
    
    calculated_items: list[CartItemResponse] = []
    subtotal = 0.0
    
    for item in raw_items:
        prod_id = item.get("product_id")
        try:
            prod = await db.products.find_one({"_id": ObjectId(prod_id)})
        except Exception:
            prod = await db.products.find_one({"_id": prod_id})
            
        if not prod or not prod.get("is_published", True) or prod.get("is_archived", False):
            continue
            
        # Determine actual price and stock
        unit_price = prod.get("selling_price", 0.0)
        available_stock = prod.get("total_stock", 0)
        sku = prod.get("sku")
        image_url = prod.get("images", [{}])[0].get("url") if prod.get("images") else None
        
        variant_id = item.get("variant_id")
        if variant_id:
            variants = prod.get("variants", [])
            for v in variants:
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
                    
        in_stock = available_stock > 0 and prod.get("in_stock", True)
        qty = min(item.get("quantity", 1), max(available_stock, 1)) if in_stock else item.get("quantity", 1)
        item_subtotal = unit_price * qty
        subtotal += item_subtotal
        
        calculated_items.append(CartItemResponse(
            item_id=item.get("item_id", f"{prod_id}_{variant_id or 'base'}"),
            product_id=str(prod["_id"]),
            variant_id=variant_id,
            product_name=prod.get("name", "Furniture Item"),
            product_slug=prod.get("slug", ""),
            color=item.get("color"),
            sku=sku,
            unit_price=unit_price,
            quantity=qty,
            subtotal=item_subtotal,
            image_url=image_url,
            in_stock=in_stock,
            available_stock=available_stock
        ))
        
    delivery_charge = 0.0 if (subtotal >= free_threshold or len(calculated_items) == 0) else standard_fee
    remaining_for_free = max(0.0, free_threshold - subtotal) if subtotal < free_threshold else 0.0
    final_total = subtotal + delivery_charge
    
    return CartResponse(
        id=str(cart_doc.get("_id") or ""),
        user_id=cart_doc.get("user_id"),
        items=calculated_items,
        total_items=sum(it.quantity for it in calculated_items),
        subtotal=subtotal,
        delivery_charge=delivery_charge,
        free_delivery_threshold=free_threshold,
        free_delivery_remaining=remaining_for_free,
        discount=0.0,
        final_total=final_total,
        updated_at=cart_doc.get("updated_at")
    )

@router.get("", response_model=CartResponse)
async def get_cart(
    x_cart_session_id: Optional[str] = Header(None),
    current_user: Optional[dict] = Depends(get_current_user_optional),
    db = Depends(get_db)
):
    cart_filter = await get_cart_filter(current_user, x_cart_session_id)
    cart = await db.carts.find_one(cart_filter)
    if not cart:
        return CartResponse()
    return await build_cart_response(cart, db)

@router.post("/items", response_model=CartResponse)
async def add_item_to_cart(
    item_in: CartItemAdd,
    x_cart_session_id: Optional[str] = Header(None),
    current_user: Optional[dict] = Depends(get_current_user_optional),
    db = Depends(get_db)
):
    cart_filter = await get_cart_filter(current_user, x_cart_session_id)
    
    # Verify product exists
    try:
        prod = await db.products.find_one({"_id": ObjectId(item_in.product_id)})
    except Exception:
        prod = await db.products.find_one({"_id": item_in.product_id})
        
    if not prod or not prod.get("is_published", True) or prod.get("is_archived", False):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not available")
        
    # Check variant stock
    max_stock = prod.get("total_stock", 0)
    if item_in.variant_id:
        for v in prod.get("variants", []):
            if v.get("variant_id") == item_in.variant_id:
                max_stock = v.get("stock_quantity", max_stock)
                break
                
    if max_stock <= 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Selected item is currently out of stock")
        
    cart = await db.carts.find_one(cart_filter)
    now = datetime.now(timezone.utc)
    item_id = f"{item_in.product_id}_{item_in.variant_id or 'base'}"
    
    if not cart:
        new_cart = {
            **cart_filter,
            "items": [{
                "item_id": item_id,
                "product_id": item_in.product_id,
                "variant_id": item_in.variant_id,
                "quantity": min(item_in.quantity, max_stock),
                "color": item_in.color
            }],
            "created_at": now,
            "updated_at": now
        }
        res = await db.carts.insert_one(new_cart)
        new_cart["_id"] = res.inserted_id
        return await build_cart_response(new_cart, db)
    else:
        items = cart.get("items", [])
        found = False
        for item in items:
            if item.get("item_id") == item_id:
                new_qty = item.get("quantity", 1) + item_in.quantity
                item["quantity"] = min(new_qty, max_stock)
                if item_in.color:
                    item["color"] = item_in.color
                found = True
                break
        if not found:
            items.append({
                "item_id": item_id,
                "product_id": item_in.product_id,
                "variant_id": item_in.variant_id,
                "quantity": min(item_in.quantity, max_stock),
                "color": item_in.color
            })
            
        await db.carts.update_one(
            {"_id": cart["_id"]},
            {"$set": {"items": items, "updated_at": now}}
        )
        updated_cart = await db.carts.find_one({"_id": cart["_id"]})
        return await build_cart_response(updated_cart, db)

@router.patch("/items/{item_id}", response_model=CartResponse)
async def update_cart_item(
    item_id: str,
    update_in: CartItemUpdate,
    x_cart_session_id: Optional[str] = Header(None),
    current_user: Optional[dict] = Depends(get_current_user_optional),
    db = Depends(get_db)
):
    cart_filter = await get_cart_filter(current_user, x_cart_session_id)
    cart = await db.carts.find_one(cart_filter)
    if not cart:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart not found")
        
    items = cart.get("items", [])
    updated = False
    for item in items:
        if item.get("item_id") == item_id:
            item["quantity"] = update_in.quantity
            updated = True
            break
            
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not in cart")
        
    now = datetime.now(timezone.utc)
    await db.carts.update_one(
        {"_id": cart["_id"]},
        {"$set": {"items": items, "updated_at": now}}
    )
    updated_cart = await db.carts.find_one({"_id": cart["_id"]})
    return await build_cart_response(updated_cart, db)

@router.delete("/items/{item_id}", response_model=CartResponse)
async def remove_cart_item(
    item_id: str,
    x_cart_session_id: Optional[str] = Header(None),
    current_user: Optional[dict] = Depends(get_current_user_optional),
    db = Depends(get_db)
):
    cart_filter = await get_cart_filter(current_user, x_cart_session_id)
    cart = await db.carts.find_one(cart_filter)
    if not cart:
        return CartResponse()
        
    items = [it for it in cart.get("items", []) if it.get("item_id") != item_id]
    now = datetime.now(timezone.utc)
    await db.carts.update_one(
        {"_id": cart["_id"]},
        {"$set": {"items": items, "updated_at": now}}
    )
    updated_cart = await db.carts.find_one({"_id": cart["_id"]})
    return await build_cart_response(updated_cart, db)

@router.delete("", response_model=CartResponse)
async def clear_cart(
    x_cart_session_id: Optional[str] = Header(None),
    current_user: Optional[dict] = Depends(get_current_user_optional),
    db = Depends(get_db)
):
    cart_filter = await get_cart_filter(current_user, x_cart_session_id)
    await db.carts.delete_one(cart_filter)
    return CartResponse()
