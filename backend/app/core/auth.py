"""
Authentication utilities for JWT token handling and password hashing
"""

from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from .config import settings
from .database import get_database
from ..models.models import User, TokenData
from bson import ObjectId

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT token security
security = HTTPBearer()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Generate password hash"""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


async def get_user_by_email(email: str) -> Optional[dict]:
    """Get user from database by email"""
    database = get_database()
    user = await database.users.find_one({"email": email})
    return user


async def get_user_by_id(user_id: str) -> Optional[dict]:
    """Get user from database by ID"""
    database = get_database()
    user = await database.users.find_one({"_id": ObjectId(user_id)})
    return user


async def authenticate_user(email: str, password: str) -> Optional[dict]:
    """Authenticate user with email and password"""
    user = await get_user_by_email(email)
    if not user:
        return None
    if not verify_password(password, user["hashed_password"]):
        return None
    return user


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> User:
    """Get current authenticated user from JWT token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(
            credentials.credentials, 
            settings.SECRET_KEY, 
            algorithms=[settings.ALGORITHM]
        )
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
    
    user = await get_user_by_email(email=token_data.email)
    if user is None:
        raise credentials_exception
    
    # Convert MongoDB document to User model
    user_dict = dict(user)
    user_dict["id"] = str(user_dict["_id"])
    return User(**user_dict)


async def create_user(email: str, name: str, password: str) -> dict:
    """Create new user in database"""
    database = get_database()
    
    # Check if user already exists
    existing_user = await get_user_by_email(email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user document
    user_data = {
        "email": email,
        "name": name,
        "hashed_password": get_password_hash(password),
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await database.users.insert_one(user_data)
    user_data["_id"] = result.inserted_id
    
    return user_data