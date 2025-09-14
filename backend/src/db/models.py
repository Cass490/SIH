from pydantic import BaseModel, Field
from typing import List

# A helper class for GeoJSON format
class LocationModel(BaseModel):
    type: str = "Point"
    coordinates: List[float] # [longitude, latitude]

# A helper class for the nested soil properties
class SoilPropertiesModel(BaseModel):
    N: int
    P: int
    K: int
    ph: float = Field(..., gt=0, lt=14) # Add validation: pH must be between 0 and 14

# This is the model for CREATING a new farm (what the frontend will send)
class CreateFarmModel(BaseModel):
    user_id: str
    farm_name: str
    location: LocationModel
    soil_properties: SoilPropertiesModel

# This is the model for RETRIEVING a farm from the DB (includes the auto-generated ID)
class FarmModel(CreateFarmModel):
    id: str = Field(alias="_id") # Map the '_id' field from Mongo to 'id' in our model
    
    class Config:
        populate_by_name = True # Allows using alias="_id"
        json_encoders = {
            # This is needed to handle the ObjectId type from Mongo if you were to use it
            'bson.objectid.ObjectId': str
        }