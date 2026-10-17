from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId
from app.api.deps import get_db, get_current_user
from app.core.security import verify_password, get_password_hash, create_access_token
from app.schemas.user import UserCreate, UserLogin, UserResponse, TokenResponse, UserUpdate
from app.schemas.common import ResponseModel

router = APIRouter(prefix="/auth", tags=["Authentication"])

def format_user_response(user: dict) -> UserResponse:
    return UserResponse(
        id=str(user.get("_id") or user.get("id")),
        name=user["name"],
        email=user["email"],
        phone=user.get("phone"),
        role=user.get("role", "customer"),
        is_active=user.get("is_active", True),
        addresses=user.get("addresses", []),
        created_at=user.get("created_at", datetime.now(timezone.utc)),
        updated_at=user.get("updated_at")
    )

@router.post("/register", response_model=TokenResponse)
async def register(user_in: UserCreate, db = Depends(get_db)):
    email_clean = user_in.email.strip().lower()
    existing_user = await db.users.find_one({"email": email_clean})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists"
        )
    
    now = datetime.now(timezone.utc)
    user_doc = {
        "name": user_in.name.strip(),
        "email": email_clean,
        "phone": user_in.phone.strip() if user_in.phone else None,
        "hashed_password": get_password_hash(user_in.password),
        "role": "customer",
        "is_active": True,
        "addresses": [],
        "created_at": now,
        "updated_at": now
    }
    
    result = await db.users.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id
    
    token = create_access_token(subject=str(result.inserted_id), role="customer")
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=format_user_response(user_doc)
    )

@router.post("/login", response_model=TokenResponse)
async def login(login_in: UserLogin, db = Depends(get_db)):
    email_clean = login_in.email.strip().lower()
    user = await db.users.find_one({"email": email_clean})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    if not verify_password(login_in.password, user.get("hashed_password", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
        
    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is suspended. Please contact customer support."
        )
        
    token = create_access_token(
        subject=str(user["_id"]),
        role=user.get("role", "customer")
    )
    
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=format_user_response(user)
    )

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return format_user_response(current_user)

@router.patch("/me", response_model=UserResponse)
async def update_me(
    user_update: UserUpdate,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    update_data = {}
    if user_update.name is not None:
        update_data["name"] = user_update.name.strip()
    if user_update.phone is not None:
        update_data["phone"] = user_update.phone.strip()
    if user_update.addresses is not None:
        # Convert Pydantic models to dicts and assign ID if missing
        address_dicts = []
        for i, addr in enumerate(user_update.addresses):
            d = addr.model_dump()
            if not d.get("id"):
                d["id"] = f"addr_{i}_{int(datetime.now(timezone.utc).timestamp())}"
            address_dicts.append(d)
        update_data["addresses"] = address_dicts
        
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    user_id = ObjectId(current_user["id"]) if ObjectId.is_valid(current_user["id"]) else current_user["id"]
    await db.users.update_one({"_id": user_id}, {"$set": update_data})
    
    updated_user = await db.users.find_one({"_id": user_id})
    return format_user_response(updated_user)
