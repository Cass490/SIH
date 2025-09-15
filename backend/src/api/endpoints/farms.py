from fastapi import APIRouter, Body, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from src.db.mongo_client import get_database
from src.db.models import CreateFarmModel, FarmModel
from typing import List
import json
from bson import ObjectId
from src.services import prediction_service, llm_service, weather_service, soilgrids_service 
from pydantic import BaseModel 
# BSON ObjectId can't be directly used in FastAPI's JSON response, so we need a helper
def serialize_doc(doc):
    doc["_id"] = str(doc["_id"])
    return doc
class ChatMessage(BaseModel):
    message: str
    
router = APIRouter()

@router.post("/farms", response_model=FarmModel, tags=["Farms"])
async def create_farm(
    farm: CreateFarmModel = Body(...),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Creates a new farm in the database.
    """
    farm_dict = farm.dict()
    # MongoDB expects longitude first, then latitude in coordinates
    farm_dict["location"]["coordinates"] = [farm.location.coordinates[0], farm.location.coordinates[1]]
    
    new_farm = await db["farms"].insert_one(farm_dict)
    created_farm = await db["farms"].find_one({"_id": new_farm.inserted_id})
    
    return serialize_doc(created_farm)


@router.get("/farms", response_model=List[FarmModel], tags=["Farms"])
async def get_all_farms_for_user(
    user_id: str, # For now we pass user_id as a query parameter
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Retrieves all farms associated with a specific user_id.
    """
    farms = []
    cursor = db["farms"].find({"user_id": user_id})
    async for farm_doc in cursor:
        farms.append(serialize_doc(farm_doc))
    return farms


# ... (imports at the top of the file)
from src.services import prediction_service, llm_service, weather_service, soilgrids_service # <-- Add ALL services

# ... (create_farm and get_all_farms_for_user functions are unchanged)

@router.get("/farms/{farm_id}/hub", tags=["Farms"])
async def get_farm_hub_data(
    farm_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    The complete 'magic' endpoint. Fetches farm data, gets live weather,
    runs the ML model, and generates a personalized LLM response.
    It uses stored soil data but can fall back to SoilGrids if needed.
    """
    farm = await db["farms"].find_one({"_id": ObjectId(farm_id)})
    if farm is None:
        raise HTTPException(status_code=404, detail=f"Farm with id {farm_id} not found")

    longitude = farm['location']['coordinates'][0]
    latitude = farm['location']['coordinates'][1]

    # --- 1. GET LIVE WEATHER DATA ---
    raw_weather_data = await weather_service.get_weather_forecast(latitude, longitude)
    if not raw_weather_data:
        raise HTTPException(status_code=503, detail="Could not retrieve live weather data.")
    
    live_weather = weather_service.parse_current_weather(raw_weather_data)
    if "error" in live_weather:
        raise HTTPException(status_code=500, detail=live_weather['error'])

    # --- 2. GET SOIL DATA (User's Data is Priority) ---
    soil_properties = farm.get('soil_properties')
    data_source = "User Provided"

    if not soil_properties:
        # **FALLBACK LOGIC**: If user didn't provide soil data, call SoilGrids.
        print(f"No soil data for farm {farm_id}. Falling back to SoilGrids.")
        raw_soilgrids = await soilgrids_service.get_soilgrids_data(latitude, longitude)
        soil_properties = soilgrids_service.parse_soil_properties(raw_soilgrids)
        data_source = "SoilGrids Estimate"
        # CRITICAL NOTE: The output from SoilGrids (e.g., N in cg/kg) might not match the units
        # your XGBoost model was trained on. You MUST normalize/convert these values here.
        # For now, we assume they match for the prototype.
        if not soil_properties or 'N' not in soil_properties:
             raise HTTPException(status_code=500, detail="Could not retrieve estimated soil data.")

    # --- 3. RUN XGBOOST MODEL ---
    recommendation = prediction_service.get_crop_recommendation(
        N=soil_properties['N'],
        P=soil_properties['P'],
        K=soil_properties['K'],
        ph=soil_properties['ph'],
        temperature=live_weather['temperature'],
        humidity=live_weather['humidity'],
        rainfall=live_weather['rainfall']
    )
    
    # --- 4. GENERATE LLM RESPONSE ---
    final_analysis = llm_service.generate_conversational_response(
        xgboost_output=recommendation,
        farm_details=serialize_doc(farm)
    )
    
    return {
        "farm_details": serialize_doc(farm),
        "data_source": {"soil": data_source, "weather": "WeatherAPI.com"},
        "live_weather": live_weather,
        "model_recommendation": recommendation,
        "final_analysis": final_analysis
    }
@router.post("/farms/{farm_id}/chat", tags=["Farms"])
async def handle_chat(
    farm_id: str,
    chat_message: ChatMessage = Body(...),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Handles a follow-up chat message from the user for a specific farm.
    """
    farm = await db["farms"].find_one({"_id": ObjectId(farm_id)})
    if farm is None:
        raise HTTPException(status_code=404, detail=f"Farm with id {farm_id} not found")

    # Call our new LLM service function
    response_text = llm_service.generate_chat_response(
        farm_details=serialize_doc(farm),
        user_message=chat_message.message
    )
    
    return {"response": response_text}
