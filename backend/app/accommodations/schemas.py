# app/accommodations/schemas.py
from pydantic import BaseModel, ConfigDict
from typing import Optional
from decimal import Decimal # Sử dụng Decimal cho giá

class GenerateDescRequest(BaseModel):
    title: str
    property_type: str
    location: str
    features: str = "" # Ví dụ: "Wifi mạnh, gần chợ, có hồ bơi"

# --- Schema cho dữ liệu ĐẦU VÀO (từ React form) ---
class AccommodationCreate(BaseModel):
    title: str               # "Tên chỗ ở"
    location: str            # "Địa chỉ"
    price: Decimal           # "Giá (VNĐ/Đêm)"
    max_guests: int          # "Số khách tối đa"
    property_type: str       # "Loại chỗ ở"
    description: Optional[str] = None # "Mô tả"
    picture_url: str         # "UPLOAD ẢNH" (URL từ Cloudinary)


    latitude: Decimal
    longitude: Decimal

    class Config: 
        model_config=ConfigDict(from_attributes=True)


# --- Schema cho dữ liệu ĐẦU RA (trả về cho React) ---
class AccommodationRead(AccommodationCreate):
    accommodation_id: int
    owner_id: int
    status: str # Trả về status (mặc định là 'available')
    tags: Optional[str] = None

    latitude: Optional[Decimal] = None
    longitude: Optional[Decimal] = None
    
    # Mặc định None vì không lưu trong DB, chỉ AI tạo ra tức thời
    match_score: Optional[int] = None
    match_reason: Optional[str] = None
    class Config: 
        model_config=ConfigDict(from_attributes=True)

# Dùng cho việc Cập nhật (Edit)
class AccommodationUpdate(BaseModel):
    # Tất cả các trường đều là Optional khi cập nhật
    title: Optional[str] = None
    location: Optional[str] = None
    price: Optional[Decimal] = None
    max_guests: Optional[int] = None
    property_type: Optional[str] = None
    description: Optional[str] = None
    picture_url: Optional[str] = None
    status: Optional[str] = None # Thêm status để owner có thể đổi

    latitude: Optional[Decimal] = None
    longitude: Optional[Decimal] = None

    model_config=ConfigDict(from_attributes=True)



