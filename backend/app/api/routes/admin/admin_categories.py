import re
from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Request, status
from bson import ObjectId
from app.api.deps import get_db, check_admin_roles, record_audit_log
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse

router = APIRouter(prefix="/admin/categories", tags=["Admin Categories"])

def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    return text.strip('-')

def format_category(cat: dict, count: int = 0) -> CategoryResponse:
    cat_id = str(cat.get("_id") or cat.get("id"))
    data = dict(cat)
    data["id"] = cat_id
    if "_id" in data:
        del data["_id"]
    data["product_count"] = count
    return CategoryResponse(**data)

@router.get("", response_model=List[CategoryResponse])
async def list_admin_categories(
    admin: dict = Depends(check_admin_roles(["admin", "super_admin", "product_manager"])),
    db = Depends(get_db)
):
    cursor = db.categories.find({}).sort("display_order", 1)
    cats = await cursor.to_list(length=100)
    
    results = []
    for c in cats:
        cat_id_str = str(c["_id"])
        count = await db.products.count_documents({
            "$or": [
                {"category_id": cat_id_str},
                {"category_id": c.get("slug")}
            ]
        })
        results.append(format_category(c, count))
    return results

@router.post("", response_model=CategoryResponse)
async def create_category(
    cat_in: CategoryCreate,
    request: Request,
    admin: dict = Depends(check_admin_roles(["admin", "super_admin", "product_manager"])),
    db = Depends(get_db)
):
    base_slug = cat_in.slug or slugify(cat_in.name)
    slug = base_slug
    counter = 1
    while await db.categories.find_one({"slug": slug}):
        slug = f"{base_slug}-{counter}"
        counter += 1
        
    now = datetime.now(timezone.utc)
    doc = cat_in.model_dump()
    doc["slug"] = slug
    doc["created_at"] = now
    doc["updated_at"] = now
    
    res = await db.categories.insert_one(doc)
    doc["_id"] = res.inserted_id
    
    await record_audit_log(
        db, admin, "create_category", "category", str(res.inserted_id),
        f"Created category '{cat_in.name}'", request
    )
    return format_category(doc, 0)

@router.put("/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: str,
    cat_update: CategoryUpdate,
    request: Request,
    admin: dict = Depends(check_admin_roles(["admin", "super_admin", "product_manager"])),
    db = Depends(get_db)
):
    try:
        oid = ObjectId(category_id)
    except Exception:
        oid = category_id
    existing = await db.categories.find_one({"_id": oid})
    if not existing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
        
    update_data = {k: v for k, v in cat_update.model_dump(exclude_unset=True).items()}
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    await db.categories.update_one({"_id": oid}, {"$set": update_data})
    updated = await db.categories.find_one({"_id": oid})
    
    # If category name changed, update category_name across products
    if "name" in update_data:
        await db.products.update_many(
            {"category_id": str(oid)},
            {"$set": {"category_name": update_data["name"]}}
        )
        
    await record_audit_log(
        db, admin, "update_category", "category", str(oid),
        f"Updated category '{existing.get('name')}'", request
    )
    
    count = await db.products.count_documents({"category_id": str(oid)})
    return format_category(updated, count)

@router.delete("/{category_id}")
async def delete_category(
    category_id: str,
    request: Request,
    admin: dict = Depends(check_admin_roles(["admin", "super_admin"])),
    db = Depends(get_db)
):
    try:
        oid = ObjectId(category_id)
    except Exception:
        oid = category_id
    existing = await db.categories.find_one({"_id": oid})
    if not existing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
        
    # Safeguard: check if products belong to this category
    product_count = await db.products.count_documents({
        "$or": [
            {"category_id": str(oid)},
            {"category_id": existing.get("slug")}
        ],
        "is_archived": False
    })
    
    if product_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete category '{existing.get('name')}' because it contains {product_count} active product(s). Please reassign or archive these products first."
        )
        
    await db.categories.delete_one({"_id": oid})
    
    await record_audit_log(
        db, admin, "delete_category", "category", str(oid),
        f"Deleted category '{existing.get('name')}'", request
    )
    return {"success": True, "message": "Category successfully deleted"}
