from fastapi import HTTPException, status 
from sqlalchemy.orm import Session
from sqlalchemy import select
from .. import models
from . import schemas
from .security_helpers import hash_password, verify_password
import smtplib
from email.mime.text import MIMEText
from datetime import datetime, timedelta
import random
import os
from dotenv import load_dotenv

load_dotenv()

SMTP_SERVER = os.getenv("SMTP_SERVER")
SMTP_PORT = int(os.getenv("SMTP_PORT") or 587)
SENDER_EMAIL = os.getenv("SENDER_EMAIL")
SENDER_PASSWORD = os.getenv("SENDER_PASSWORD")

#Xử lí quên mật khẩu
def send_reset_email(to_email: str, code: str):
    # Kiểm tra xem biến môi trường có lấy được không
    if not SMTP_SERVER or not SENDER_EMAIL or not SENDER_PASSWORD:
        print("❌ Lỗi: Thiếu cấu hình Email trong file .env")
        return False
    try:
        msg = MIMEText(f"Mã xác nhận đặt lại mật khẩu của bạn là: {code}\nMã có hiệu lực trong 10 phút.")
        msg['Subject'] = "Mã xác nhận quên mật khẩu - Statch"
        msg['From'] = SENDER_EMAIL
        msg['To'] = to_email

        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        server.sendmail(SENDER_EMAIL, to_email, msg.as_string())
        server.quit()
        return True
    except Exception as e:
        print(f"Lỗi gửi mail: {e}")
        return False

def request_password_reset(db: Session, email: str):
    # 1. Tìm user
    user = get_user_by_email(db, email)
    if not user:
        return False # Không tìm thấy email, nhưng để bảo mật có thể vẫn báo thành công giả
    
    # 2. Tạo mã OTP 6 số
    code = f"{random.randint(100000, 999999)}"
    
    # 3. Lưu vào DB (Hết hạn sau 10 phút)
    user.reset_code = code
    user.reset_code_expires = datetime.now() + timedelta(minutes=10)
    db.commit()
    
    # 4. Gửi mail
    return send_reset_email(email, code)

def verify_reset_code(db: Session, email: str, code: str):
    user = get_user_by_email(db, email)
    if not user or not user.reset_code:
        return False
        
    # Kiểm tra mã khớp và chưa hết hạn
    if user.reset_code == code and user.reset_code_expires > datetime.now():
        return True
    return False

def reset_password(db: Session, payload: schemas.ResetPasswordRequest):
    # Kiểm tra lại mã lần cuối cho chắc chắn
    if not verify_reset_code(db, payload.email, payload.code):
        raise HTTPException(status_code=400, detail="Mã xác nhận không hợp lệ hoặc đã hết hạn")
    
    user = get_user_by_email(db, payload.email)
    
    # Hash mật khẩu mới và lưu
    user.password_hash = hash_password(payload.new_password)
    
    # Xóa mã OTP để không dùng lại được
    user.reset_code = None
    user.reset_code_expires = None
    
    db.commit()
    return True

#Thay đổi mật khẩu
def change_user_password(db: Session, current_user: models.User, payload: schemas.ChangePasswordRequest):
    # 1. Kiểm tra mật khẩu cũ có đúng không
    if not verify_password(payload.old_password, current_user.password_hash):
        return False # Báo thất bại
    
    # 2. Hash mật khẩu mới
    new_hashed_pass = hash_password(payload.new_password)
    
    # 3. Cập nhật vào DB
    current_user.password_hash = new_hashed_pass
    db.commit()
    return True


# --- Các hàm logic nghiệp vụ ---

def get_user_by_username(db: Session, username: str):
    return db.scalar(select(models.User).where(models.User.username == username))

def get_user_by_email(db: Session, email: str):
    return db.scalar(select(models.User).where(models.User.email == email))

def get_user_by_phone(db: Session, phone: str):
    return db.scalar(select(models.User).where(models.User.phone == phone))

def create_user(db: Session, user_in: schemas.UserCreate):
    # Logic từ endpoint /signup
    try:
        hashed_password = hash_password(user_in.password)
        
        db_user = models.User(
            username=user_in.username,
            email=user_in.email,
            password_hash=hashed_password,  # ← SỬA: password_hash (không phải password_hashed)
            role=user_in.role,
            full_name=user_in.full_name
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    except Exception as e:
        db.rollback()
        raise e

def login_user(db: Session, form_data: schemas.UserLogin):
    # Logic từ endpoint /login
    user = get_user_by_username(db, form_data.username)
    
    if not user or not verify_password(form_data.password, user.password_hash):  # ← SỬA: password_hash
        return None # Router sẽ raise lỗi 401
    
    # Tạo token 
    token = f"{user.username}:{user.role.value}"
    return {"access_token": token, "token_type": "bearer", "role": user.role}

def update_user(db: Session, current_user: models.User, payload: schemas.UserUpdate):
    # Logic từ endpoint /users/me
    # 1. Lấy dữ liệu frontend gửi (exclude_unset=True để bỏ qua cái nào không gửi)
    update_data = payload.model_dump(exclude_unset=True)

    # Nếu không có dữ liệu gì thì trả về luôn
    if not update_data:
        return current_user 

    # 2. Logic check trùng Email (chỉ chạy nếu user đổi email)
    if "email" in update_data:
        existing = get_user_by_email(db, update_data["email"])
        if existing and existing.id != current_user.id:
            return None # Trả về None để router báo lỗi
        
    # 3. VÒNG LẶP THẦN THÁNH: Tự động cập nhật mọi trường (sex, city, dob...)
    for key, value in update_data.items():
        setattr(current_user, key, value)
        
    # 4. Lưu xuống Database
    try:
        db.add(current_user)
        db.commit()
        db.refresh(current_user)
        return current_user 
    except Exception as e:
        db.rollback()
        raise e