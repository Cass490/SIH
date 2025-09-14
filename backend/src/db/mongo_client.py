from motor.motor_asyncio import AsyncIOMotorClient
from src.core.config import MONGO_DETAILS

class MongoDB:
    def __init__(self):
        self.client: AsyncIOMotorClient = None
        self.db = None

    async def connect_to_mongo(self):
        print("Connecting to MongoDB Atlas...")
        self.client = AsyncIOMotorClient(MONGO_DETAILS)
        self.db = self.client.sih_database # This is the database name you created
        print("Connection to MongoDB successful.")

    async def close_mongo_connection(self):
        if self.client:
            self.client.close()
            print("MongoDB connection closed.")

# Create a single instance that the rest of your app can import and use
mongodb_client = MongoDB()

# Helper function to get the database instance
def get_database():
    return mongodb_client.db