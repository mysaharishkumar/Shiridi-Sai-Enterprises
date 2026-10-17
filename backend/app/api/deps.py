from datetime import datetime, timezone
from typing import Generator, Optional, List
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from bson import ObjectId
from app.core.config import settings
from app.core.security import decode_access_token
from app.db.mongodb import get_database

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login"
)

async def get_db():
    db = get_database()
    if db is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection is not available"
        )
    return db

async def get_current_user_optional(
    token: Optional[str] = Depends(OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login", auto_error=False)),
    db = Depends(get_db)
) -> Optional[dict]:
    if not token:
        return None
    payload = decode_access_token(token)
    if not payload:
        return None
    user_id = payload.get("sub")
    if not user_id:
        return None
    try:
        user = await db.users.find_one({"_id": ObjectId(user_id)})
    except Exception:
        user = await db.users.find_one({"_id": user_id})
    if not user or not user.get("is_active", True):
        return None
    user["id"] = str(user["_id"])
    return user

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db = Depends(get_db)
) -> dict:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials or session expired",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
    user_id: str = payload.get("sub")
    if user_id is None:
        raise credentials_exception
    try:
        user = await db.users.find_one({"_id": ObjectId(user_id)})
    except Exception:
        user = await db.users.find_one({"_id": user_id})
    if user is None:
        raise credentials_exception
    if not user.get("is_active", True):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive or suspended user account")
    user["id"] = str(user["_id"])
    return user

async def get_current_admin(
    current_user: dict = Depends(get_current_user)
) -> dict:
    allowed_roles = ["admin", "super_admin", "product_manager", "order_manager"]
    if current_user.get("role") not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Administrative privileges required to access this resource"
        )
    return current_user

def check_admin_roles(allowed_roles: List[str]):
    async def role_checker(admin: dict = Depends(get_current_admin)) -> dict:
        role = admin.get("role")
        # Super admin has unrestricted access to all endpoints
        if role == "super_admin":
            return admin
        if role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Action restricted to roles: {', '.join(allowed_roles)}"
            )
        return admin
    return role_checker

async def record_audit_log(
    db,
    admin: dict,
    action: str,
    resource_type: str,
    resource_id: Optional[str] = None,
    details: Optional[str] = None,
    request: Optional[Request] = None
):
    try:
        ip = request.client.host if request and request.client else None
        log_entry = {
            "admin_id": str(admin.get("_id") or admin.get("id")),
            "admin_email": admin.get("email"),
            "action": action,
            "resource_type": resource_type,
            "resource_id": str(resource_id) if resource_id else None,
            "details": details,
            "ip_address": ip,
            "created_at": datetime.now(timezone.utc)
        }
        await db.audit_logs.insert_one(log_entry)
    except Exception as e:
        print(f"Failed to record audit log: {e}")
