# app/system_forum/routes.py
"""
Forum routes - Posts & Replies
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy. orm import Session
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.models import User, Post, Reply

from app.system_forum. schemas import (
    PostCreate, PostUpdate, PostResponse,
    ReplyCreate, ReplyUpdate, ReplyResponse,
    VerifiedTravelerStatus
)
from app.system_forum. dependencies import get_current_user

router = APIRouter()  # Không có prefix, sẽ thêm trong main.py


# API Lấy danh sách bài viết của chính user đang đăng nhập
@router.get("/posts/me", response_model=List[PostResponse])
async def get_my_posts(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1),
    status_filter: Optional[str] = Query(None, description="Lọc theo status: active, hidden, deleted"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Lấy lịch sử đăng bài của user hiện tại
    """
    query = db.query(Post).filter(Post.user_id == current_user.id)
    
    # Nếu muốn xem cả bài đã xóa/ẩn thì truyền status_filter, mặc định lấy tất cả trừ deleted nếu không chỉ định
    if status_filter:
        query = query.filter(Post.status == status_filter)
    else:
        # Mặc định hiển thị active và hidden, ẩn deleted đi cho gọn (tùy logic của bạn)
        query = query.filter(Post.status != "deleted")
        
    posts = query.order_by(Post.created_at.desc()).offset(skip).limit(limit).all()
    return posts
# ============= VERIFIED TRAVELER LOGIC =============

def check_verified_traveler(user: User) -> bool:
    """
    LOGIC: Chỉ cần 1 booking là verified
    """
    return user.bookings_count >= 1

async def update_verified_status(user: User, db: Session):
    """Tự động cập nhật verified status nếu đủ điều kiện"""
    if not user.is_verified_traveler and check_verified_traveler(user):
        user.is_verified_traveler = True
        db. commit()
        db.refresh(user)

@router.get("/verified-status", response_model=VerifiedTravelerStatus)
async def get_verified_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Kiểm tra trạng thái Verified Traveler
    LOGIC: Cần 1 booking là đủ
    """
    await update_verified_status(current_user, db)
    
    is_verified = current_user.is_verified_traveler
    bookings_needed = max(0, 1 - current_user.bookings_count)
    
    if is_verified:
        message = "Bạn đã là Verified Traveler!  Có thể tạo bài viết trong forum."
    else:
        message = f"Cần hoàn thành {bookings_needed} booking để trở thành Verified Traveler."
    
    return {
        "is_verified": is_verified,
        "bookings_count": current_user. bookings_count,
        "message": message
    }

# ============= POSTS ENDPOINTS =============

@router.post("/posts", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
async def create_post(
    post_data: PostCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Tạo bài viết mới
    YÊU CẦU: Phải có ít nhất 1 booking (Verified Traveler)
    """
    await update_verified_status(current_user, db)
    
    if not current_user.is_verified_traveler:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Bạn cần có ít nhất 1 booking để tạo bài viết.  Hiện tại: {current_user.bookings_count} booking."
        )
    
    new_post = Post(
        user_id=current_user. id,
        title=post_data. title,
        content=post_data. content,
        location=post_data. location  # ĐÃ ĐỔI: category -> location
    )
    
    db. add(new_post)
    db. commit()
    db.refresh(new_post)
    
    return new_post

@router.get("/posts", response_model=List[PostResponse])
async def get_posts(
    skip: int = Query(0, ge=0, description="Số posts bỏ qua"),
    limit: int = Query(20, ge=1, le=100, description="Số posts tối đa"),
    location: Optional[str] = Query(None, description="Lọc theo địa điểm"),  # ĐÃ ĐỔI
    db: Session = Depends(get_db)
):
    """
    Lấy danh sách bài viết (có phân trang)
    - Sắp xếp theo thời gian tạo (mới → cũ)
    - Có thể lọc theo location (địa điểm)
    """
    query = db.query(Post). filter(Post.status == "active")
    
    if location:
        query = query.filter(Post.location == location)  # ĐÃ ĐỔI
    
    posts = query.order_by(Post. created_at.desc()).offset(skip). limit(limit).all()
    return posts

@router. get("/posts/{post_id}", response_model=PostResponse)
async def get_post(post_id: int, db: Session = Depends(get_db)):
    """
    Lấy chi tiết bài viết
    - Tự động tăng views_count (SIMPLE LOGIC: mỗi lần xem = +1)
    """
    post = db.query(Post). filter(Post.id == post_id, Post.status == "active").first()
    
    if not post:
        raise HTTPException(status_code=404, detail="Không tìm thấy bài viết")
    
    # Tăng views count (SIMPLE LOGIC)
    post.views_count += 1
    db.commit()
    db. refresh(post)
    
    return post

@router.put("/posts/{post_id}", response_model=PostResponse)
async def update_post(
    post_id: int,
    post_data: PostUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Cập nhật bài viết
    YÊU CẦU: Phải là author của post
    """
    post = db.query(Post).filter(Post.id == post_id).first()
    
    if not post:
        raise HTTPException(status_code=404, detail="Không tìm thấy bài viết")
    
    if post.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Không có quyền chỉnh sửa")
    
    # Update fields
    if post_data.title is not None:
        post.title = post_data.title
    if post_data.content is not None:
        post.content = post_data.content
    if post_data. location is not None:  # ĐÃ ĐỔI: category -> location
        post.location = post_data.location
    if post_data.status is not None:
        post.status = post_data.status
    
    db.commit()
    db.refresh(post)
    
    return post

@router.delete("/posts/{post_id}", status_code=status. HTTP_204_NO_CONTENT)
async def delete_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Xóa bài viết (soft delete)
    YÊU CẦU: Phải là author của post
    """
    post = db.query(Post). filter(Post.id == post_id). first()
    
    if not post:
        raise HTTPException(status_code=404, detail="Không tìm thấy bài viết")
    
    if post.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Không có quyền xóa")
    
    post.status = "deleted"
    db.commit()

# ============= REPLIES ENDPOINTS =============

@router.get("/posts/{post_id}/replies", response_model=List[ReplyResponse])
async def get_replies(
    post_id: int,
    skip: int = Query(0, ge=0, description="Số replies bỏ qua"),
    limit: int = Query(50, ge=1, le=100, description="Số replies tối đa"),
    db: Session = Depends(get_db)
):
    """
    Lấy danh sách replies của bài viết
    - Sắp xếp theo thời gian tạo (cũ → mới)
    - FLAT REPLIES (không có nested)
    """
    replies = (
        db.query(Reply)
        .filter(Reply. post_id == post_id, Reply. status == "active")
        .order_by(Reply.created_at.asc())
        . offset(skip)
        .limit(limit)
        .all()
    )
    
    return replies

@router.post("/posts/{post_id}/replies", response_model=ReplyResponse, status_code=status.HTTP_201_CREATED)
async def create_reply(
    post_id: int,
    reply_data: ReplyCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Tạo reply cho post
    YÊU CẦU: Authentication
    - Tự động tăng replies_count của post
    """
    # Kiểm tra post tồn tại
    post = db.query(Post).filter(Post.id == post_id, Post.status == "active").first()
    if not post:
        raise HTTPException(status_code=404, detail="Không tìm thấy bài viết")
    
    # Tạo reply (FLAT - không có parent_reply_id)
    db_reply = Reply(
        post_id=post_id,
        user_id=current_user.id,
        content=reply_data.content
    )
    db.add(db_reply)
    
    # Tăng replies_count
    post.replies_count += 1
    
    db. commit()
    db.refresh(db_reply)
    
    return db_reply

@router.put("/replies/{reply_id}", response_model=ReplyResponse)
async def update_reply(
    reply_id: int,
    reply_data: ReplyUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Cập nhật reply
    YÊU CẦU: Phải là author của reply
    """
    reply = db. query(Reply).filter(Reply.id == reply_id).first()
    
    if not reply:
        raise HTTPException(status_code=404, detail="Không tìm thấy reply")
    
    if reply. user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Không có quyền chỉnh sửa")
    
    # Update fields
    if reply_data.content is not None:
        reply.content = reply_data.content
    if reply_data. status is not None:
        reply.status = reply_data. status
    
    db.commit()
    db.refresh(reply)
    
    return reply

@router.delete("/replies/{reply_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_reply(
    reply_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Xóa reply (soft delete)
    YÊU CẦU: Phải là author của reply
    - Tự động giảm replies_count của post
    """
    reply = db.query(Reply). filter(Reply.id == reply_id). first()
    
    if not reply:
        raise HTTPException(status_code=404, detail="Không tìm thấy reply")
    
    if reply.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Không có quyền xóa")
    
    # Giảm replies_count của post
    post = db.query(Post).filter(Post. id == reply.post_id).first()
    if post and post.replies_count > 0:
        post.replies_count -= 1
    
    # Soft delete
    reply.status = "deleted"
    
    db.commit()