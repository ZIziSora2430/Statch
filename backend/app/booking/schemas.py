
from datetime import date
from enum import Enum
from pydantic import BaseModel, ConfigDict


class BookingStatusEnum(str, Enum):
    pending_confirmation = "pending_confirmation"
    confirmed = "confirmed"
    cancelled = "cancelled"
    rejected = "rejected"


class BookingCreate(BaseModel):
    """
    Schema cho traveler tạo booking mới.
    """
    accommodation_id: int
    date_start: date
    date_end: date


class BookingRead(BaseModel):
    """
    Dùng để trả data booking ra cho frontend.
    """
    booking_id: int
    user_id: int
    accommodation_id: int
    date_start: date
    date_end: date
    status: BookingStatusEnum

    model_config = ConfigDict(from_attributes=True) 


class BookingUpdateStatus(BaseModel):
    """
    Owner dùng để cập nhật trạng thái booking (confirm/reject).
    """
    status: BookingStatusEnum
