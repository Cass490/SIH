"""
AgriAI Decision Support System - Backend API
Main application entry point for the FastAPI backend service.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from contextlib import asynccontextmanager
import uvicorn
from loguru import logger

from app.core.config import settings
from app.api.api_v1.api import api_router
from app.core.database import create_tables, connect_to_mongo, close_mongo_connection


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    logger.info("Starting AgriAI Decision Support System API...")
    
    # Connect to MongoDB
    await connect_to_mongo()
    logger.info("Connected to MongoDB successfully")
    
    # Create database tables
    await create_tables()
    logger.info("Database tables created successfully")
    
    yield
    
    # Close database connection
    await close_mongo_connection()
    logger.info("Shutting down AgriAI Decision Support System API...")


# Create FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI-driven agricultural decision support system providing personalized crop recommendations",
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# Set up CORS middleware
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Add trusted host middleware for security
app.add_middleware(
    TrustedHostMiddleware, 
    allowed_hosts=settings.ALLOWED_HOSTS
)

# Include API router
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "AgriAI Decision Support System API",
        "version": settings.VERSION,
        "docs": f"{settings.API_V1_STR}/docs",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "agriai-backend"}


@app.get("/test-login")
async def test_login():
    """Test endpoint that returns a dummy user and token for testing"""
    from app.core.auth import create_access_token
    from datetime import timedelta
    
    # Create a dummy user token
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": "test@example.com"}, 
        expires_delta=access_token_expires
    )
    
    return {
        "user": {
            "id": "test-user-123",
            "email": "test@example.com",
            "name": "Test User",
            "created_at": "2024-01-01T00:00:00Z"
        },
        "token": access_token
    }


if __name__ == "__main__":
    logger.info(f"Starting server on {settings.SERVER_HOST}:{settings.SERVER_PORT}")
    uvicorn.run(
        "main:app",
        host=settings.SERVER_HOST,
        port=settings.SERVER_PORT,
        reload=settings.DEBUG,
        log_level="info"
    )