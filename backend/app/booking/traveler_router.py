# app/booking/traveler_router.py

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import models, database
from ..feature_login.security_helpers import get_current_user
from . import schemas, service

router = APIRouter(
    prefix="/api/bookings",
    tags=["Bookings - Traveler"],
    dependencies=[Depends(get_current_user)],  # tất cả API yêu cầu login
)


@router.post(
    "/",
    response_model=schemas.BookingRead,
    status_code=status.HTTP_201_CREATED,
)
def create_booking_endpoint(
    payload: schemas.BookingCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Traveler tạo booking mới cho một accommodation.
    """
    try:
        booking = service.create_booking(
            db=db,
            user_id=current_user.id,
            booking_data=payload,
        )
        return booking
    except ValueError as e:
        # Lỗi logic như: accommodation không tồn tại, trùng lịch, ngày sai,...
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Không thể tạo booking: {str(e)}",
        )


@router.get(
    "/",
    response_model=List[schemas.BookingRead],
)
def list_my_bookings_endpoint(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Traveler xem danh sách booking của chính mình.
    """
    bookings = service.get_bookings_for_user(db=db, user_id=current_user.id)
    return bookings


@router.get(
    "/{booking_id}",
    response_model=schemas.BookingRead,
)
def get_my_booking_detail_endpoint(
    booking_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Traveler xem chi tiết 1 booking (chỉ nếu booking thuộc về mình).
    """
    booking = service.get_booking_by_id(db=db, booking_id=booking_id)
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy booking.",
        )

    if booking.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền xem booking này.",
        )

    return booking


@router.delete(
    "/{booking_id}",
    response_model=schemas.BookingRead,
)
def cancel_my_booking_endpoint(
    booking_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Traveler hủy booking của chính mình.
    """
    booking = service.get_booking_by_id(db=db, booking_id=booking_id)
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy booking.",
        )

    try:
        updated = service.cancel_booking_by_user(
            db=db,
            booking=booking,
            current_user_id=current_user.id,
        )
        return updated
    except PermissionError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e),
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Không thể hủy booking: {str(e)}",
        )
