from typing import Optional, List
from fastapi import APIRouter, Depends, Query
from app.api.deps import get_db, check_admin_roles
from app.schemas.audit_log import AuditLogResponse
from app.schemas.common import PaginatedResponse

router = APIRouter(prefix="/admin/audit-logs", tags=["Admin Audit Logs"])

def format_log(entry: dict) -> AuditLogResponse:
    entry_id = str(entry.get("_id") or entry.get("id"))
    data = dict(entry)
    data["id"] = entry_id
    if "_id" in data:
        del data["_id"]
    return AuditLogResponse(**data)

@router.get("", response_model=PaginatedResponse[AuditLogResponse])
async def list_audit_logs(
    resource_type: Optional[str] = Query(None),
    admin_email: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    admin: dict = Depends(check_admin_roles(["admin", "super_admin"])),
    db = Depends(get_db)
):
    query = {}
    if resource_type:
        query["resource_type"] = resource_type
    if admin_email:
        query["admin_email"] = admin_email
        
    total = await db.audit_logs.count_documents(query)
    skip = (page - 1) * limit
    cursor = db.audit_logs.find(query).sort("created_at", -1).skip(skip).limit(limit)
    raw = await cursor.to_list(length=limit)
    
    return PaginatedResponse[AuditLogResponse](
        items=[format_log(l) for l in raw],
        total=total,
        page=page,
        limit=limit,
        total_pages=(total + limit - 1) // limit if total > 0 else 1
    )
