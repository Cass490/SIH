# --- IMPORTS ---
from fastapi import APIRouter, Body, Depends, HTTPException, UploadFile, File
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import BaseModel
from typing import List
from bson import ObjectId

# Import your database client and models
from src.db.mongo_client import get_database
from src.db.models import CreateFarmModel, FarmModel

# Import all your services
from src.services import prediction_service, llm_service, weather_service, soilgrids_service

# --- Pydantic Models for this Endpoint ---

# This is the NEW ChatMessage model that includes language
class ChatMessage(BaseModel):
    message: str
    language: str = "en"  # Default to English

# --- Helper Function ---

# BSON ObjectId can't be directly used in FastAPI's JSON response, so we need a helper
def serialize_doc(doc):
    if doc and "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc

# --- API Router ---

router = APIRouter()

# --- FARM CRUD ENDPOINTS ---

@router.post("/farms", response_model=FarmModel, tags=["Farms"])
async def create_farm(
    farm: CreateFarmModel = Body(...),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Creates a new farm in the database."""
    farm_dict = farm.dict()
    farm_dict["location"]["coordinates"] = [farm.location.coordinates[0], farm.location.coordinates[1]]
    
    new_farm = await db["farms"].insert_one(farm_dict)
    created_farm = await db["farms"].find_one({"_id": new_farm.inserted_id})
    
    return serialize_doc(created_farm)

@router.get("/farms", response_model=List[FarmModel], tags=["Farms"])
async def get_all_farms_for_user(
    user_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Retrieves all farms associated with a specific user_id."""
    farms = []
    cursor = db["farms"].find({"user_id": user_id})
    async for farm_doc in cursor:
        farms.append(serialize_doc(farm_doc))
    return farms

# --- THE "MAGIC" HUB ENDPOINT ---

@router.get("/farms/{farm_id}/hub", tags=["Farms"])
async def get_farm_hub_data(
    farm_id: str,
    lang: str = "en", # Default to English if not provided
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    The complete 'magic' endpoint. Fetches farm data, gets live weather,
    runs the ML model, and generates a personalized LLM response.
    """
    farm = await db["farms"].find_one({"_id": ObjectId(farm_id)})
    if farm is None:
        raise HTTPException(status_code=404, detail=f"Farm with id {farm_id} not found")

    longitude = farm['location']['coordinates'][0]
    latitude = farm['location']['coordinates'][1]

    # 1. Get Live Weather Data
    raw_weather_data = await weather_service.get_weather_forecast(latitude, longitude)
    if not raw_weather_data:
        raise HTTPException(status_code=503, detail="Could not retrieve live weather data.")
    
    live_weather = weather_service.parse_current_weather(raw_weather_data)
    if "error" in live_weather:
        raise HTTPException(status_code=500, detail=live_weather['error'])

    # 2. Get Soil Data (with fallback)
    soil_properties = farm.get('soil_properties')
    data_source = "User Provided"
    if not soil_properties:
        raw_soilgrids = await soilgrids_service.get_soilgrids_data(latitude, longitude)
        soil_properties = soilgrids_service.parse_soil_properties(raw_soilgrids)
        data_source = "SoilGrids Estimate"
        if not soil_properties or 'N' not in soil_properties or 'ph' not in soil_properties:
             raise HTTPException(status_code=500, detail="Could not retrieve estimated soil data.")

    # 3. Run XGBoost Model
    recommendation = prediction_service.get_crop_recommendation(
        N=soil_properties.get('N', 0), P=soil_properties.get('P', 0),
        K=soil_properties.get('K', 0), ph=soil_properties.get('ph', 7.0),
        temperature=live_weather['temperature'],
        humidity=live_weather['humidity'],
        rainfall=live_weather['rainfall']
    )
    
    # 4. Generate LLM Response
    final_analysis = llm_service.generate_conversational_response(
        xgboost_output=recommendation,
        farm_details=serialize_doc(farm),language=lang
    )
    
    return {
        "farm_details": serialize_doc(farm),
        "data_source": {"soil": data_source, "weather": "WeatherAPI.com"},
        "live_weather": live_weather,
        "model_recommendation": recommendation,
        "final_analysis": final_analysis
    }

# --- INTERACTIVE CHAT ENDPOINTS ---

@router.post("/farms/{farm_id}/chat", tags=["Farms"])
async def handle_chat(
    farm_id: str,
    chat_message: ChatMessage = Body(...), # <-- Uses the NEW ChatMessage model
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Handles a follow-up chat message from the user for a specific farm."""
    farm = await db["farms"].find_one({"_id": ObjectId(farm_id)})
    if farm is None:
        raise HTTPException(status_code=404, detail=f"Farm with id {farm_id} not found")

    # Call the LLM service with the new language parameter
    response_text = llm_service.generate_chat_response(
        farm_details=serialize_doc(farm),
        user_message=chat_message.message,
        language=chat_message.language # <-- Passes the language to the service
    )
    
    return {"response": response_text}

@router.post("/farms/{farm_id}/diagnose", tags=["Farms"])
async def diagnose_disease(
    farm_id: str, # We include this to know which farm has the issue
    file: UploadFile = File(...)
):
    """Accepts a crop image, simulates a diagnosis, and returns an LLM analysis."""
    # Placeholder for the real Computer Vision model
    disease_prediction = "Tomato_Late_Blight" 
    
    prompt = f"A farmer has uploaded an image and our AI model has identified the disease as '{disease_prediction}'. Explain what this disease is and suggest 2-3 simple, actionable treatment steps. Keep the language very simple. Generate the response in English."
    
    try:
        response = llm_service.llm.generate_content(prompt)
        analysis = response.text
    except Exception as e:
        print(f"Error during disease diagnosis explanation: {e}")
        analysis = "Our analysis model identified a potential issue, but I'm having trouble retrieving the details right now."

    return {"disease_detected": disease_prediction, "analysis": analysis}