from datetime import datetime
from enum import Enum
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field

class UserRole(str, Enum):
    CUSTOMER = "customer"
    ADMIN = "admin"
    SUPER_ADMIN = "super_admin"
    PRODUCT_MANAGER = "product_manager"
    ORDER_MANAGER = "order_manager"

class AddressBase(BaseModel):
    id: Optional[str] = None
    full_name: str
    phone: str
    street_address: str
    landmark: Optional[str] = None
    city: str
    state: str
    pincode: str
    is_default: bool = False

class UserBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    addresses: Optional[List[AddressBase]] = None

class UserAdminCreate(UserBase):
    password: str = Field(..., min_length=6)
    role: UserRole = UserRole.ADMIN

class UserAdminUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None

class UserResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    phone: Optional[str] = None
    role: str
    is_active: bool
    addresses: List[AddressBase] = []
    created_at: datetime
    updated_at: Optional[datetime] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
