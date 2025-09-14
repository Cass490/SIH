from fastapi import FastAPI
from src.api.endpoints import predict, locations # <-- IMPORT 'locations'

app = FastAPI(title="Green Waves SIH 2025 API")

# Include the routers from the endpoint files
app.include_router(predict.router, prefix="/api") 
app.include_router(locations.router, prefix="/api") # <-- ADD THIS LINE

@app.get("/")
def read_root():
    return {"message": "Welcome to the Green Waves Backend!"}

# You will also have your MongoDB connection logic here
# @app.on_event("startup")
# async def startup_db_client():
#     await mongodb_client.connect_to_mongo()

# @app.on_event("shutdown")
# async def shutdown_db_client():
#     await mongodb_client.close_mongo_connection()