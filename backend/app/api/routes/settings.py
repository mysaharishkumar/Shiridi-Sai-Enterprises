from fastapi import APIRouter, Depends
from app.api.deps import get_db
from app.schemas.settings import SiteSettingsResponse

router = APIRouter(prefix="/settings", tags=["Settings"])

@router.get("/public", response_model=SiteSettingsResponse)
async def get_public_settings(db = Depends(get_db)):
    doc = await db.site_settings.find_one({})
    if not doc:
        # Default fallback
        return SiteSettingsResponse()
    
    doc["id"] = str(doc.get("_id") or doc.get("id"))
    if "_id" in doc:
        del doc["_id"]
    return SiteSettingsResponse(**doc)
