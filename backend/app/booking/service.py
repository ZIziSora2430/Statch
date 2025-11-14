# app/booking/service.py

from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import models
from . import schemas


def get_booking_by_id(db: Session, booking_id: int) -> Optional[models.Booking]:
    """
    Lấy 1 booking theo ID.
    """
    return db.scalar(
        select(models.Booking).where(models.Booking.booking_id == booking_id)
    )


def get_bookings_for_user(db: Session, user_id: int) -> List[models.Booking]:
    """
    Lấy danh sách booking của 1 traveler.
    """
    result = db.scalars(
        select(models.Booking)
        .where(models.Booking.user_id == user_id)
        .order_by(models.Booking.date_start.desc())
    )
    return result.all()


def get_bookings_for_owner(db: Session, owner_id: int) -> List[models.Booking]:
    """
    Lấy tất cả booking cho các chỗ ở thuộc về owner.
    JOIN Booking với Accommodation bằng accommodation_id.
    """
    stmt = (
        select(models.Booking)
        .join(
            models.Accommodation,
            models.Booking.accommodation_id == models.Accommodation.accommodation_id,
        )
        .where(models.Accommodation.owner_id == owner_id)
        .order_by(models.Booking.date_start.desc())
    )

    result = db.scalars(stmt)
    return result.all()


def create_booking(
    db: Session,
    user_id: int,
    booking_data: schemas.BookingCreate,
) -> models.Booking:
    """
    Logic tạo booking mới cho traveler.
    - Check accommodation tồn tại
    - Check ngày hợp lệ
    - Check trùng lịch (overlap) với booking khác (pending/confirmed)
    """
    # 1. Kiểm tra ngày
    if booking_data.date_end < booking_data.date_start:
        raise ValueError("date_end phải lớn hơn hoặc bằng date_start.")

    # 2. Kiểm tra accommodation tồn tại
    accommodation = db.scalar(
        select(models.Accommodation).where(
            models.Accommodation.accommodation_id == booking_data.accommodation_id
        )
    )
    if not accommodation:
        raise ValueError("Accommodation không tồn tại.")

    # 3. Kiểm tra trùng lịch với booking khác
    conflict_stmt = (
        select(models.Booking)
        .where(
            models.Booking.accommodation_id == booking_data.accommodation_id,
            models.Booking.status.in_(
                [
                    schemas.BookingStatusEnum.pending_confirmation.value,
                    schemas.BookingStatusEnum.confirmed.value,
                ]
            ),
            # điều kiện overlap: start <= new_end AND end >= new_start
            models.Booking.date_start <= booking_data.date_end,
            models.Booking.date_end >= booking_data.date_start,
        )
    )

    conflict = db.scalar(conflict_stmt)
    if conflict:
        raise ValueError("Accommodation đã có booking trong khoảng thời gian này.")

    # 4. Tạo booking mới
    db_booking = models.Booking(
        user_id=user_id,
        accommodation_id=booking_data.accommodation_id,
        date_start=booking_data.date_start,
        date_end=booking_data.date_end,
        status=schemas.BookingStatusEnum.pending_confirmation.value,
    )

    try:
        db.add(db_booking)
        db.commit()
        db.refresh(db_booking)
        return db_booking
    except Exception as e:
        db.rollback()
        raise e


def update_booking_status(
    db: Session,
    booking: models.Booking,
    new_status: schemas.BookingStatusEnum,
) -> models.Booking:
    """
    Owner cập nhật trạng thái booking.
    """
    allowed_statuses = {
        schemas.BookingStatusEnum.pending_confirmation,
        schemas.BookingStatusEnum.confirmed,
        schemas.BookingStatusEnum.cancelled,
        schemas.BookingStatusEnum.rejected,
    }

    if new_status not in allowed_statuses:
        raise ValueError("Trạng thái không hợp lệ.")

    booking.status = new_status.value

    try:
        db.add(booking)
        db.commit()
        db.refresh(booking)
        return booking
    except Exception as e:
        db.rollback()
        raise e


def cancel_booking_by_user(
    db: Session,
    booking: models.Booking,
    current_user_id: int,
) -> models.Booking:
    """
    Traveler hủy booking của chính họ.
    """
    if booking.user_id != current_user_id:
        raise PermissionError("Bạn không có quyền hủy booking này.")

    if booking.status not in [
        schemas.BookingStatusEnum.pending_confirmation.value,
        schemas.BookingStatusEnum.confirmed.value,
    ]:
        raise ValueError("Không thể hủy booking ở trạng thái hiện tại.")

    booking.status = schemas.BookingStatusEnum.cancelled.value

    try:
        db.add(booking)
        db.commit()
        db.refresh(booking)
        return booking
    except Exception as e:
        db.rollback()
        raise e
