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

# ĐỔI TỪ CATEGORY SANG LOCATION (Quận/Huyện TP. HCM)
class PostLocation(str, Enum):
    # Quận 1-12
    district1 = "district1"
    district2 = "district2"
    district3 = "district3"
    district4 = "district4"
    district5 = "district5"
    district6 = "district6"
    district7 = "district7"
    district8 = "district8"
    district9 = "district9"
    district10 = "district10"
    district11 = "district11"
    district12 = "district12"
    
    # Các quận khác
    binh_thanh = "binh_thanh"
    binh_tan = "binh_tan"
    phu_nhuan = "phu_nhuan"
    tan_binh = "tan_binh"
    tan_phu = "tan_phu"
    go_vap = "go_vap"
    
    # TP Thủ Đức
    thu_duc = "thu_duc"
    
    # Huyện
    hoc_mon = "hoc_mon"
    binh_chanh = "binh_chanh"
    nha_be = "nha_be"
    can_gio = "can_gio"
    cu_chi = "cu_chi"

# Post Schemas
class PostBase(BaseModel):
    title: str = Field(..., min_length=5, max_length=255)
    content: str = Field(..., min_length=10)
    location: PostLocation = PostLocation.district1  # Đổi từ category sang location

class PostCreate(PostBase):
    pass

class PostUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=5, max_length=255)
    content: Optional[str] = Field(None, min_length=10)
    location: Optional[PostLocation] = None  # Đổi từ category sang location
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
    likes_count: int          # đổi từ views_count sang likes_count
    replies_count: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Reply Schemas (giữ nguyên)
class ReplyBase(BaseModel):
    content: str = Field(..., min_length=1)

class ReplyCreate(ReplyBase):
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