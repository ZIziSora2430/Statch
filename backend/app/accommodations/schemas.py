# app/accommodations/schemas.py
from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from decimal import Decimal # Sử dụng Decimal cho giá
from datetime import date

class OwnerInfo(BaseModel):
    full_name: str
    email: str
    phone: Optional[str] = None 
    class Config: 
        model_config = ConfigDict(from_attributes=True)

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
    owner: Optional[OwnerInfo] = None

    latitude: Optional[Decimal] = None
    longitude: Optional[Decimal] = None
    
    # Mặc định None vì không lưu trong DB, chỉ AI tạo ra tức thời
    match_score: Optional[int] = None
    match_reason: Optional[str] = None

    rating_score: Optional[float] = 0.0  
    review_count: Optional[int] = 0
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

class BookingCreate(BaseModel):
    # Thông tin khách hàng
    full_name: str 
    email: str
    phone_number: str = Field(pattern=r'^\d{10,12}$')
    date_of_birth: date
    identity_card: str

    # Thông tin đặt phòng
    accommodation_id: int 
    date_start: date     
    date_end: date       
    number_of_guests: int
    
    model_config=ConfigDict(from_attributes=True)

class BookingRead(BaseModel):
    booking_id: int
    accommodation_id: int
    user_id: int
    date_start: date
    date_end: date
    status: str
    
    # 📝 THÊM CÁC TRƯỜNG THÔNG TIN KHÁCH HÀNG
    full_name: str
    email: str
    phone_number: str
    date_of_birth: date
    identity_card: str
    number_of_guests: int
    
    # 💰 THÊM TRƯỜNG TÍNH TOÁN
    total_price: Optional[Decimal] = None # Hoặc Decimal nếu bạn luôn tính toán giá

    # ⚠️ Tùy chọn: Nếu bạn muốn nhúng thông tin chỗ ở
    # accommodation: AccommodationRead 

    class Config:
        model_config=ConfigDict(from_attributes=True)
