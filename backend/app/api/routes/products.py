from typing import Optional, List
import re
from fastapi import APIRouter, Depends, HTTPException, Query, status
from bson import ObjectId
from app.api.deps import get_db
from app.schemas.product import ProductResponse
from app.schemas.common import PaginatedResponse

router = APIRouter(prefix="/products", tags=["Products"])

def format_product(prod: dict) -> ProductResponse:
    prod_id = str(prod.get("_id") or prod.get("id"))
    data = dict(prod)
    data["id"] = prod_id
    if "_id" in data:
        del data["_id"]
    return ProductResponse(**data)

@router.get("", response_model=PaginatedResponse[ProductResponse])
async def list_products(
    category: Optional[str] = Query(None, description="Category slug or ID"),
    search: Optional[str] = Query(None, description="Search keyword"),
    min_price: Optional[float] = Query(None, ge=0),
    max_price: Optional[float] = Query(None, ge=0),
    color: Optional[str] = Query(None),
    material: Optional[str] = Query(None),
    in_stock: Optional[bool] = Query(None),
    is_featured: Optional[bool] = Query(None),
    is_best_seller: Optional[bool] = Query(None),
    is_new_arrival: Optional[bool] = Query(None),
    is_special_offer: Optional[bool] = Query(None),
    sort: Optional[str] = Query("newest", pattern="^(price_asc|price_desc|newest|name_asc)$"),
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=50),
    db = Depends(get_db)
):
    query: dict = {
        "is_published": True,
        "is_archived": False
    }
    
    # Category filter (by slug or id or category_name)
    if category:
        category_doc = await db.categories.find_one({"slug": category})
        if category_doc:
            cat_id_str = str(category_doc["_id"])
            query["$or"] = [
                {"category_id": cat_id_str},
                {"category_id": category},
                {"category_name": category_doc["name"]}
            ]
        else:
            query["$or"] = [
                {"category_id": category},
                {"category_name": {"$regex": re.escape(category), "$options": "i"}}
            ]

    # Search keyword
    if search and search.strip():
        term = search.strip()
        regex_pattern = {"$regex": re.escape(term), "$options": "i"}
        search_or = [
            {"name": regex_pattern},
            {"description": regex_pattern},
            {"short_description": regex_pattern},
            {"brand": regex_pattern},
            {"material": regex_pattern},
            {"category_name": regex_pattern},
            {"colors.name": regex_pattern},
            {"variants.color": regex_pattern}
        ]
        if "$or" in query:
            query = {"$and": [{"$or": query.pop("$or")}, {"$or": search_or}], **query}
        else:
            query["$or"] = search_or

    # Price range filter
    if min_price is not None or max_price is not None:
        price_filter = {}
        if min_price is not None:
            price_filter["$gte"] = min_price
        if max_price is not None:
            price_filter["$lte"] = max_price
        query["selling_price"] = price_filter

    # Color filter
    if color and color.strip():
        color_regex = {"$regex": f"^{re.escape(color.strip())}$", "$options": "i"}
        query["$or"] = [
            {"colors.name": color_regex},
            {"variants.color": color_regex}
        ]

    # Material filter
    if material and material.strip():
        query["material"] = {"$regex": re.escape(material.strip()), "$options": "i"}

    # Stock filter
    if in_stock is True:
        query["in_stock"] = True
        query["total_stock"] = {"$gt": 0}

    # Badges filters
    if is_featured is not None:
        query["is_featured"] = is_featured
    if is_best_seller is not None:
        query["is_best_seller"] = is_best_seller
    if is_new_arrival is not None:
        query["is_new_arrival"] = is_new_arrival
    if is_special_offer is not None:
        query["is_special_offer"] = is_special_offer

    # Sorting
    sort_fields = [("created_at", -1)]
    if sort == "price_asc":
        sort_fields = [("selling_price", 1)]
    elif sort == "price_desc":
        sort_fields = [("selling_price", -1)]
    elif sort == "name_asc":
        sort_fields = [("name", 1)]
    elif sort == "newest":
        sort_fields = [("created_at", -1)]

    total = await db.products.count_documents(query)
    skip = (page - 1) * limit
    
    cursor = db.products.find(query).sort(sort_fields).skip(skip).limit(limit)
    raw_products = await cursor.to_list(length=limit)
    
    items = [format_product(p) for p in raw_products]
    total_pages = (total + limit - 1) // limit if total > 0 else 1

    return PaginatedResponse[ProductResponse](
        items=items,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages
    )

@router.get("/search/suggestions")
async def search_suggestions(q: str = Query(..., min_length=1), db = Depends(get_db)):
    term = q.strip()
    regex_pattern = {"$regex": re.escape(term), "$options": "i"}
    cursor = db.products.find(
        {
            "is_published": True,
            "is_archived": False,
            "$or": [
                {"name": regex_pattern},
                {"category_name": regex_pattern},
                {"material": regex_pattern}
            ]
        },
        {"name": 1, "slug": 1, "selling_price": 1, "images": 1, "category_name": 1}
    ).limit(6)
    
    matches = await cursor.to_list(length=6)
    suggestions = []
    for m in matches:
        first_img = m.get("images", [{}])[0].get("url") if m.get("images") else None
        suggestions.append({
            "id": str(m["_id"]),
            "name": m.get("name"),
            "slug": m.get("slug"),
            "price": m.get("selling_price"),
            "category": m.get("category_name"),
            "image": first_img
        })
    return suggestions

@router.get("/{slug}", response_model=ProductResponse)
async def get_product_by_slug(slug: str, db = Depends(get_db)):
    prod = await db.products.find_one({"slug": slug, "is_published": True, "is_archived": False})
    if not prod:
        # Check by ObjectId
        try:
            prod = await db.products.find_one({"_id": ObjectId(slug), "is_published": True, "is_archived": False})
        except Exception:
            pass
    if not prod:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found or currently unavailable")
    return format_product(prod)

@router.get("/{product_id}/related", response_model=List[ProductResponse])
async def get_related_products(product_id: str, db = Depends(get_db)):
    target_prod = None
    try:
        target_prod = await db.products.find_one({"_id": ObjectId(product_id)})
    except Exception:
        target_prod = await db.products.find_one({"slug": product_id})
        
    if not target_prod:
        return []
        
    query = {
        "_id": {"$ne": target_prod["_id"]},
        "category_id": target_prod.get("category_id"),
        "is_published": True,
        "is_archived": False
    }
    cursor = db.products.find(query).limit(4)
    raw = await cursor.to_list(length=4)
    return [format_product(p) for p in raw]
