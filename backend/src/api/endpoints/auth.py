from fastapi import APIRouter, Body, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from src.db.mongo_client import get_database
from src.db.models import CreateUserModel, UserModel
from src.services.auth_service import get_password_hash, verify_password

router = APIRouter()

@router.post("/register", response_model=UserModel, tags=["Authentication"])
async def register_user(
    user_data: CreateUserModel = Body(...),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Creates a new user account."""
    # Check if user already exists
    existing_user = await db["users"].find_one({"phone": user_data.phone})
    if existing_user:
        raise HTTPException(status_code=400, detail="Phone number already registered.")
    
    # Hash the password before storing
    hashed_password = get_password_hash(user_data.password)
    user_dict = user_data.dict()
    user_dict["password"] = hashed_password
    
    new_user = await db["users"].insert_one(user_dict)
    created_user = await db["users"].find_one({"_id": new_user.inserted_id})
    created_user["_id"] = str(created_user["_id"])
    return created_user

@router.post("/login", tags=["Authentication"])
async def login_user(
    phone: str = Body(...),
    password: str = Body(...),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Authenticates a user and returns their details."""
    user = await db["users"].find_one({"phone": phone})
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    
    if not verify_password(password, user["password"]):
        raise HTTPException(status_code=400, detail="Incorrect password.")
    
    user["_id"] = str(user["_id"])
    # Don't send the password back to the frontend
    del user["password"]
    return user