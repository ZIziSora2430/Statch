from fastapi import HTTPException, status 
from sqlalchemy.orm import Session
from sqlalchemy import select
from .. import models
from . import schemas
from .security_helpers import hash_password, verify_password


# --- Các hàm logic nghiệp vụ (tách ra từ router) ---

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
            hashed_password=hashed_password,
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
    
    if not user or not verify_password(form_data.password, user.hashed_password):
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