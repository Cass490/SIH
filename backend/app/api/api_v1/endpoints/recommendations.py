"""
Crop recommendations API endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from pydantic import BaseModel

from app.core.database import get_database
from app.services.ml_service import MLService
from app.services.data_service import DataService

router = APIRouter()


class LocationInput(BaseModel):
    """Location input for recommendations"""
    latitude: float
    longitude: float
    area_hectares: Optional[float] = 1.0


class SoilData(BaseModel):
    """Soil data input"""
    ph: Optional[float] = None
    nitrogen: Optional[float] = None
    phosphorus: Optional[float] = None
    potassium: Optional[float] = None
    organic_carbon: Optional[float] = None
    moisture: Optional[float] = None


class CropRecommendationInput(BaseModel):
    """Input for crop recommendation"""
    location: LocationInput
    soil_data: Optional[SoilData] = None
    budget: Optional[float] = None
    previous_crops: Optional[List[str]] = []
    farming_experience: Optional[str] = "beginner"  # beginner, intermediate, advanced


class CropRecommendation(BaseModel):
    """Crop recommendation output"""
    crop_name: str
    confidence_score: float
    expected_yield_tons_per_hectare: float
    estimated_profit_per_hectare: float
    sustainability_score: float
    water_requirement: str
    growth_duration_days: int
    market_demand: str
    risk_level: str


class RecommendationResponse(BaseModel):
    """Complete recommendation response"""
    recommendations: List[CropRecommendation]
    soil_analysis: dict
    weather_forecast: dict
    market_insights: dict


@router.post("/", response_model=RecommendationResponse)
async def get_crop_recommendations(
    input_data: CropRecommendationInput,
    db=Depends(get_database)
):
    """
    Get personalized crop recommendations based on location, soil, and other factors
    """
    try:
        ml_service = MLService()
        data_service = DataService()
        
        # Get soil data if not provided
        soil_data = input_data.soil_data
        if not soil_data or not all([soil_data.ph, soil_data.nitrogen, soil_data.phosphorus, soil_data.potassium]):
            soil_data = await data_service.get_soil_data(
                input_data.location.latitude, 
                input_data.location.longitude
            )
        
        # Get weather data
        weather_data = await data_service.get_weather_forecast(
            input_data.location.latitude, 
            input_data.location.longitude
        )
        
        # Get market data
        market_data = await data_service.get_market_data(
            input_data.location.latitude, 
            input_data.location.longitude
        )
        
        # Generate recommendations using ML
        recommendations = await ml_service.get_crop_recommendations(
            location=input_data.location,
            soil_data=soil_data,
            weather_data=weather_data,
            market_data=market_data,
            budget=input_data.budget,
            previous_crops=input_data.previous_crops,
            experience=input_data.farming_experience
        )
        
        return RecommendationResponse(
            recommendations=recommendations,
            soil_analysis=soil_data.dict() if hasattr(soil_data, 'dict') else soil_data,
            weather_forecast=weather_data,
            market_insights=market_data
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating recommendations: {str(e)}"
        )


@router.get("/crops", response_model=List[str])
async def get_available_crops():
    """Get list of available crops in the system"""
    ml_service = MLService()
    return await ml_service.get_available_crops()


@router.post("/yield-prediction")
async def predict_yield(
    crop_name: str,
    location: LocationInput,
    soil_data: Optional[SoilData] = None
):
    """Predict yield for a specific crop"""
    try:
        ml_service = MLService()
        data_service = DataService()
        
        if not soil_data:
            soil_data = await data_service.get_soil_data(
                location.latitude, 
                location.longitude
            )
        
        weather_data = await data_service.get_weather_forecast(
            location.latitude, 
            location.longitude
        )
        
        yield_prediction = await ml_service.predict_yield(
            crop_name=crop_name,
            location=location,
            soil_data=soil_data,
            weather_data=weather_data
        )
        
        return yield_prediction
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error predicting yield: {str(e)}"
        )