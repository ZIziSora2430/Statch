from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import select
from datetime import timedelta, datetime
from fastapi import HTTPException
from .. import models
from . import schemas
from ..notifications.service import create_notification


import random
import string

import os
import shutil
from fastapi import UploadFile

# Cấu hình thời gian timeout (Ví dụ: 24 giờ)
TIMEOUT_HOURS = 24 

def scan_and_expire_bookings(db: Session):
    """
    Hàm này sẽ chạy định kỳ để hủy các đơn quá hạn.
    """
    now = datetime.now()
    cutoff_time = now - timedelta(hours=TIMEOUT_HOURS)

    # 1. Tìm các đơn "Chờ duyệt" quá lâu (Dựa trên created_at)
    expired_approvals = db.scalars(
        select(models.Booking).where(
            models.Booking.status == 'pending_approval',
            models.Booking.created_at < cutoff_time
        )
    ).all()

    # 2. Tìm các đơn "Chờ thanh toán" quá lâu (Dựa trên updated_at - thời điểm cuối cùng đổi trạng thái)
    expired_payments = db.scalars(
        select(models.Booking).where(
            models.Booking.status == 'pending_payment',
            models.Booking.updated_at < cutoff_time
        )
    ).all()

    count = 0
    # Xử lý hủy
    all_expired = expired_approvals + expired_payments
    
    for booking in all_expired:
        booking.status = 'cancelled'
        # (Optional) Gửi thông báo cho User: "Đơn của bạn đã bị hủy do quá hạn."
        # create_notification(db, booking.user_id, f"Booking {booking.booking_code} đã hết hạn.")
        count += 1
    
    if count > 0:
        db.commit()
        print(f"🧹 [Auto-Clean] Đã hủy {count} đơn quá hạn.")


def generate_booking_code():
    return "STATCH-" + ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))


def calculate_nights(start, end):
    return (end - start).days


def calculate_total_price(price_per_night, nights):
    return float(price_per_night) * nights



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
                total_price=booking.total_price,
                price_per_night=float(price),
                accommodation_title=title,
                accommodation_location=location,
                accommodation_image=image,
                status=booking.status
            )
        )
    return results

def build_booking_read(db: Session, booking):
    # Lấy thông tin chỗ ở
    accom = db.scalar(
        select(models.Accommodation).where(
            models.Accommodation.accommodation_id == booking.accommodation_id
        )
    )

    # Lấy thông tin chủ nhà
    owner = db.scalar(
        select(models.User).where(models.User.id == accom.owner_id)
    )

    # Chuyển sang Pydantic OwnerInfo
    owner_info = None
    if owner:
        owner_info = schemas.OwnerInfo(
            full_name=owner.full_name,
            email=owner.email,
            phone=owner.phone
        )

    nights = (booking.date_end - booking.date_start).days

    return schemas.BookingRead(
        booking_id=booking.booking_id,
        booking_code=booking.booking_code,

        # 🟢 TRẢ VỀ OWNER Ở ĐÂY
        owner=owner_info,

        user_id=booking.user_id,
        accommodation_id=booking.accommodation_id,
        date_start=booking.date_start,
        date_end=booking.date_end,
        nights=nights,
        guests=booking.guests,
        guest_name=booking.guest_name,
        guest_email=booking.guest_email,
        guest_phone=booking.guest_phone,
        note=booking.note,
        total_price=booking.total_price,
        price_per_night=float(accom.price),
        accommodation_title=accom.title,
        accommodation_location=accom.location,
        accommodation_image=accom.picture_url,
        status=booking.status
    )

def owner_confirm_booking(db: Session, booking_id: int, owner_id: int):
    booking = get_booking_by_id(db, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking không tồn tại")

    accom = db.scalar(select(models.Accommodation).where(
        models.Accommodation.accommodation_id == booking.accommodation_id
    ))
    if accom.owner_id != owner_id:
        raise ValueError("Không có quyền xác nhận")
    
    # 3. Check xem trong lúc chờ pending, đã có ai nhanh tay confirm trước chưa (Safety check)
    # (Trường hợp 2 owner cùng quản lý 1 acc hoặc lag mạng)
    double_check_conflict = db.scalar(
        select(models.Booking).where(
            models.Booking.accommodation_id == booking.accommodation_id,
            models.Booking.status == 'confirmed',
            models.Booking.booking_id != booking_id, # Không check chính nó
            models.Booking.date_start < booking.date_end,
            models.Booking.date_end > booking.date_start
        )
    )
    if double_check_conflict:
        raise HTTPException(
            status_code=400,
            detail="Lỗi: Đã có booking khác được xác nhận trong khoảng thời gian này!"
        )

    booking.status = "confirmed"

    # 5. --- LOGIC TỰ ĐỘNG HỦY CÁC KÈO TRÙNG ---
    # Tìm tất cả các booking đang 'pending' mà bị trùng ngày với booking vừa confirm này
    overlapping_pendings = db.scalars(
        select(models.Booking).where(
            models.Booking.accommodation_id == booking.accommodation_id,
            models.Booking.status == 'pending_confirmation',
            models.Booking.booking_id != booking_id, # Trừ chính thằng đang confirm ra
            models.Booking.date_start < booking.date_end, # Logic trùng ngày
            models.Booking.date_end > booking.date_start
        )
    ).all()

    # Duyệt qua danh sách và Reject tự động
    for conflict_booking in overlapping_pendings:
        conflict_booking.status = "cancelled"
        
        # Gửi thông báo chia buồn cho khách bị hủy
        create_notification(
            db,
            user_id=conflict_booking.user_id,
            message=f"Rất tiếc, yêu cầu đặt phòng tại {accom.title} ({conflict_booking.date_start} - {conflict_booking.date_end}) đã bị từ chối do kín lịch."
        )

    db.commit()
    db.refresh(booking)
    # Gửi thông báo thành công cho khách hàng
    create_notification(
        db,
        user_id=booking.user_id,
        message="Đơn đặt phòng của bạn đã được chủ nhà xác nhận!"
    )
    return build_booking_read(db, booking)

def owner_cancel_booking(db: Session, booking_id: int, owner_id: int):
    booking = get_booking_by_id(db, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking không tồn tại")

    accom = db.scalar(select(models.Accommodation).where(
        models.Accommodation.accommodation_id == booking.accommodation_id
    ))
    if accom.owner_id != owner_id:
        raise HTTPException(status_code=403, detail="Không có quyền hủy booking này")

    # Chỉ cho phép hủy nếu đang chờ
    if booking.status != schemas.BookingStatusEnum.pending_confirmation.value:
        raise HTTPException(
            status_code=400,
            detail="Chỉ có thể hủy booking đang chờ xác nhận"
        )

    booking.status = "cancelled"
    db.commit()
    db.refresh(booking)

    # Gửi thông báo cho khách hàng
    create_notification(
        db,
        user_id=booking.user_id,
        message="Đơn đặt phòng của bạn đã bị chủ nhà từ chối."
    )


    return build_booking_read(db, booking)


def create_booking(
    db: Session,
    user_id: int,
    booking_data: schemas.BookingCreate
):
    if booking_data.date_end <= booking_data.date_start:
         raise HTTPException(status_code=400, detail="Ngày trả phòng phải lớn hơn ngày nhận phòng")

    accommodation = db.scalar(
        select(models.Accommodation).where(
            models.Accommodation.accommodation_id == booking_data.accommodation_id
        )
    )

    if not accommodation:
        raise HTTPException(status_code=404, detail="Accommodation không tồn tại")

    #  Chặn trùng lịch đã xác nhận
    conflict = db.scalar(
        select(models.Booking)
        .where(
            models.Booking.accommodation_id == booking_data.accommodation_id,
            models.Booking.status == schemas.BookingStatusEnum.confirmed.value, 
            models.Booking.date_start <= booking_data.date_end,
            models.Booking.date_end >= booking_data.date_start
        )
    )
    if conflict:
         # Sửa thông báo lỗi cho chính xác hơn
        raise HTTPException(
            status_code=400,
            detail="Rất tiếc, chỗ nghỉ này đã được xác nhận trong khoảng thời gian bạn chọn."
        )
    
    status = schemas.BookingStatusEnum.pending_approval.value

    nights = calculate_nights(booking_data.date_start, booking_data.date_end)
    total_price = calculate_total_price(accommodation.price, nights)

    new_booking = models.Booking(
        user_id=user_id,
        accommodation_id=booking_data.accommodation_id,
        date_start=booking_data.date_start,
        date_end=booking_data.date_end,
        guests=booking_data.guests,
        guest_name=booking_data.guest_name,
        guest_email=booking_data.guest_email,
        guest_phone=booking_data.guest_phone,
        note=booking_data.note,        
        total_price=total_price,
        booking_code=generate_booking_code(),
        status=status
    )

    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)

    # Gửi thông báo cho chủ nhà
    create_notification(
        db,
        user_id=accommodation.owner_id,
        message=f"Khách vừa đặt phòng: {accommodation.title}"
    )

    return new_booking


# Chủ nhà duyệt yêu cầu (Approve) chuyển sang chờ thanh toán
def owner_approve_booking(db: Session, booking_id: int, owner_id: int):
    booking = get_booking_by_id(db, booking_id)
    if not booking:
        raise ValueError("Booking không tồn tại")
    
    if booking.status != "pending_approval":
        raise ValueError("Booking không ở trạng thái chờ duyệt")

    booking.status = "pending_payment" # Chuyển sang chờ thanh toán
    db.commit()
    
    # Gửi noti cho khách
    create_notification(db, booking.user_id, "Chủ nhà đã đồng ý! Vui lòng thanh toán để giữ chỗ.")
    return build_booking_read(db, booking)

# Khách upload ảnh (Upload Proof)
def traveler_upload_proof(db: Session, booking_id: int, user_id: int, file: UploadFile):
    booking = get_booking_by_id(db, booking_id)
    if not booking or booking.user_id != user_id:
        raise ValueError("Không tìm thấy booking hoặc không có quyền")

    if booking.status != "pending_payment":
        raise ValueError("Bạn chưa được duyệt hoặc đã thanh toán rồi")

    # Lưu file ảnh (Lưu local đơn giản vào folder static)
    upload_dir = "static/proofs"
    os.makedirs(upload_dir, exist_ok=True)
    
    file_path = f"{upload_dir}/{booking_id}_{file.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Cập nhật DB
    booking.payment_proof = file_path
    booking.status = "pending_confirmation" # Chuyển sang chờ xác nhận tiền
    db.commit()

    # Báo cho chủ nhà
    accom = db.scalar(select(models.Accommodation).where(models.Accommodation.accommodation_id == booking.accommodation_id))
    create_notification(db, accom.owner_id, "Khách đã chuyển khoản! Hãy kiểm tra và xác nhận.")
    
    return build_booking_read(db, booking)


def owner_report_issue(db: Session, booking_id: int, owner_id: int):
    booking = get_booking_by_id(db, booking_id)
    
    # Check quyền owner...
    accom = db.scalar(select(models.Accommodation).where(models.Accommodation.accommodation_id == booking.accommodation_id))
    if accom.owner_id != owner_id:
        raise ValueError("Không có quyền")

    # Chỉ cho phép report khi đang chờ xác nhận tiền
    if booking.status != "pending_confirmation":
        raise ValueError("Chỉ có thể báo cáo khi đang chờ xác nhận tiền")

    booking.status = "reported" # Chuyển sang trạng thái "Bị báo cáo / Chờ xử lý"
    db.commit()
    
    # (Optional) Gửi thông báo cho khách: "Đơn của bạn đang được xem xét lại"
    return build_booking_read(db, booking)

