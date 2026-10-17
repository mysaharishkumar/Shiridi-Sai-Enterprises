from fastapi import APIRouter, Depends
from bson import ObjectId
from app.api.deps import get_db, get_current_admin
from app.schemas.order import OrderStatus, PaymentStatus

router = APIRouter(prefix="/admin/reports", tags=["Admin Reports"])

@router.get("/overview")
async def get_admin_dashboard_kpis(
    admin: dict = Depends(get_current_admin),
    db = Depends(get_db)
):
    total_products = await db.products.count_documents({"is_archived": False})
    total_categories = await db.categories.count_documents({})
    total_customers = await db.users.count_documents({"role": "customer"})
    
    total_orders = await db.orders.count_documents({})
    pending_orders = await db.orders.count_documents({"order_status": OrderStatus.PLACED})
    processing_orders = await db.orders.count_documents({"order_status": {"$in": [OrderStatus.CONFIRMED, OrderStatus.PROCESSING, OrderStatus.SHIPPED]}})
    delivered_orders = await db.orders.count_documents({"order_status": OrderStatus.DELIVERED})
    cancelled_orders = await db.orders.count_documents({"order_status": OrderStatus.CANCELLED})
    
    low_stock_products = await db.products.count_documents({"total_stock": {"$gt": 0, "$lte": 5}, "is_archived": False})
    out_of_stock_products = await db.products.count_documents({"total_stock": {"$lte": 0}, "is_archived": False})
    
    # Financial metrics: total order volume vs collected cash
    all_active_orders_pipeline = [
        {"$match": {"order_status": {"$ne": OrderStatus.CANCELLED}}},
        {"$group": {"_id": None, "total_value": {"$sum": "$final_total"}}}
    ]
    val_res = await db.orders.aggregate(all_active_orders_pipeline).to_list(length=1)
    total_order_value = val_res[0]["total_value"] if val_res else 0.0
    
    collected_cash_pipeline = [
        {"$match": {"payment_status": PaymentStatus.COLLECTED}},
        {"$group": {"_id": None, "collected_total": {"$sum": "$final_total"}}}
    ]
    cash_res = await db.orders.aggregate(collected_cash_pipeline).to_list(length=1)
    collected_revenue = cash_res[0]["collected_total"] if cash_res else 0.0

    # Recent 6 orders
    recent_orders_raw = await db.orders.find({}).sort("created_at", -1).limit(6).to_list(length=6)
    recent_orders = []
    for o in recent_orders_raw:
        recent_orders.append({
            "id": str(o["_id"]),
            "order_number": o.get("order_number"),
            "customer_name": o.get("customer_name"),
            "order_status": o.get("order_status"),
            "payment_status": o.get("payment_status"),
            "final_total": o.get("final_total"),
            "items_count": len(o.get("items", [])),
            "created_at": o.get("created_at")
        })
        
    # Low stock alert products (top 5)
    low_stock_cursor = db.products.find(
        {"total_stock": {"$lte": 5}, "is_archived": False},
        {"name": 1, "sku": 1, "total_stock": 1, "images": 1, "selling_price": 1}
    ).limit(5)
    low_stock_raw = await low_stock_cursor.to_list(length=5)
    low_stock_items = []
    for p in low_stock_raw:
        img = p.get("images", [{}])[0].get("url") if p.get("images") else None
        low_stock_items.append({
            "id": str(p["_id"]),
            "name": p.get("name"),
            "sku": p.get("sku"),
            "stock": p.get("total_stock"),
            "image": img,
            "price": p.get("selling_price")
        })
        
    # Recent audit logs (latest 6)
    recent_logs = await db.audit_logs.find({}).sort("created_at", -1).limit(6).to_list(length=6)
    for l in recent_logs:
        l["id"] = str(l["_id"])
        del l["_id"]

    return {
        "kpis": {
            "total_products": total_products,
            "total_categories": total_categories,
            "total_customers": total_customers,
            "total_orders": total_orders,
            "pending_orders": pending_orders,
            "processing_orders": processing_orders,
            "delivered_orders": delivered_orders,
            "cancelled_orders": cancelled_orders,
            "low_stock_count": low_stock_products,
            "out_of_stock_count": out_of_stock_products,
            "total_order_value": total_order_value,
            "collected_revenue": collected_revenue
        },
        "recent_orders": recent_orders,
        "low_stock_alerts": low_stock_items,
        "recent_activity": recent_logs
    }
