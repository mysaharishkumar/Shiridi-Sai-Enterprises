import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.db.mongodb import connect_to_mongo, close_mongo_connection, db_manager
from app.db.seed import seed_database

# Public routes
from app.api.routes.auth import router as auth_router
from app.api.routes.categories import router as categories_router
from app.api.routes.products import router as products_router
from app.api.routes.banners import router as banners_router
from app.api.routes.cart import router as cart_router
from app.api.routes.orders import router as orders_router
from app.api.routes.settings import router as settings_router
from app.api.routes.uploads import router as uploads_router
from app.api.routes.inquiries import router as inquiries_router

# Admin routes
from app.api.routes.admin.admin_products import router as admin_products_router
from app.api.routes.admin.admin_categories import router as admin_categories_router
from app.api.routes.admin.admin_banners import router as admin_banners_router
from app.api.routes.admin.admin_orders import router as admin_orders_router
from app.api.routes.admin.admin_users import router as admin_users_router
from app.api.routes.admin.admin_reports import router as admin_reports_router
from app.api.routes.admin.admin_settings import router as admin_settings_router
from app.api.routes.admin.admin_audit_logs import router as admin_audit_logs_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_to_mongo()
    # Check if database needs initial seeding
    try:
        db = db_manager.db
        if db is not None:
            admin_exists = await db.users.find_one({"email": "shiridisaifurnitures1991@gmail.com"})
            if not admin_exists:
                print("Running initial database seeding for Shiridi Sai Enterprises...")
                await seed_database()
    except Exception as e:
        print(f"Startup check warning: {e}")
        
    yield
    # Shutdown
    await close_mongo_connection()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Shiridi Sai Enterprises E-Commerce Storefront & Admin API",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure static uploads directory exists and mount it
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Health Check
@app.get("/health", tags=["Health"])
@app.get(f"{settings.API_V1_STR}/health", tags=["Health"])
async def health_check():
    db_status = "connected" if db_manager.db is not None else "disconnected"
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "database": db_status
    }

# Register API v1 Routers
api_v1 = settings.API_V1_STR
app.include_router(auth_router, prefix=api_v1)
app.include_router(categories_router, prefix=api_v1)
app.include_router(products_router, prefix=api_v1)
app.include_router(banners_router, prefix=api_v1)
app.include_router(cart_router, prefix=api_v1)
app.include_router(orders_router, prefix=api_v1)
app.include_router(settings_router, prefix=api_v1)
app.include_router(uploads_router, prefix=api_v1)
app.include_router(inquiries_router, prefix=api_v1)

# Register Admin Routers
app.include_router(admin_products_router, prefix=api_v1)
app.include_router(admin_categories_router, prefix=api_v1)
app.include_router(admin_banners_router, prefix=api_v1)
app.include_router(admin_orders_router, prefix=api_v1)
app.include_router(admin_users_router, prefix=api_v1)
app.include_router(admin_reports_router, prefix=api_v1)
app.include_router(admin_settings_router, prefix=api_v1)
app.include_router(admin_audit_logs_router, prefix=api_v1)

@app.get("/")
async def root():
    return {
        "message": "Welcome to Shiridi Sai Enterprises API",
        "documentation": "/docs",
        "health": f"{settings.API_V1_STR}/health"
    }
