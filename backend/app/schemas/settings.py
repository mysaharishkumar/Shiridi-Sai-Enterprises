from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field

class SocialLink(BaseModel):
    platform: str
    url: str

class SiteSettingsBase(BaseModel):
    store_name: str = "Shiridi Sai Enterprises"
    tagline: str = "Exquisite Handcrafted Furniture & Home Furnishings"
    logo_url: Optional[str] = ""
    phone: str = "+91 98490 12345"
    email: str = "contact@shiridisaienterprises.com"
    whatsapp_number: str = "+91 98490 12345"
    address: str = "Shop No. 12 & 13, Sai Complex, Main Furniture Road, Hyderabad, Telangana 500072"
    currency_symbol: str = "₹"
    currency_code: str = "INR"
    standard_delivery_fee: float = 499.0
    free_delivery_threshold: float = 15000.0
    cod_enabled: bool = True
    announcement_enabled: bool = True
    announcement_text: str = "✨ Grand Inaugural & Festive Offer: Flat 20% to 40% OFF on Solid Teak Wood Collections + Free Delivery across AP & Telangana on orders above ₹15,000!"
    about_us: str = "Shiridi Sai Enterprises has been a trusted symbol of premium wood craftsmanship and contemporary home luxury. We specialize in solid teak wood sofas, royal dining suites, hydraulic storage beds, and ergonomic workstations engineered for longevity."
    delivery_info: str = "We provide dedicated furniture transport with specialized packaging, corner guards, and free doorstep assembly by certified technicians."
    return_policy: str = "We offer a hassle-free 7-day replacement guarantee in case of any in-transit damage or manufacturing flaw."
    privacy_policy: str = "We value your privacy. Your contact and delivery details are exclusively utilized for fulfilling your orders safely."
    terms_and_conditions: str = "All our solid wood furniture pieces come with 5-year termite and manufacturing warranties."
    social_links: List[SocialLink] = [
        SocialLink(platform="Facebook", url="https://facebook.com/shiridisaienterprises"),
        SocialLink(platform="Instagram", url="https://instagram.com/shiridisaienterprises"),
        SocialLink(platform="WhatsApp", url="https://wa.me/919849012345")
    ]

class SiteSettingsUpdate(BaseModel):
    store_name: Optional[str] = None
    tagline: Optional[str] = None
    logo_url: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    whatsapp_number: Optional[str] = None
    address: Optional[str] = None
    currency_symbol: Optional[str] = None
    currency_code: Optional[str] = None
    standard_delivery_fee: Optional[float] = None
    free_delivery_threshold: Optional[float] = None
    cod_enabled: Optional[bool] = None
    announcement_enabled: Optional[bool] = None
    announcement_text: Optional[str] = None
    about_us: Optional[str] = None
    delivery_info: Optional[str] = None
    return_policy: Optional[str] = None
    privacy_policy: Optional[str] = None
    terms_and_conditions: Optional[str] = None
    social_links: Optional[List[SocialLink]] = None

class SiteSettingsResponse(SiteSettingsBase):
    id: Optional[str] = None
    updated_at: Optional[datetime] = None
