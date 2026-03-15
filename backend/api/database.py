# backend/api/database.py

from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL")

if not MONGO_URL:
    raise RuntimeError("MONGO_URL not set in .env")

# Create Mongo client
client = AsyncIOMotorClient(MONGO_URL)

# Database name
db = client["medical_minillm"]

# Collections
users_collection = db["users"]

# NEW COLLECTIONS
conversations_collection = db["conversations"]
messages_collection = db["messages"]
