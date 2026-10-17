import re
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from bson import ObjectId
from app.api.deps import get_db, get_current_admin, record_audit_log, check_admin_roles
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse
from app.schemas.common import PaginatedResponse

router = APIRouter(prefix="/admin/products", tags=["Admin Products"])

def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    return text.strip('-')

def format_product(prod: dict) -> ProductResponse:
    prod_id = str(prod.get("_id") or prod.get("id"))
    data = dict(prod)
    data["id"] = prod_id
    if "_id" in data:
        del data["_id"]
    return ProductResponse(**data)

@router.get("", response_model=PaginatedResponse[ProductResponse])
async def list_admin_products(
    search: Optional[str] = Query(None),
    category_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None, pattern="^(all|published|draft|archived|low_stock|out_of_stock)$"),
    page: int = Query(1, ge=1),
    limit: int = Query(15, ge=1, le=100),
    admin: dict = Depends(get_current_admin),
    db = Depends(get_db)
):
    query = {}
    if category_id:
        query["category_id"] = category_id
        
    if status == "published":
        query["is_published"] = True
        query["is_archived"] = False
    elif status == "draft":
        query["is_published"] = False
        query["is_archived"] = False
    elif status == "archived":
        query["is_archived"] = True
    elif status == "low_stock":
        query["total_stock"] = {"$gt": 0, "$lte": 5}
    elif status == "out_of_stock":
        query["total_stock"] = {"$lte": 0}

    if search and search.strip():
        term = search.strip()
        regex_pattern = {"$regex": re.escape(term), "$options": "i"}
        query["$or"] = [
            {"name": regex_pattern},
            {"sku": regex_pattern},
            {"material": regex_pattern},
            {"category_name": regex_pattern}
        ]

    total = await db.products.count_documents(query)
    skip = (page - 1) * limit
    cursor = db.products.find(query).sort("created_at", -1).skip(skip).limit(limit)
    raw = await cursor.to_list(length=limit)
    
    return PaginatedResponse[ProductResponse](
        items=[format_product(p) for p in raw],
        total=total,
        page=page,
        limit=limit,
        total_pages=(total + limit - 1) // limit if total > 0 else 1
    )

@router.post("", response_model=ProductResponse)
async def create_product(
    prod_in: ProductCreate,
    request: Request,
    admin: dict = Depends(check_admin_roles(["admin", "super_admin", "product_manager"])),
    db = Depends(get_db)
):
    # Generate slug if empty
    base_slug = prod_in.slug or slugify(prod_in.name)
    slug = base_slug
    counter = 1
    while await db.products.find_one({"slug": slug}):
        slug = f"{base_slug}-{counter}"
        counter += 1
        
    # Auto compute discount percentage if original price provided
    discount_pct = 0
    if prod_in.original_price and prod_in.original_price > prod_in.selling_price:
        discount_pct = round(((prod_in.original_price - prod_in.selling_price) / prod_in.original_price) * 100)
        
    # Fetch category name if missing
    cat_name = prod_in.category_name
    if not cat_name:
        try:
            cat_doc = await db.categories.find_one({"_id": ObjectId(prod_in.category_id)})
        except Exception:
            cat_doc = await db.categories.find_one({"slug": prod_in.category_id})
        if cat_doc:
            cat_name = cat_doc.get("name")
            
    now = datetime.now(timezone.utc)
    doc = prod_in.model_dump()
    doc["slug"] = slug
    doc["discount_percentage"] = discount_pct
    doc["category_name"] = cat_name
    doc["in_stock"] = doc.get("total_stock", 0) > 0
    doc["rating"] = 4.8
    doc["review_count"] = 0
    doc["created_at"] = now
    doc["updated_at"] = now
    
    res = await db.products.insert_one(doc)
    doc["_id"] = res.inserted_id
    
    await record_audit_log(
        db, admin, "create_product", "product", str(res.inserted_id),
        f"Created product '{prod_in.name}' with SKU '{prod_in.sku}'", request
    )
    return format_product(doc)

@router.get("/{product_id}", response_model=ProductResponse)
async def get_admin_product(
    product_id: str,
    admin: dict = Depends(get_current_admin),
    db = Depends(get_db)
):
    try:
        prod = await db.products.find_one({"_id": ObjectId(product_id)})
    except Exception:
        prod = await db.products.find_one({"_id": product_id})
    if not prod:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return format_product(prod)

@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: str,
    prod_update: ProductUpdate,
    request: Request,
    admin: dict = Depends(check_admin_roles(["admin", "super_admin", "product_manager"])),
    db = Depends(get_db)
):
    try:
        oid = ObjectId(product_id)
    except Exception:
        oid = product_id
        
    existing = await db.products.find_one({"_id": oid})
    if not existing:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
        
    update_data = {k: v for k, v in prod_update.model_dump(exclude_unset=True).items()}
    
    # Recalculate discount % if prices changed
    selling = update_data.get("selling_price", existing.get("selling_price"))
    original = update_data.get("original_price", existing.get("original_price"))
    if original and selling and original > selling:
        update_data["discount_percentage"] = round(((original - selling) / original) * 100)
    elif original and selling and original <= selling:
        update_data["discount_percentage"] = 0
        
    # Recalculate stock availability
    if "total_stock" in update_data:
        update_data["in_stock"] = update_data["total_stock"] > 0
        
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    await db.products.update_one({"_id": oid}, {"$set": update_data})
    updated = await db.products.find_one({"_id": oid})
    
    await record_audit_log(
        db, admin, "update_product", "product", str(oid),
        f"Updated product '{existing.get('name')}'", request
    )
    return format_product(updated)

@router.post("/{product_id}/duplicate", response_model=ProductResponse)
async def duplicate_product(
    product_id: str,
    request: Request,
    admin: dict = Depends(check_admin_roles(["admin", "super_admin", "product_manager"])),
    db = Depends(get_db)
):
    try:
        oid = ObjectId(product_id)
    except Exception:
        oid = product_id
    prod = await db.products.find_one({"_id": oid})
    if not prod:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Original product not found")
        
    del prod["_id"]
    prod["name"] = f"{prod['name']} (Copy)"
    base_slug = slugify(prod["name"])
    slug = base_slug
    counter = 1
    while await db.products.find_one({"slug": slug}):
        slug = f"{base_slug}-{counter}"
        counter += 1
    prod["slug"] = slug
    if prod.get("sku"):
        prod["sku"] = f"{prod['sku']}-COPY"
    prod["is_published"] = False  # Start as draft
    now = datetime.now(timezone.utc)
    prod["created_at"] = now
    prod["updated_at"] = now
    
    res = await db.products.insert_one(prod)
    prod["_id"] = res.inserted_id
    
    await record_audit_log(
        db, admin, "duplicate_product", "product", str(res.inserted_id),
        f"Duplicated product from ID '{product_id}'", request
    )
    return format_product(prod)

@router.delete("/{product_id}")
async def delete_or_archive_product(
    product_id: str,
    request: Request,
    hard_delete: bool = Query(False),
    admin: dict = Depends(check_admin_roles(["admin", "super_admin"])),
    db = Depends(get_db)
):
    try:
        oid = ObjectId(product_id)
    except Exception:
        oid = product_id
    prod = await db.products.find_one({"_id": oid})
    if not prod:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
        
    # Check if product is part of existing orders to protect historical records
    has_orders = await db.orders.find_one({"items.product_id": str(oid)})
    
    if hard_delete and not has_orders:
        await db.products.delete_one({"_id": oid})
        action_type = "hard_deleted"
    else:
        # Safe archiving to protect order history
        await db.products.update_one(
            {"_id": oid},
            {"$set": {"is_archived": True, "is_published": False, "updated_at": datetime.now(timezone.utc)}}
        )
        action_type = "archived (safe delete)"
        
    await record_audit_log(
        db, admin, f"delete_product_{action_type}", "product", str(oid),
        f"Action {action_type} executed on product '{prod.get('name')}'", request
    )
    return {"success": True, "message": f"Product successfully {action_type}"}
