"""
API router for AgriAI Decision Support System
"""

from fastapi import APIRouter

from .endpoints import recommendations, auth, farms

api_router = APIRouter()

# Include routers for different endpoints
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(farms.router, prefix="/farms", tags=["farms"])
api_router.include_router(recommendations.router, prefix="/recommendations", tags=["recommendations"])
