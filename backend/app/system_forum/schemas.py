# system_forum/schemas.py
"""
Pydantic schemas cho Forum
KHÔNG CÓ NESTED REPLIES
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum

# Forum Enums
class PostStatus(str, Enum):
    active = "active"
    hidden = "hidden"
    deleted = "deleted"

class PostCategory(str, Enum):
    general = "general"
    tips = "tips"
    questions = "questions"
    reviews = "reviews"
    stories = "stories"

# Post Schemas
class PostBase(BaseModel):
    title: str = Field(..., min_length=5, max_length=255)
    content: str = Field(..., min_length=10)
    category: PostCategory = PostCategory.general

class PostCreate(PostBase):
    pass

class PostUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=5, max_length=255)
    content: Optional[str] = Field(None, min_length=10)
    category: Optional[PostCategory] = None
    status: Optional[PostStatus] = None

class PostAuthor(BaseModel):
    id: int
    username: str
    is_verified_traveler: bool
    
    class Config:
        from_attributes = True

class PostResponse(PostBase):
    id: int
    user_id: int
    author: Optional[PostAuthor] = None
    status: PostStatus
    views_count: int
    replies_count: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Reply Schemas
class ReplyBase(BaseModel):
    content: str = Field(..., min_length=1)

class ReplyCreate(ReplyBase):
    """
    Schema để tạo reply
    KHÔNG CÓ parent_reply_id (không hỗ trợ nested replies)
    """
    pass

class ReplyUpdate(BaseModel):
    content: Optional[str] = Field(None, min_length=1)
    status: Optional[PostStatus] = None

class ReplyAuthor(BaseModel):
    id: int
    username: str
    is_verified_traveler: bool
    
    class Config:
        from_attributes = True

class ReplyResponse(ReplyBase):
    id: int
    post_id: int
    user_id: int
    author: Optional[ReplyAuthor] = None
    status: PostStatus
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Verified Traveler Status
class VerifiedTravelerStatus(BaseModel):
    is_verified: bool
    bookings_count: int
    message: str