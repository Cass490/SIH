"""
Authentication API endpoints
"""

from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta

from ....core.auth import (
    authenticate_user, 
    create_access_token, 
    create_user,
    get_current_user
)
from ....core.config import settings
from ....models.models import Token, User, UserCreate

router = APIRouter()


@router.post("/signup", response_model=dict)
async def signup(user_data: UserCreate):
    """
    Create new user account
    """
    try:
        user = await create_user(
            email=user_data.email,
            name=user_data.name,
            password=user_data.password
        )
        
        # Create access token
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user["email"]}, 
            expires_delta=access_token_expires
        )
        
        # Return user data and token
        return {
            "user": {
                "id": str(user["_id"]),
                "email": user["email"],
                "name": user["name"],
                "created_at": user["created_at"].isoformat()
            },
            "token": access_token
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating user: {str(e)}"
        )


@router.post("/login", response_model=dict)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    user = await authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"]}, 
        expires_delta=access_token_expires
    )
    
    return {
        "user": {
            "id": str(user["_id"]),
            "email": user["email"],
            "name": user["name"],
            "created_at": user["created_at"].isoformat()
        },
        "token": access_token
    }


@router.post("/login-email", response_model=dict)
async def login_with_email(login_data: dict):
    """
    Login with email and password (for web frontend)
    """
    email = login_data.get("email")
    password = login_data.get("password")
    
    if not email or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email and password are required"
        )
    
    user = await authenticate_user(email, password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"]}, 
        expires_delta=access_token_expires
    )
    
    return {
        "user": {
            "id": str(user["_id"]),
            "email": user["email"],
            "name": user["name"],
            "created_at": user["created_at"].isoformat()
        },
        "token": access_token
    }


@router.get("/profile", response_model=User)
async def get_user_profile(current_user: User = Depends(get_current_user)):
    """
    Get current user profile
    """
    return current_user