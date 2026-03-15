from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ConversationCreate(BaseModel):
    title: Optional[str] = "New Chat"


class ConversationInDB(BaseModel):
    id: Optional[str]
    user_id: str
    title: str
    created_at: datetime


class MessageCreate(BaseModel):
    conversation_id: str
    role: str
    content: str
