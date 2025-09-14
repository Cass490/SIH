from fastapi import APIRouter
from pydantic import BaseModel
from src.services import geocoding_service

router = APIRouter()

# Pydantic model for the incoming address data from the frontend
class AddressRequest(BaseModel):
    village: str
    district: str
    pincode: str

@router.post("/geolocate", tags=["Locations"])
def geolocate_address(request: AddressRequest):
    """
    Takes a text-based address and returns approximate geographic coordinates.
    """
    coords = geocoding_service.get_coords_from_address(
        village=request.village,
        district=request.district,
        pincode=request.pincode
    )
    return coords