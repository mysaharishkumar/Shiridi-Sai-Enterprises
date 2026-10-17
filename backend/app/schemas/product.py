from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class ProductImage(BaseModel):
    url: str
    alt: Optional[str] = None
    is_primary: bool = False
    public_id: Optional[str] = None
    color: Optional[str] = None

class ProductColor(BaseModel):
    name: str
    hex_code: Optional[str] = "#78350F"
    image_url: Optional[str] = None
    images: Optional[List[str]] = []

class ProductVariant(BaseModel):
    variant_id: str
    sku: Optional[str] = None
    color: Optional[str] = None
    dimensions: Optional[str] = None
    price_override: Optional[float] = None
    stock_quantity: int = 10
    image_url: Optional[str] = None

class ProductSpecification(BaseModel):
    label: str
    value: str

class ProductDimensions(BaseModel):
    length: Optional[float] = None
    width: Optional[float] = None
    height: Optional[float] = None
    unit: str = "cm"

class ProductBase(BaseModel):
    name: str
    slug: Optional[str] = None
    description: str
    short_description: Optional[str] = None
    category_id: str
    category_name: Optional[str] = None
    subcategory_id: Optional[str] = None
    selling_price: float = Field(..., gt=0)
    original_price: Optional[float] = None
    discount_percentage: Optional[int] = 0
    sku: Optional[str] = None
    brand: Optional[str] = "Shiridi Sai Enterprises"
    material: Optional[str] = "Solid Teak Wood"
    finish: Optional[str] = "Natural Matte Polish"
    dimensions: Optional[ProductDimensions] = None
    weight: Optional[str] = None
    total_stock: int = 15
    in_stock: bool = True
    images: List[ProductImage] = []
    colors: List[ProductColor] = []
    variants: List[ProductVariant] = []
    specifications: List[ProductSpecification] = []
    features: List[str] = []
    warranty_info: Optional[str] = "5 Years Manufacturer Warranty on Wood Borer & Termite"
    assembly_required: bool = False
    is_featured: bool = False
    is_best_seller: bool = False
    is_new_arrival: bool = False
    is_special_offer: bool = False
    is_published: bool = True
    is_archived: bool = False

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    short_description: Optional[str] = None
    category_id: Optional[str] = None
    category_name: Optional[str] = None
    subcategory_id: Optional[str] = None
    selling_price: Optional[float] = None
    original_price: Optional[float] = None
    discount_percentage: Optional[int] = None
    sku: Optional[str] = None
    brand: Optional[str] = None
    material: Optional[str] = None
    finish: Optional[str] = None
    dimensions: Optional[ProductDimensions] = None
    weight: Optional[str] = None
    total_stock: Optional[int] = None
    in_stock: Optional[bool] = None
    images: Optional[List[ProductImage]] = None
    colors: Optional[List[ProductColor]] = None
    variants: Optional[List[ProductVariant]] = None
    specifications: Optional[List[ProductSpecification]] = None
    features: Optional[List[str]] = None
    warranty_info: Optional[str] = None
    assembly_required: Optional[bool] = None
    is_featured: Optional[bool] = None
    is_best_seller: Optional[bool] = None
    is_new_arrival: Optional[bool] = None
    is_special_offer: Optional[bool] = None
    is_published: Optional[bool] = None
    is_archived: Optional[bool] = None

class ProductResponse(ProductBase):
    id: str
    rating: float = 4.8
    review_count: int = 24
    created_at: datetime
    updated_at: Optional[datetime] = None
