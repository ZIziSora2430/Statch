# system_forum/dependencies.py
"""
Dependencies cho system_forum
"""

from fastapi import HTTPException, status, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Post  # ← SỬA: Import từ app.models

def get_current_user(db: Session = Depends(get_db)) -> User:
    """
    TEMPORARY: Fake authentication - Trả về user 'tanthanh1606'
    ⭐ TODO: Implement JWT authentication trong production
    """
    user = db.query(User).filter(User.username == "tanthanh1606").first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

def check_verified_traveler(user_id: int, db: Session):
    """
    Check nếu user là Verified Traveler
    Yêu cầu: >= 1 booking
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not user.is_verified_traveler:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Cần có ít nhất 1 booking để tạo bài viết. Hiện tại: {user.bookings_count} booking."
        )
    
    return user

def get_post_or_404(post_id: int, db: Session):
    """Get post or raise 404"""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post