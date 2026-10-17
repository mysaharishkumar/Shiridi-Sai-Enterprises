import os
import uuid
import aiofiles
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from app.api.deps import get_current_admin
from app.core.config import settings

router = APIRouter(prefix="/uploads", tags=["Uploads"])

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".svg", ".avif"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

@router.post("", response_model=dict)
async def upload_image(
    file: UploadFile = File(...),
    admin: dict = Depends(get_current_admin)
):
    # Validate extension
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )
        
    # Read file content and check size
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds maximum allowed limit of 10MB"
        )
        
    # Check if Cloudinary is configured
    if settings.CLOUDINARY_CLOUD_NAME and settings.CLOUDINARY_API_KEY and settings.CLOUDINARY_API_SECRET:
        try:
            import httpx
            import time
            import hashlib
            
            timestamp = int(time.time())
            params_to_sign = f"timestamp={timestamp}{settings.CLOUDINARY_API_SECRET}"
            signature = hashlib.sha1(params_to_sign.encode("utf-8")).hexdigest()
            
            url = f"https://api.cloudinary.com/v1_1/{settings.CLOUDINARY_CLOUD_NAME}/image/upload"
            files = {"file": (file.filename, content, file.content_type)}
            data = {
                "api_key": settings.CLOUDINARY_API_KEY,
                "timestamp": timestamp,
                "signature": signature
            }
            
            async with httpx.AsyncClient() as client:
                res = await client.post(url, data=data, files=files)
                if res.status_code == 200:
                    data = res.json()
                    return {
                        "url": data.get("secure_url"),
                        "public_id": data.get("public_id"),
                        "filename": file.filename,
                        "storage": "cloudinary"
                    }
        except Exception as e:
            print(f"Cloudinary upload failed, falling back to local static storage: {e}")
            
    # Local storage fallback
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    unique_filename = f"{uuid.uuid4().hex}{file_ext}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)
    
    async with aiofiles.open(file_path, 'wb') as f:
        await f.write(content)
        
    public_url = f"{settings.STATIC_BASE_URL}/{unique_filename}"
    return {
        "url": public_url,
        "public_id": unique_filename,
        "filename": file.filename,
        "storage": "local"
    }
