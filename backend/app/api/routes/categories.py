from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId
from app.api.deps import get_db
from app.schemas.category import CategoryResponse

router = APIRouter(prefix="/categories", tags=["Categories"])

def format_category(cat: dict, count: int = 0) -> CategoryResponse:
    return CategoryResponse(
        id=str(cat.get("_id") or cat.get("id")),
        name=cat["name"],
        slug=cat.get("slug", ""),
        description=cat.get("description"),
        image_url=cat.get("image_url"),
        display_order=cat.get("display_order", 0),
        is_active=cat.get("is_active", True),
        subcategories=cat.get("subcategories", []),
        product_count=count,
        created_at=cat.get("created_at"),
        updated_at=cat.get("updated_at")
    )

@router.get("", response_model=List[CategoryResponse])
async def list_active_categories(db = Depends(get_db)):
    cursor = db.categories.find({"is_active": True}).sort("display_order", 1)
    categories = await cursor.to_list(length=100)
    
    # Enrich with product count
    results = []
    for cat in categories:
        cat_id_str = str(cat["_id"])
        count = await db.products.count_documents({
            "$or": [
                {"category_id": cat_id_str},
                {"category_id": cat.get("slug")}
            ],
            "is_published": True,
            "is_archived": False
        })
        results.append(format_category(cat, count))
    return results

@router.get("/{slug}", response_model=CategoryResponse)
async def get_category_by_slug(slug: str, db = Depends(get_db)):
    cat = await db.categories.find_one({"slug": slug, "is_active": True})
    if not cat:
        # Check by id if not slug
        try:
            cat = await db.categories.find_one({"_id": ObjectId(slug), "is_active": True})
        except Exception:
            pass
    if not cat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
        
    cat_id_str = str(cat["_id"])
    count = await db.products.count_documents({
        "$or": [
            {"category_id": cat_id_str},
            {"category_id": cat.get("slug")}
        ],
        "is_published": True,
        "is_archived": False
    })
    return format_category(cat, count)
