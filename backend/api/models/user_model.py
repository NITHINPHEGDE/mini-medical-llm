

from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class UserSignup(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserInDB(BaseModel):
    id: Optional[str]
    email: EmailStr
