from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from datetime import datetime
from api.auth import get_current_user
from api.database import conversations_collection, messages_collection
from api.models.chat_model import ConversationCreate, MessageCreate

router = APIRouter(prefix="/chat", tags=["chat"])

@router.post("/new")
async def create_conversation(
    data: ConversationCreate,
    current_user: str = Depends(get_current_user)
):
    result = await conversations_collection.insert_one({
        "user_id": current_user,
        "title": data.title or "New Chat",
        "created_at": datetime.utcnow()
    })

    return {"conversation_id": str(result.inserted_id)}

@router.get("/all")
async def get_conversations(current_user: str = Depends(get_current_user)):
    conversations = []
    async for convo in conversations_collection.find({"user_id": current_user}):
        conversations.append({
            "id": str(convo["_id"]),
            "title": convo["title"]
        })
    return conversations

@router.put("/rename/{conversation_id}")
async def rename_conversation(
    conversation_id: str,
    data: ConversationCreate,
    current_user: str = Depends(get_current_user)
):
    await conversations_collection.update_one(
        {"_id": ObjectId(conversation_id), "user_id": current_user},
        {"$set": {"title": data.title}}
    )
    return {"message": "Updated"}

@router.post("/message")
async def save_message(
    data: MessageCreate,
    current_user: str = Depends(get_current_user)
):
    await messages_collection.insert_one({
        "conversation_id": data.conversation_id,
        "role": data.role,
        "content": data.content,
        "created_at": datetime.utcnow()
    })

    return {"message": "Saved"}

@router.get("/messages/{conversation_id}")
async def get_messages(conversation_id: str, current_user: str = Depends(get_current_user)):
    messages = []
    async for msg in messages_collection.find({"conversation_id": conversation_id}):
        messages.append({
            "role": msg["role"],
            "content": msg["content"]
        })
    return messages
