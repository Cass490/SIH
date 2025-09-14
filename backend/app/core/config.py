"""
Configuration settings for the AgriAI Decision Support System
"""

from pydantic_settings import BaseSettings
from typing import List, Optional
import os


class Settings(BaseSettings):
    """Application settings"""
    
    # Project Information
    PROJECT_NAME: str = "AgriAI Decision Support System"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Server Configuration
    SERVER_HOST: str = "0.0.0.0"
    SERVER_PORT: int = 8000
    DEBUG: bool = True
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-change-this-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",  # React Native dev server
        "http://localhost:8080",  # Alternative dev server
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8080",
    ]
    
    ALLOWED_HOSTS: List[str] = ["*"]
    
    # Database
    MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "agriai")
    
    # Use SQLite for local development
    USE_SQLITE: bool = os.getenv("USE_SQLITE", "true").lower() == "true"
    
    # Legacy database settings (keeping for compatibility)
    DATABASE_URL: str = "sqlite:///./agriai.db"
    POSTGRES_SERVER: Optional[str] = None
    POSTGRES_USER: Optional[str] = None
    POSTGRES_PASSWORD: Optional[str] = None
    POSTGRES_DB: Optional[str] = None
    
    # External APIs
    OPENWEATHER_API_KEY: Optional[str] = None
    SOIL_GRIDS_API_URL: str = "https://rest.isric.org/soilgrids/v2.0"
    BHUVAN_API_KEY: Optional[str] = None
    
    # ML Models
    MODEL_PATH: str = "../ml-models"
    CROP_MODEL_PATH: str = f"{MODEL_PATH}/crop_recommendation.joblib"
    YIELD_MODEL_PATH: str = f"{MODEL_PATH}/yield_prediction.joblib"
    
    # Redis (for caching and task queue)
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    CACHE_EXPIRE_SECONDS: int = 3600  # 1 hour
    
    # File Upload
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    UPLOAD_PATH: str = "./uploads"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()