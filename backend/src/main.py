from fastapi import FastAPI
from src.api.endpoints import predict, locations, farms # <-- IMPORT 'farms'
from src.db.mongo_client import mongodb_client

app = FastAPI(title="Green Waves SIH 2025 API")

# Add startup and shutdown event handlers for the database connection
@app.on_event("startup")
async def startup_db_client():
    await mongodb_client.connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_db_client():
    await mongodb_client.close_mongo_connection()

# Include all the routers from your endpoint files
app.include_router(predict.router, prefix="/api") 
app.include_router(locations.router, prefix="/api")
app.include_router(farms.router, prefix="/api") # <-- ADD THIS LINE

@app.get("/")
def read_root():
    return {"message": "Welcome to the Green Waves Backend! Now with MongoDB integration."}