from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from .. import models, database
from ..feature_login.security_helpers import get_current_active_owner
from . import schemas, service

router = APIRouter(
    prefix="/api/owner/bookings",
    tags=["Bookings - Owner"],
    dependencies=[Depends(get_current_active_owner)]
)


@router.get("/", response_model=List[schemas.BookingRead])
def list_owner_bookings(
    db: Session = Depends(database.get_db),
    current_owner: models.User = Depends(get_current_active_owner)
):
    return service.get_bookings_for_owner(db, current_owner.id)


@router.get("/{booking_id}", response_model=schemas.BookingRead)
def get_booking_detail(
    booking_id: int,
    db: Session = Depends(database.get_db),
    current_owner: models.User = Depends(get_current_active_owner)
):
    booking = service.get_booking_by_id(db, booking_id)

    if not booking:
        raise HTTPException(404, "Không tìm thấy booking")

    accommodation = db.scalar(
        select(models.Accommodation).where(
            models.Accommodation.accommodation_id == booking.accommodation_id
        )
    )

    if not accommodation or accommodation.owner_id != current_owner.id:
        raise HTTPException(403, "Không có quyền xem")

    return service.get_bookings_for_owner(db, current_owner.id)[0]
