"""
MongoDB models for the AgriAI Decision Support System
"""

from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime
from bson import ObjectId


class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema):
        field_schema.update(type="string")
        return field_schema


class UserBase(BaseModel):
    email: EmailStr
    name: str


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    name: Optional[str] = None


class UserInDB(UserBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
        json_schema_extra = {
            "example": {
                "email": "farmer@example.com",
                "name": "John Farmer",
            }
        }


class User(UserBase):
    id: str = Field(alias="_id")
    created_at: datetime

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}


class FarmBase(BaseModel):
    farm_name: str = Field(..., alias="farmName")
    latitude: float
    longitude: float
    nitrogen: float
    phosphorus: float
    potassium: float
    ph: float = Field(..., alias="pH")


class FarmCreate(FarmBase):
    pass


class FarmUpdate(BaseModel):
    farm_name: Optional[str] = Field(None, alias="farmName")
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    nitrogen: Optional[float] = None
    phosphorus: Optional[float] = None
    potassium: Optional[float] = None
    ph: Optional[float] = Field(None, alias="pH")


class FarmInDB(FarmBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: PyObjectId = Field(..., alias="userId")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
        json_schema_extra = {
            "example": {
                "farmName": "North Field",
                "latitude": 40.7128,
                "longitude": -74.0060,
                "nitrogen": 85,
                "phosphorus": 45,
                "potassium": 40,
                "pH": 6.5
            }
        }


class Farm(FarmBase):
    id: str = Field(alias="_id")
    user_id: str = Field(alias="userId")
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}


class CropRecommendation(BaseModel):
    crop_name: str
    confidence: float
    expected_yield: float
    estimated_profit: float
    water_requirement: str
    growth_duration: int
    planting_season: str
    market_demand: str
    risk_factors: List[str]
    recommendations: List[str]


class RecommendationResponse(BaseModel):
    farm_id: str
    recommendations: List[CropRecommendation]
    generated_at: datetime
    model_version: str


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None