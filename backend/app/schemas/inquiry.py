from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class InquiryCreate(BaseModel):
    name: str
    phone: str
    email: Optional[str] = ""
    subject: Optional[str] = "General Inquiry"
    message: str

class InquiryResponse(BaseModel):
    id: str
    name: str
    phone: str
    email: Optional[str] = ""
    subject: Optional[str] = ""
    message: str
    status: str = "new"
    created_at: datetime
