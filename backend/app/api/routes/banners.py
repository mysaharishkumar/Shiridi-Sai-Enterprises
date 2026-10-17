from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends
from app.api.deps import get_db
from app.schemas.banner import BannerResponse

router = APIRouter(prefix="/banners", tags=["Banners"])

def format_banner(b: dict) -> BannerResponse:
    b_id = str(b.get("_id") or b.get("id"))
    data = dict(b)
    data["id"] = b_id
    if "_id" in data:
        del data["_id"]
    return BannerResponse(**data)

@router.get("", response_model=List[BannerResponse])
async def list_active_banners(db = Depends(get_db)):
    now = datetime.now(timezone.utc)
    query = {
        "is_active": True,
        "$and": [
            {
                "$or": [
                    {"start_date": None},
                    {"start_date": {"$lte": now}}
                ]
            },
            {
                "$or": [
                    {"end_date": None},
                    {"end_date": {"$gte": now}}
                ]
            }
        ]
    }
    cursor = db.banners.find(query).sort("display_order", 1)
    banners = await cursor.to_list(length=20)
    return [format_banner(b) for b in banners]
