

from fastapi import APIRouter, HTTPException
from api.database import users_collection
from api.auth import hash_password, verify_password, create_access_token
from api.models.user_model import UserSignup, UserLogin

router = APIRouter()



@router.post("/signup")
async def signup(user: UserSignup):

    existing_user = await users_collection.find_one({"email": user.email})

    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")

    hashed_password = hash_password(user.password)

    await users_collection.insert_one({
        "email": user.email,
        "password": hashed_password
    })

    return {"message": "User created successfully"}



@router.post("/login")
async def login(user: UserLogin):

    db_user = await users_collection.find_one({"email": user.email})

    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid credentials")

    if not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    token = create_access_token({"sub": user.email})

    return {
        "access_token": token,
        "token_type": "bearer"
    }
