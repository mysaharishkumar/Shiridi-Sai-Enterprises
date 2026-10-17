from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class BannerBase(BaseModel):
    title: str
    subtitle: Optional[str] = None
    badge_text: Optional[str] = "Festive Offer"
    image_url: str
    mobile_image_url: Optional[str] = None
    cta_text: Optional[str] = "Shop Now"
    link_url: Optional[str] = "/category/sofas"
    display_order: int = 0
    is_active: bool = True
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

class BannerCreate(BannerBase):
    pass

class BannerUpdate(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    badge_text: Optional[str] = None
    image_url: Optional[str] = None
    mobile_image_url: Optional[str] = None
    cta_text: Optional[str] = None
    link_url: Optional[str] = None
    display_order: Optional[int] = None
    is_active: Optional[bool] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

class BannerResponse(BannerBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
