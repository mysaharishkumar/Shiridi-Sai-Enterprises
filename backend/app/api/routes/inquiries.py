import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from app.api.deps import get_db, get_current_admin
from app.schemas.inquiry import InquiryCreate, InquiryResponse

router = APIRouter(tags=["Inquiries"])

@router.post("/inquiries", response_model=dict)
async def submit_inquiry(inquiry_in: InquiryCreate, db = Depends(get_db)):
    now = datetime.now(timezone.utc)
    inquiry_id = f"inq_{uuid.uuid4().hex[:12]}"
    
    doc = {
        "_id": inquiry_id,
        "id": inquiry_id,
        "name": inquiry_in.name,
        "phone": inquiry_in.phone,
        "email": inquiry_in.email or "",
        "subject": inquiry_in.subject or "Furniture Inquiry",
        "message": inquiry_in.message,
        "status": "new",
        "created_at": now,
        "updated_at": now
    }
    
    await db.inquiries.insert_one(doc)
    
    # Audit log entry for tracking
    await db.audit_logs.insert_one({
        "action": "CUSTOMER_INQUIRY",
        "resource_type": "inquiry",
        "resource_id": inquiry_id,
        "details": f"New inquiry from {inquiry_in.name} ({inquiry_in.phone}): {inquiry_in.subject}",
        "created_at": now
    })
    
    return {
        "success": True,
        "message": "Inquiry submitted successfully",
        "inquiry_id": inquiry_id
    }

@router.get("/admin/inquiries", response_model=List[InquiryResponse])
async def list_admin_inquiries(
    db = Depends(get_db),
    admin = Depends(get_current_admin)
):
    cursor = db.inquiries.find({}).sort("created_at", -1)
    docs = await cursor.to_list(length=200)
    
    results = []
    for d in docs:
        d["id"] = str(d.get("_id") or d.get("id"))
        results.append(InquiryResponse(
            id=d["id"],
            name=d.get("name", "Unknown"),
            phone=d.get("phone", ""),
            email=d.get("email", ""),
            subject=d.get("subject", ""),
            message=d.get("message", ""),
            status=d.get("status", "new"),
            created_at=d.get("created_at", datetime.now(timezone.utc))
        ))
    return results

@router.patch("/admin/inquiries/{inquiry_id}/status")
async def update_inquiry_status(
    inquiry_id: str,
    status_update: dict,
    db = Depends(get_db),
    admin = Depends(get_current_admin)
):
    new_status = status_update.get("status", "contacted")
    res = await db.inquiries.update_one(
        {"_id": inquiry_id},
        {"$set": {"status": new_status, "updated_at": datetime.now(timezone.utc)}}
    )
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Inquiry not found")
    return {"success": True, "status": new_status}

@router.delete("/admin/inquiries/{inquiry_id}")
async def delete_inquiry(
    inquiry_id: str,
    db = Depends(get_db),
    admin = Depends(get_current_admin)
):
    res = await db.inquiries.delete_one({"_id": inquiry_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Inquiry not found")
    return {"success": True, "message": "Inquiry deleted"}
