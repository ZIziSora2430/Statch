# ========================================
# FILE: feature_login/schemas.py
# ========================================
from pydantic import BaseModel, EmailStr, ConfigDict
from enum import Enum

# Enum cho role (khớp với models.UserRole)
class RoleEnum(str, Enum):
    traveler = "traveler"
    owner = "owner"
    admin = "admin"

# Schema để tạo user
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: RoleEnum = RoleEnum.traveler
    full_name: str | None = None

# Schema để trả về user
class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    role: RoleEnum
    full_name: str | None = None

    model_config = ConfigDict(from_attributes=True)  # ✅ Pydantic v2 syntax

# Schema đăng nhập
class UserLogin(BaseModel):
    username: str
    password: str

# Schema token trả về khi login
class Token(BaseModel):
    access_token: str
    token_type: str
    role: RoleEnum

# Schema để update user
class UserUpdate(BaseModel):
    email: EmailStr | None = None
    full_name: str | None = None