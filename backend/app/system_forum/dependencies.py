# app/system_forum/dependencies.py
from fastapi import HTTPException, status, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Post

# ==================================================================
# 1. IMPORT HÀM AUTH TỪ MODULE LOGIN
# Thay vì fake, ta dùng hàng thật từ security_helpers
# Giả sử folder login của bạn tên là 'feature_login' (dựa theo tên file schemas bạn gửi)
# Nếu folder tên khác (vd: routers, auth...), bạn sửa lại đường dẫn import nhé.
# ==================================================================
try:
    from app.feature_login.security_helpers import get_current_user
except ImportError:
    # Fallback nếu bạn đặt tên folder khác, hãy sửa dòng import trên
    raise ImportError("Không tìm thấy module 'app.feature_login'. Hãy kiểm tra lại tên folder chứa file security_helpers.py")

# ==================================================================
# 2. CÁC HÀM DEPENDENCY CỦA FORUM (Giữ nguyên logic nghiệp vụ)
# ==================================================================

def check_verified_traveler(
    current_user: User = Depends(get_current_user) 
) -> User:
    """
    Check nếu user là Verified Traveler
    Logic: Đã đăng nhập + Có ít nhất 1 booking
    """
    # Vì get_current_user đã check login rồi, ở đây chỉ check nghiệp vụ
    if not current_user.is_verified_traveler:
        # Check booking count (dựa vào logic cũ của bạn)
        if current_user.bookings_count < 1:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Cần có ít nhất 1 booking để tham gia. Hiện tại: {current_user.bookings_count} booking."
            )
    
    return current_user

def get_post_or_404(post_id: int, db: Session = Depends(get_db)):
    """Get post or raise 404"""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post