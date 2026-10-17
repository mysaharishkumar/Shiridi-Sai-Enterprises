import re
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from bson import ObjectId
from app.api.deps import get_db, check_admin_roles, record_audit_log
from app.schemas.user import UserResponse, UserAdminUpdate
from app.schemas.common import PaginatedResponse

router = APIRouter(prefix="/admin/users", tags=["Admin Users"])

def format_user(user: dict) -> UserResponse:
    user_id = str(user.get("_id") or user.get("id"))
    return UserResponse(
        id=user_id,
        name=user["name"],
        email=user["email"],
        phone=user.get("phone"),
        role=user.get("role", "customer"),
        is_active=user.get("is_active", True),
        addresses=user.get("addresses", []),
        created_at=user.get("created_at", datetime.now(timezone.utc)),
        updated_at=user.get("updated_at")
    )

@router.get("")
async def list_admin_users(
    search: Optional[str] = Query(None),
    role: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    admin: dict = Depends(check_admin_roles(["admin", "super_admin"])),
    db = Depends(get_db)
):
    query = {}
    if role and role != "all":
        query["role"] = role
        
    if search and search.strip():
        term = search.strip()
        regex_pattern = {"$regex": re.escape(term), "$options": "i"}
        query["$or"] = [
            {"name": regex_pattern},
            {"email": regex_pattern},
            {"phone": regex_pattern}
        ]
        
    total = await db.users.count_documents(query)
    skip = (page - 1) * limit
    cursor = db.users.find(query, {"hashed_password": 0}).sort("created_at", -1).skip(skip).limit(limit)
    users_raw = await cursor.to_list(length=limit)
    
    # Calculate order counts and spend for each customer
    enriched_users = []
    for u in users_raw:
        u_id = str(u["_id"])
        order_count = await db.orders.count_documents({"user_id": u_id})
        # Calculate total spend
        pipeline = [
            {"$match": {"user_id": u_id, "order_status": {"$ne": "cancelled"}}},
            {"$group": {"_id": None, "total_spent": {"$sum": "$final_total"}}}
        ]
        spend_res = await db.orders.aggregate(pipeline).to_list(length=1)
        total_spent = spend_res[0]["total_spent"] if spend_res else 0.0
        
        user_formatted = format_user(u).model_dump()
        user_formatted["order_count"] = order_count
        user_formatted["total_spent"] = total_spent
        enriched_users.append(user_formatted)
        
    return {
        "items": enriched_users,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": (total + limit - 1) // limit if total > 0 else 1
    }

@router.patch("/{user_id}/status")
async def toggle_user_status(
    user_id: str,
    is_active: bool = Query(...),
    request: Request = None,
    admin: dict = Depends(check_admin_roles(["admin", "super_admin"])),
    db = Depends(get_db)
):
    try:
        oid = ObjectId(user_id)
    except Exception:
        oid = user_id
    user = await db.users.find_one({"_id": oid})
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        
    # Prevent self-suspension
    if str(admin.get("_id")) == str(oid) or admin.get("id") == str(oid):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You cannot suspend your own account")
        
    await db.users.update_one(
        {"_id": oid},
        {"$set": {"is_active": is_active, "updated_at": datetime.now(timezone.utc)}}
    )
    
    action_name = "activated" if is_active else "suspended"
    await record_audit_log(
        db, admin, f"user_{action_name}", "user", str(oid),
        f"Account of '{user.get('email')}' was {action_name}", request
    )
    return {"success": True, "message": f"User account successfully {action_name}"}

@router.patch("/{user_id}/role")
async def update_user_role(
    user_id: str,
    new_role: str = Query(..., pattern="^(customer|admin|product_manager|order_manager)$"),
    request: Request = None,
    admin: dict = Depends(check_admin_roles(["super_admin"])),  # Only Super Admin can promote
    db = Depends(get_db)
):
    try:
        oid = ObjectId(user_id)
    except Exception:
        oid = user_id
    user = await db.users.find_one({"_id": oid})
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        
    await db.users.update_one(
        {"_id": oid},
        {"$set": {"role": new_role, "updated_at": datetime.now(timezone.utc)}}
    )
    
    await record_audit_log(
        db, admin, "user_role_updated", "user", str(oid),
        f"Role of '{user.get('email')}' changed to '{new_role}'", request
    )
    return {"success": True, "message": f"User role updated to {new_role}"}
