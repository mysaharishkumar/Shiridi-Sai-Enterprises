import logging
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.core.config import settings

logger = logging.getLogger("shiridi_sai.db")

class DatabaseManager:
    client: AsyncIOMotorClient = None
    db: AsyncIOMotorDatabase = None

db_manager = DatabaseManager()

async def connect_to_mongo():
    logger.info(f"Connecting to MongoDB at {settings.MONGODB_URI} (Database: {settings.DATABASE_NAME})...")
    try:
        db_manager.client = AsyncIOMotorClient(
            settings.MONGODB_URI,
            serverSelectionTimeoutMS=5000
        )
        db_manager.db = db_manager.client[settings.DATABASE_NAME]
        # Ping to test connection
        await db_manager.client.admin.command('ping')
        logger.info("Successfully connected to MongoDB!")
        await create_indexes()
    except Exception as e:
        logger.warning(f"Could not connect to MongoDB or initialize indexes: {e}")

async def close_mongo_connection():
    if db_manager.client:
        logger.info("Closing MongoDB connection...")
        db_manager.client.close()
        logger.info("MongoDB connection closed.")

async def create_indexes():
    if db_manager.db is None:
        return
    db = db_manager.db
    try:
        # Users indexes
        await db.users.create_index("email", unique=True)
        await db.users.create_index("role")
        
        # Categories indexes
        await db.categories.create_index("slug", unique=True)
        await db.categories.create_index("display_order")
        await db.categories.create_index("is_active")
        
        # Products indexes
        await db.products.create_index("slug", unique=True)
        await db.products.create_index("sku")
        await db.products.create_index("category_id")
        await db.products.create_index("is_published")
        await db.products.create_index("is_featured")
        await db.products.create_index("is_best_seller")
        await db.products.create_index("selling_price")
        # Text index for search
        try:
            await db.products.create_index([
                ("name", "text"),
                ("description", "text"),
                ("brand", "text"),
                ("material", "text"),
                ("category_name", "text")
            ])
        except Exception:
            pass
            
        # Banners indexes
        await db.banners.create_index("display_order")
        await db.banners.create_index("is_active")
        
        # Orders indexes
        await db.orders.create_index("order_number", unique=True)
        await db.orders.create_index("user_id")
        await db.orders.create_index("order_status")
        await db.orders.create_index("created_at")
        
        # Audit logs indexes
        await db.audit_logs.create_index("created_at")
        await db.audit_logs.create_index("admin_id")
        
        logger.info("Database indexes successfully ensured.")
    except Exception as e:
        logger.warning(f"Error while creating database indexes: {e}")

def get_database() -> AsyncIOMotorDatabase:
    return db_manager.db
