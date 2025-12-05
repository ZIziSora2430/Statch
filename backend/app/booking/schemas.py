from datetime import date
from enum import Enum
from pydantic import BaseModel, ConfigDict, field_validator
from typing import Optional
import re

class BookingStatusEnum(str, Enum):
    pending_approval = "pending_approval"       # 1. Mới đặt, chờ chủ nhà accept yêu cầu đặt phòng
    pending_payment = "pending_payment"         # 2. Chủ nhà OK, chờ khách chuyển tiền
    pending_confirmation = "pending_confirmation" # 3. Khách đã chuyển, chờ chủ nhà check tiền
    confirmed = "confirmed"                     # 4. Xong
    cancelled = "cancelled"
    rejected = "rejected"
    completed = "completed"
    reported = "reported" #

class BookingCreate(BaseModel):
    """
    Traveler gửi request tạo booking
    """
    accommodation_id: int
    date_start: date
    date_end: date
    guests: int
    note: Optional[str] = None
    guest_name: str
    guest_email: str
    guest_phone: str

    @field_validator('guest_phone')
    def validate_phone(cls, v):
        if v is None: return v
        # Kiểm tra chỉ chứa số và độ dài từ 10
        if not re.match(r'^\d{10}$', v):
            raise ValueError('Số điện thoại phải bao gồm 10 chữ số')
        return v
    
    @field_validator('guest_email')
    def validate_gmail(cls, v):
        if v is None: return v
        # Kiểm tra đuôi @gmail.com
        if not v.endswith('@gmail.com'):
            raise ValueError('Hệ thống chỉ chấp nhận địa chỉ Gmail (@gmail.com)')
        return v
    
class OwnerBookingInfo(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    # Thêm 3 dòng này:
    bank_name: Optional[str] = None
    account_number: Optional[str] = None
    account_holder: Optional[str] = None

class BookingRead(BaseModel):
    booking_id: int
    booking_code: str
    
    user_id: int
    accommodation_id: int

    date_start: date
    date_end: date
    nights: int

    guests: int
    note: Optional[str] = None   # ✔ CHỈ ĐỂ 1 LẦN
    total_price: float
    price_per_night: float

    guest_name: Optional[str] = None
    guest_email: Optional[str] = None
    guest_phone: Optional[str] = None

    # Accommodation info
    accommodation_title: str
    accommodation_location: str
    accommodation_image: str

    status: BookingStatusEnum
    owner: Optional[OwnerBookingInfo] = None
    payment_proof: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class BookingUpdateStatus(BaseModel):
    status: BookingStatusEnum


