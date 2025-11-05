# app/accommodations/schemas.py
from pydantic import BaseModel
from typing import Optional
from decimal import Decimal # Sử dụng Decimal cho giá

# --- Schema cho dữ liệu ĐẦU VÀO (từ React form) ---
class AccommodationCreate(BaseModel):
    title: str               # "Tên chỗ ở"
    location: str            # "Địa chỉ"
    price: Decimal           # "Giá (VNĐ/Đêm)"
    max_guests: int          # "Số khách tối đa"
    property_type: str       # "Loại chỗ ở"
    description: Optional[str] = None # "Mô tả"
    picture_url: str         # "UPLOAD ẢNH" (URL từ Cloudinary)

    class Config:
        orm_mode = True

# --- Schema cho dữ liệu ĐẦU RA (trả về cho React) ---
class AccommodationRead(AccommodationCreate):
    accommodation_id: int
    owner_id: int
    status: str # Trả về status (mặc định là 'available')

    class Config:
        orm_mode = True