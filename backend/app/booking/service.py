from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import select
from datetime import timedelta

from .. import models
from . import schemas

import random
import string


def generate_booking_code():
    return "STATCH-" + ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))


def calculate_nights(start, end):
    return (end - start).days


def calculate_total_price(price_per_night, nights, rooms):
    return float(price_per_night) * nights * rooms


def get_booking_by_id(db: Session, booking_id: int):
    return db.scalar(
        select(models.Booking).where(models.Booking.booking_id == booking_id)
    )


def get_bookings_for_user(db: Session, user_id: int) -> List[schemas.BookingRead]:

    stmt = (
        select(
            models.Booking,
            models.Accommodation.title,
            models.Accommodation.location,
            models.Accommodation.picture_url,
            models.Accommodation.price
        )
        .join(models.Accommodation,
              models.Booking.accommodation_id == models.Accommodation.accommodation_id)
        .where(models.Booking.user_id == user_id)
        .order_by(models.Booking.date_start.desc())
    )

    rows = db.execute(stmt).all()

    results = []
    for booking, title, location, image, price in rows:
        nights = calculate_nights(booking.date_start, booking.date_end)
        results.append(
            schemas.BookingRead(
                booking_id=booking.booking_id,
                booking_code=booking.booking_code,
                user_id=booking.user_id,
                accommodation_id=booking.accommodation_id,
                date_start=booking.date_start,
                date_end=booking.date_end,
                nights=nights,
                guests=booking.guests,
                rooms=booking.rooms,
                total_price=booking.total_price,
                price_per_night=float(price),
                accommodation_title=title,
                accommodation_location=location,
                accommodation_image=image,
                status=booking.status
            )
        )
    return results


def get_bookings_for_owner(db: Session, owner_id: int):

    stmt = (
        select(
            models.Booking,
            models.Accommodation.title,
            models.Accommodation.location,
            models.Accommodation.picture_url,
            models.Accommodation.price
        )
        .join(models.Accommodation,
              models.Booking.accommodation_id == models.Accommodation.accommodation_id)
        .where(models.Accommodation.owner_id == owner_id)
        .order_by(models.Booking.date_start.desc())
    )

    rows = db.execute(stmt).all()

    results = []
    for booking, title, location, image, price in rows:
        nights = calculate_nights(booking.date_start, booking.date_end)
        results.append(
            schemas.BookingRead(
                booking_id=booking.booking_id,
                booking_code=booking.booking_code,
                user_id=booking.user_id,
                accommodation_id=booking.accommodation_id,
                date_start=booking.date_start,
                date_end=booking.date_end,
                nights=nights,
                guests=booking.guests,
                rooms=booking.rooms,
                total_price=booking.total_price,
                price_per_night=float(price),
                accommodation_title=title,
                accommodation_location=location,
                accommodation_image=image,
                status=booking.status
            )
        )
    return results


def create_booking(
    db: Session,
    user_id: int,
    booking_data: schemas.BookingCreate
):
    if booking_data.date_end <= booking_data.date_start:
        raise ValueError("date_end phải lớn hơn date_start")

    accommodation = db.scalar(
        select(models.Accommodation).where(
            models.Accommodation.accommodation_id == booking_data.accommodation_id
        )
    )

    if not accommodation:
        raise ValueError("Accommodation không tồn tại")

    # Check overlap
    conflict = db.scalar(
        select(models.Booking)
        .where(
            models.Booking.accommodation_id == booking_data.accommodation_id,
            models.Booking.status.in_([
                schemas.BookingStatusEnum.pending_confirmation.value,
                schemas.BookingStatusEnum.confirmed.value
            ]),
            models.Booking.date_start <= booking_data.date_end,
            models.Booking.date_end >= booking_data.date_start
        )
    )

    # AUTO CONFIRM nếu không trùng lịch
    status = schemas.BookingStatusEnum.confirmed.value if not conflict else schemas.BookingStatusEnum.pending_confirmation.value

    nights = calculate_nights(booking_data.date_start, booking_data.date_end)
    total_price = calculate_total_price(accommodation.price, nights, booking_data.rooms)

    new_booking = models.Booking(
        user_id=user_id,
        accommodation_id=booking_data.accommodation_id,
        date_start=booking_data.date_start,
        date_end=booking_data.date_end,
        guests=booking_data.guests,
        rooms=booking_data.rooms,
        total_price=total_price,
        booking_code=generate_booking_code(),
        status=status
    )

    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)

    return new_booking
