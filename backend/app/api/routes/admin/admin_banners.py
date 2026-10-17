from datetime import datetime, timezone
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Request, status
from bson import ObjectId
from app.api.deps import get_db, check_admin_roles, record_audit_log
from app.schemas.banner import BannerCreate, BannerUpdate, BannerResponse

router = APIRouter(prefix="/admin/banners", tags=["Admin Banners"])

def format_banner(b: dict) -> BannerResponse:
    b_id = str(b.get("_id") or b.get("id"))
    data = dict(b)
    data["id"] = b_id
    if "_id" in data:
        del data["_id"]
    return BannerResponse(**data)

@router.get("", response_model=List[BannerResponse])
async def list_admin_banners(
    admin: dict = Depends(check_admin_roles(["admin", "super_admin", "product_manager"])),
    db = Depends(get_db)
):
    cursor = db.banners.find({}).sort("display_order", 1)
    banners = await cursor.to_list(length=50)
    return [format_banner(b) for b in banners]

@router.post("", response_model=BannerResponse)
async def create_banner(
    banner_in: BannerCreate,
    request: Request,
    admin: dict = Depends(check_admin_roles(["admin", "super_admin", "product_manager"])),
    db = Depends(get_db)
):
    now = datetime.now(timezone.utc)
    doc = banner_in.model_dump()
    doc["created_at"] = now
    doc["updated_at"] = now
    
    res = await db.banners.insert_one(doc)
    doc["_id"] = res.inserted_id
    
    await record_audit_log(
        db, admin, "create_banner", "banner", str(res.inserted_id),
        f"Created banner '{banner_in.title}'", request
    )
    return format_banner(doc)

@router.put("/{banner_id}", response_model=BannerResponse)
async def update_banner(
    banner_id: str,
    banner_update: BannerUpdate,
    request: Request,
    admin: dict = Depends(check_admin_roles(["admin", "super_admin", "product_manager"])),
    db = Depends(get_db)
):
    try:
        oid = ObjectId(banner_id)
    except Exception:
        oid = banner_id
    existing = await db.banners.find_one({"_id": oid})
    if not existing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Banner not found")
        
    update_data = {k: v for k, v in banner_update.model_dump(exclude_unset=True).items()}
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    await db.banners.update_one({"_id": oid}, {"$set": update_data})
    updated = await db.banners.find_one({"_id": oid})
    
    await record_audit_log(
        db, admin, "update_banner", "banner", str(oid),
        f"Updated banner '{existing.get('title')}'", request
    )
    return format_banner(updated)

@router.post("/reorder")
async def reorder_banners(
    order_map: List[Dict[str, Any]],  # [{"id": "...", "order": 0}]
    request: Request,
    admin: dict = Depends(check_admin_roles(["admin", "super_admin", "product_manager"])),
    db = Depends(get_db)
):
    for item in order_map:
        b_id = item.get("id")
        order = item.get("order", 0)
        try:
            oid = ObjectId(b_id)
        except Exception:
            oid = b_id
        await db.banners.update_one({"_id": oid}, {"$set": {"display_order": order}})
        
    await record_audit_log(
        db, admin, "reorder_banners", "banner", None,
        "Reordered promotional banners", request
    )
    return {"success": True, "message": "Banners reordered successfully"}

@router.delete("/{banner_id}")
async def delete_banner(
    banner_id: str,
    request: Request,
    admin: dict = Depends(check_admin_roles(["admin", "super_admin"])),
    db = Depends(get_db)
):
    try:
        oid = ObjectId(banner_id)
    except Exception:
        oid = banner_id
    existing = await db.banners.find_one({"_id": oid})
    if not existing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Banner not found")
        
    await db.banners.delete_one({"_id": oid})
    
    await record_audit_log(
        db, admin, "delete_banner", "banner", str(oid),
        f"Deleted banner '{existing.get('title')}'", request
    )
    return {"success": True, "message": "Banner deleted successfully"}
