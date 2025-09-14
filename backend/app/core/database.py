"""
MongoDB database configuration and connection management
"""

from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional
from .config import settings


class Database:
    client: Optional[AsyncIOMotorClient] = None
    database = None


db = Database()


async def connect_to_mongo():
    """Create database connection"""
    db.client = AsyncIOMotorClient(settings.MONGODB_URL)
    db.database = db.client[settings.DATABASE_NAME]
    
    # Test the connection
    try:
        await db.client.admin.command('ping')
        print("Successfully connected to MongoDB!")
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")
        raise


async def close_mongo_connection():
    """Close database connection"""
    if db.client:
        db.client.close()


def get_database():
    """Get database instance"""
    return db.database


async def create_tables():
    """Create database collections and indexes"""
    database = get_database()
    
    # Create indexes for better performance
    if database:
        # Users collection indexes
        await database.users.create_index("email", unique=True)
        
        # Farms collection indexes
        await database.farms.create_index("userId")
        await database.farms.create_index(["latitude", "longitude"])
        
        print("Database indexes created successfully!")
