import bcrypt
from sqlalchemy.orm import Session
from sqlalchemy import select
from .. import models
from typing import Optional
from fastapi import Header, Depends, HTTPException, status
from ..database import get_db # Import get_db trung tâm

# ==========================================
# 1. CÁC HÀM BĂM MẬT KHẨU (GIỮ NGUYÊN)
# ==========================================

def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    # Truncate password to 72 bytes if needed
    password_bytes = password.encode('utf-8')[:72]
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hashed password"""
    password_bytes = plain_password.encode('utf-8')[:72]
    hashed_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password_bytes, hashed_bytes)

# ==========================================
# 2. HÀM LẤY CURRENT USER (ĐÃ SỬA)
# ==========================================

def get_current_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    # [DEBUG] In ra để xem Frontend gửi header gì
    print(f"🔍 DEBUG AUTH HEADER: {authorization}")

    if not authorization:
        print("❌ Lỗi: Không nhận được Header Authorization")
        raise HTTPException(status_code=401, detail="Missing token")
    
    try:
        # 1. Xử lý cắt chuỗi "Bearer " (An toàn hơn)
        if authorization.startswith("Bearer "):
            token = authorization.split(" ")[1]
        else:
            token = authorization # Frontend quên gửi chữ Bearer thì vẫn chấp nhận
        
        print(f"🔑 DEBUG TOKEN PARSED: '{token}'")

        # 2. Tách username và role (Linh hoạt hơn)
        # Code cũ sẽ lỗi ngay tại đây nếu token không có dấu ":"
        if ":" in token:
            username = token.split(":")[0] # Chỉ lấy phần trước dấu :
        else:
            username = token # Nếu không có :, coi cả chuỗi là username
            
        print(f"👤 DEBUG USERNAME: '{username}'")

        # 3. Tìm trong Database
        user = db.scalar(select(models.User).where(models.User.username == username))
        
        if not user:
            print(f"❌ Lỗi: Không tìm thấy user '{username}' trong DB")
            raise HTTPException(status_code=401, detail="User not found")
            
        return user

    except Exception as e:
        print(f"☠️ CRASH tại get_current_user: {e}")
        raise HTTPException(status_code=401, detail="Invalid token format")
    

# ==========================================
# 3. DEPENDENCY CHO OWNER (GIỮ NGUYÊN)
# ==========================================

def get_current_active_owner(current_user: models.User = Depends(get_current_user)):
    """
    Dependency dựa trên get_current_user, nhưng kiểm tra vai trò 'owner'.
    """
    if current_user.role != "owner": # Lưu ý: Đảm bảo model User của bạn trả về string hoặc enum value
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operation not permitted: Requires owner role."
        )
    return current_user