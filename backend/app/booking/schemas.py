from datetime import date
from enum import Enum
from pydantic import BaseModel, ConfigDict
from typing import Optional


class BookingStatusEnum(str, Enum):
    pending_confirmation = "pending_confirmation"
    confirmed = "confirmed"
    cancelled = "cancelled"
    rejected = "rejected"
    completed = "completed"


class BookingCreate(BaseModel):
    """
    Traveler gửi request tạo booking
    """
    accommodation_id: int
    date_start: date
    date_end: date
    guests: int
    note: Optional[str] = None

class BookingRead(BaseModel):
    """
    Dữ liệu trả về cho FE (Booking Detail, Booking List)
    """
    booking_id: int
    booking_code: str
    
    user_id: int
    accommodation_id: int

    date_start: date
    date_end: date
    nights: int

    guests: int
    note: Optional[str] = None
    total_price: float
    price_per_night: float

    # Accommodation info for FE display
    accommodation_title: str
    accommodation_location: str
    accommodation_image: str

    status: BookingStatusEnum

    model_config = ConfigDict(from_attributes=True)


class BookingUpdateStatus(BaseModel):
    status: BookingStatusEnum
