"""
Farm management API endpoints
"""

from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from datetime import datetime
from bson import ObjectId

from ....core.auth import get_current_user
from ....core.database import get_database
from ....models.models import User, Farm, FarmCreate, FarmUpdate

router = APIRouter()


@router.post("/", response_model=Farm)
async def create_farm(
    farm_data: FarmCreate,
    current_user: User = Depends(get_current_user)
):
    """
    Create a new farm for the current user
    """
    database = get_database()
    
    # Create farm document
    farm_doc = {
        "userId": ObjectId(current_user.id),
        "farmName": farm_data.farm_name,
        "latitude": farm_data.latitude,
        "longitude": farm_data.longitude,
        "nitrogen": farm_data.nitrogen,
        "phosphorus": farm_data.phosphorus,
        "potassium": farm_data.potassium,
        "pH": farm_data.ph,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    try:
        result = await database.farms.insert_one(farm_doc)
        farm_doc["_id"] = result.inserted_id
        
        # Convert to response format
        return Farm(
            id=str(farm_doc["_id"]),
            user_id=str(farm_doc["userId"]),
            farm_name=farm_doc["farmName"],
            latitude=farm_doc["latitude"],
            longitude=farm_doc["longitude"],
            nitrogen=farm_doc["nitrogen"],
            phosphorus=farm_doc["phosphorus"],
            potassium=farm_doc["potassium"],
            ph=farm_doc["pH"],
            created_at=farm_doc["created_at"],
            updated_at=farm_doc["updated_at"]
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating farm: {str(e)}"
        )


@router.get("/", response_model=List[Farm])
async def get_user_farms(current_user: User = Depends(get_current_user)):
    """
    Get all farms for the current user
    """
    database = get_database()
    
    try:
        farms_cursor = database.farms.find({"userId": ObjectId(current_user.id)})
        farms = []
        
        async for farm_doc in farms_cursor:
            farm = Farm(
                id=str(farm_doc["_id"]),
                user_id=str(farm_doc["userId"]),
                farm_name=farm_doc["farmName"],
                latitude=farm_doc["latitude"],
                longitude=farm_doc["longitude"],
                nitrogen=farm_doc["nitrogen"],
                phosphorus=farm_doc["phosphorus"],
                potassium=farm_doc["potassium"],
                ph=farm_doc["pH"],
                created_at=farm_doc["created_at"],
                updated_at=farm_doc["updated_at"]
            )
            farms.append(farm)
        
        return farms
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving farms: {str(e)}"
        )


@router.get("/{farm_id}", response_model=Farm)
async def get_farm(
    farm_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Get a specific farm by ID
    """
    database = get_database()
    
    try:
        farm_doc = await database.farms.find_one({
            "_id": ObjectId(farm_id),
            "userId": ObjectId(current_user.id)
        })
        
        if not farm_doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Farm not found"
            )
        
        return Farm(
            id=str(farm_doc["_id"]),
            user_id=str(farm_doc["userId"]),
            farm_name=farm_doc["farmName"],
            latitude=farm_doc["latitude"],
            longitude=farm_doc["longitude"],
            nitrogen=farm_doc["nitrogen"],
            phosphorus=farm_doc["phosphorus"],
            potassium=farm_doc["potassium"],
            ph=farm_doc["pH"],
            created_at=farm_doc["created_at"],
            updated_at=farm_doc["updated_at"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving farm: {str(e)}"
        )


@router.put("/{farm_id}", response_model=Farm)
async def update_farm(
    farm_id: str,
    farm_update: FarmUpdate,
    current_user: User = Depends(get_current_user)
):
    """
    Update a farm
    """
    database = get_database()
    
    try:
        # Check if farm exists and belongs to user
        existing_farm = await database.farms.find_one({
            "_id": ObjectId(farm_id),
            "userId": ObjectId(current_user.id)
        })
        
        if not existing_farm:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Farm not found"
            )
        
        # Prepare update data
        update_data = {"updated_at": datetime.utcnow()}
        if farm_update.farm_name is not None:
            update_data["farmName"] = farm_update.farm_name
        if farm_update.latitude is not None:
            update_data["latitude"] = farm_update.latitude
        if farm_update.longitude is not None:
            update_data["longitude"] = farm_update.longitude
        if farm_update.nitrogen is not None:
            update_data["nitrogen"] = farm_update.nitrogen
        if farm_update.phosphorus is not None:
            update_data["phosphorus"] = farm_update.phosphorus
        if farm_update.potassium is not None:
            update_data["potassium"] = farm_update.potassium
        if farm_update.ph is not None:
            update_data["pH"] = farm_update.ph
        
        # Update farm
        await database.farms.update_one(
            {"_id": ObjectId(farm_id)},
            {"$set": update_data}
        )
        
        # Get updated farm
        updated_farm = await database.farms.find_one({"_id": ObjectId(farm_id)})
        
        return Farm(
            id=str(updated_farm["_id"]),
            user_id=str(updated_farm["userId"]),
            farm_name=updated_farm["farmName"],
            latitude=updated_farm["latitude"],
            longitude=updated_farm["longitude"],
            nitrogen=updated_farm["nitrogen"],
            phosphorus=updated_farm["phosphorus"],
            potassium=updated_farm["potassium"],
            ph=updated_farm["pH"],
            created_at=updated_farm["created_at"],
            updated_at=updated_farm["updated_at"]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating farm: {str(e)}"
        )


@router.delete("/{farm_id}")
async def delete_farm(
    farm_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Delete a farm
    """
    database = get_database()
    
    try:
        # Check if farm exists and belongs to user
        existing_farm = await database.farms.find_one({
            "_id": ObjectId(farm_id),
            "userId": ObjectId(current_user.id)
        })
        
        if not existing_farm:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Farm not found"
            )
        
        # Delete farm
        await database.farms.delete_one({"_id": ObjectId(farm_id)})
        
        return {"message": "Farm deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting farm: {str(e)}"
        )