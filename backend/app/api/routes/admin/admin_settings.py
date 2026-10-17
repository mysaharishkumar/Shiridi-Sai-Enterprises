from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Request
from app.api.deps import get_db, check_admin_roles, record_audit_log
from app.schemas.settings import SiteSettingsUpdate, SiteSettingsResponse

router = APIRouter(prefix="/admin/settings", tags=["Admin Settings"])

@router.get("", response_model=SiteSettingsResponse)
async def get_admin_settings(
    admin: dict = Depends(check_admin_roles(["admin", "super_admin"])),
    db = Depends(get_db)
):
    doc = await db.site_settings.find_one({})
    if not doc:
        return SiteSettingsResponse()
    doc["id"] = str(doc.get("_id") or doc.get("id"))
    if "_id" in doc:
        del doc["_id"]
    return SiteSettingsResponse(**doc)

@router.put("", response_model=SiteSettingsResponse)
async def update_admin_settings(
    settings_in: SiteSettingsUpdate,
    request: Request,
    admin: dict = Depends(check_admin_roles(["super_admin"])),  # Only Super Admin can change system-wide settings
    db = Depends(get_db)
):
    existing = await db.site_settings.find_one({})
    update_data = {k: v for k, v in settings_in.model_dump(exclude_unset=True).items()}
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    if existing:
        await db.site_settings.update_one({"_id": existing["_id"]}, {"$set": update_data})
        updated = await db.site_settings.find_one({"_id": existing["_id"]})
    else:
        update_data["created_at"] = datetime.now(timezone.utc)
        res = await db.site_settings.insert_one(update_data)
        updated = await db.site_settings.find_one({"_id": res.inserted_id})
        
    await record_audit_log(
        db, admin, "update_site_settings", "settings", None,
        "Store settings and configuration updated", request
    )
    
    updated["id"] = str(updated.get("_id") or updated.get("id"))
    if "_id" in updated:
        del updated["_id"]
    return SiteSettingsResponse(**updated)
