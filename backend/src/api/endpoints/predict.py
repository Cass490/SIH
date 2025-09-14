from fastapi import APIRouter
from pydantic import BaseModel
from src.services import prediction_service

router = APIRouter()

# Pydantic model to define the structure of the incoming request data
# This provides automatic data validation
class CropRequest(BaseModel):
    N: int
    P: int
    K: int
    temperature: float
    humidity: float
    ph: float
    rainfall: float

@router.post("/recommend", tags=["Prediction"])
def recommend_crop(request: CropRequest):
    """
    Takes soil and weather data and returns the best crop recommendation.
    """
    recommendation = prediction_service.get_crop_recommendation(
        N=request.N,
        P=request.P,
        K=request.K,
        temperature=request.temperature,
        humidity=request.humidity,
        ph=request.ph,
        rainfall=request.rainfall
    )
    return recommendation