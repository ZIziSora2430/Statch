# app/booking/owner_router.py

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import models, database
from ..feature_login.security_helpers import get_current_active_owner
from . import schemas, service

router = APIRouter(
    prefix="/api/owner/bookings",
    tags=["Bookings - Owner"],
    dependencies=[Depends(get_current_active_owner)],
)


@router.get(
    "/",
    response_model=List[schemas.BookingRead],
)
def list_owner_bookings_endpoint(
    db: Session = Depends(database.get_db),
    current_owner: models.User = Depends(get_current_active_owner),
):
    """
    Owner xem tất cả booking cho các accommodation thuộc về mình.
    """
    bookings = service.get_bookings_for_owner(db=db, owner_id=current_owner.id)
    return bookings


@router.get(
    "/{booking_id}",
    response_model=schemas.BookingRead,
)
def get_owner_booking_detail_endpoint(
    booking_id: int,
    db: Session = Depends(database.get_db),
    current_owner: models.User = Depends(get_current_active_owner),
):
    """
    Owner xem chi tiết 1 booking (chỉ nếu booking thuộc accommodation của mình).
    """
    booking = service.get_booking_by_id(db=db, booking_id=booking_id)
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy booking.",
        )

    # Check booking có thuộc accommodation của owner không
    # JOIN thủ công: lấy accommodation rồi so owner_id
    accommodation = db.scalar(
        database.get_db().scalar(
            # nếu bạn đã có db ở đây rồi thì có thể join trực tiếp,
            # nhưng để đơn giản, giả sử ta query lại:
            # (nếu đã có models.Accommodation, hãy dùng select giống service.py)
        )
    )
    # Để gọn, ta query trực tiếp:
    from sqlalchemy import select

    accommodation = db.scalar(
        select(models.Accommodation).where(
            models.Accommodation.accommodation_id == booking.accommodation_id
        )
    )

    if not accommodation or accommodation.owner_id != current_owner.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền xem booking này.",
        )

    return booking


@router.put(
    "/{booking_id}/status",
    response_model=schemas.BookingRead,
)
def update_booking_status_endpoint(
    booking_id: int,
    payload: schemas.BookingUpdateStatus,
    db: Session = Depends(database.get_db),
    current_owner: models.User = Depends(get_current_active_owner),
):
    """
    Owner cập nhật trạng thái booking (confirm / reject / cancel / pending_confirmation).
    """
    booking = service.get_booking_by_id(db=db, booking_id=booking_id)
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy booking.",
        )

    # Check booking thuộc accommodation của owner
    from sqlalchemy import select

    accommodation = db.scalar(
        select(models.Accommodation).where(
            models.Accommodation.accommodation_id == booking.accommodation_id
        )
    )

    if not accommodation or accommodation.owner_id != current_owner.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền cập nhật booking này.",
        )

    try:
        updated = service.update_booking_status(
            db=db,
            booking=booking,
            new_status=payload.status,
        )
        return updated
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Không thể cập nhật trạng thái booking: {str(e)}",
        )
