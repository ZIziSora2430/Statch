from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from .. import models, database
from ..feature_login.security_helpers import get_current_user
from . import schemas, service

router = APIRouter(
    prefix="/api/bookings",
    tags=["Bookings - Traveler"],
    dependencies=[Depends(get_current_user)]
)


@router.post("/", response_model=schemas.BookingRead)
def create_booking_endpoint(
    payload: schemas.BookingCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):

    try:
        booking = service.create_booking(
            db=db,
            user_id=current_user.id,
            booking_data=payload
        )
        # Convert booking → BookingRead
        return service.get_bookings_for_user(db, current_user.id)[0]

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )


@router.get("/", response_model=List[schemas.BookingRead])
def list_my_bookings_endpoint(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    return service.get_bookings_for_user(db, current_user.id)


@router.get("/{booking_id}", response_model=schemas.BookingRead)
def get_my_booking_detail_endpoint(
    booking_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    booking = service.get_booking_by_id(db, booking_id)

    if not booking:
        raise HTTPException(404, "Không tìm thấy booking")

    if booking.user_id != current_user.id:
        raise HTTPException(403, "Không có quyền xem")

    return service.get_bookings_for_user(db, current_user.id)[0]
