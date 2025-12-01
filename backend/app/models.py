# app/models.py
"""
Database models cho toàn bộ dự án Statch
Bao gồm: Users, Accommodation, Booking, Review, Forum (Posts, Replies)
"""

from sqlalchemy import (
    Column, Integer, String, Float, Boolean, ForeignKey, 
    Enum, TEXT, DECIMAL, DATE, TIMESTAMP, Text
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy import TEXT, DateTime
from .database import Base
import enum

# =====================================================
# ENUMS
# =====================================================

class UserRole(str, enum.Enum):
    """Vai trò của user"""
    traveler = "traveler"
    owner = "owner"

class PostCategory(str, enum.Enum):
    """Danh mục bài viết forum"""
    general = "general"
    tips = "tips"
    questions = "questions"
    reviews = "reviews"
    stories = "stories"

class PostStatus(str, enum.Enum):
    """Trạng thái bài viết"""
    active = "active"
    hidden = "hidden"
    deleted = "deleted"

# =====================================================
# Bảng 1: Users (Chung cho tất cả features)
# =====================================================

class User(Base):
    __tablename__ = "users"

    # Primary key
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # Authentication
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.traveler)
    full_name = Column(String(100), nullable=True)
    sex = Column(String(20), nullable=True)
    dob = Column(DATE, nullable=True) # dob = Date of Birth     
    phone = Column(String(20), nullable=True, unique=True)
    preference = Column(TEXT, nullable=True)
    reset_code = Column(String(10), nullable=True)
    reset_code_expires = Column(DateTime, nullable=True)

    role = Column(Enum(UserRole), nullable=False, default=UserRole.traveler)
    
    # Forum features
    bookings_count = Column(Integer, default=0, comment="Số lần đặt chỗ thành công")
    is_verified_traveler = Column(Boolean, default=False, comment="Badge Verified Traveler")
    
    # Timestamps
    verified_at = Column(TIMESTAMP, nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    # =====================================================
    # Relationships
    # =====================================================
    
    # Accommodation (owner role)
    accommodations = relationship("Accommodation", back_populates="owner", cascade="all, delete-orphan")
    
    # Booking (traveler role)
    bookings = relationship("Booking", back_populates="user", cascade="all, delete-orphan")
    
    # Review
    reviews = relationship("Review", back_populates="user", cascade="all, delete-orphan")
    
    # Forum
    posts = relationship("Post", back_populates="author", cascade="all, delete-orphan")
    replies = relationship("Reply", back_populates="author", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}', role='{self.role}')>"

# =====================================================
# Bảng 2: Accommodation (Chỗ ở)
# =====================================================

class Accommodation(Base):
    __tablename__ = "accommodations"

    # Primary key
    accommodation_id = Column(Integer, primary_key=True, autoincrement=True)
    
    # Foreign key
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Basic info
    title = Column(String(255), nullable=False)
    description = Column(TEXT)
    location = Column(String(255))
    property_type = Column(String(100))
    max_guests = Column(Integer)
    price = Column(DECIMAL(10, 2), nullable=False)
    status = Column(String(50), default='available')
    picture_url = Column(TEXT, nullable=True)
    tags = Column(String(500), nullable=True)

    # Coordinates
    latitude = Column(DECIMAL(10, 8), nullable=True)     
    longitude = Column(DECIMAL(11, 8), nullable=True)
    
    # Timestamps
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    # =====================================================
    # Relationships
    # =====================================================
    owner = relationship("User", back_populates="accommodations")
    bookings = relationship("Booking", back_populates="accommodation", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="accommodation", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Accommodation(id={self.accommodation_id}, title='{self.title}')>"

# =====================================================
# Bảng 3: Booking (Đặt chỗ)
# =====================================================

class Booking(Base):
    __tablename__ = "bookings"

    # Primary key
    booking_id = Column(Integer, primary_key=True, autoincrement=True)
    
    # Foreign keys
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    accommodation_id = Column(Integer, ForeignKey("accommodations.accommodation_id", ondelete="CASCADE"), nullable=False)
    
    # Booking info
    date_start = Column(DATE, nullable=False)
    date_end = Column(DATE, nullable=False)

    # CÁC CỘT MỚI THÊM VÀO
    guests = Column(Integer, nullable=False, default=1)  
    note = Column(TEXT, nullable=True) # Lưu ghi chú của khách
    guest_name = Column(String(100), nullable=True)  # Tên người ở
    guest_email = Column(String(100), nullable=True) # Email liên hệ
    guest_phone = Column(String(20), nullable=True)  # SĐT liên hệ
    
    total_price = Column(DECIMAL(10, 2), nullable=False, default=0)

    booking_code = Column(String(50), unique=True, nullable=True)

    # Trạng thái booking
    status = Column(String(50), nullable=False, default='pending_confirmation')
    
    # Timestamps
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    # =====================================================
    # Relationships
    # =====================================================
    user = relationship("User", back_populates="bookings")
    accommodation = relationship("Accommodation", back_populates="bookings")

    def __repr__(self):
        return f"<Booking(id={self.booking_id}, user_id={self.user_id}, status='{self.status}')>"

# =====================================================
# Bảng 4: Review (Đánh giá)
# =====================================================

class Review(Base):
    __tablename__ = "reviews"

    # Primary key
    review_id = Column(Integer, primary_key=True, autoincrement=True)
    
    # Foreign keys
    accommodation_id = Column(Integer, ForeignKey("accommodations.accommodation_id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Review content
    rating = Column(Integer, nullable=False)
    content = Column(TEXT)
    
    # Timestamps
    created_at = Column(TIMESTAMP, server_default=func.now())

    # =====================================================
    # Relationships
    # =====================================================
    accommodation = relationship("Accommodation", back_populates="reviews")
    user = relationship("User", back_populates="reviews")

    def __repr__(self):
        return f"<Review(id={self.review_id}, rating={self.rating})>"

# =====================================================
# Bảng 5: Posts (Forum - Bài viết)
# =====================================================

class Post(Base):
    __tablename__ = "posts"

    # Primary key
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # Foreign key
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Post content
    title = Column(String(200), nullable=False)
    content = Column(TEXT, nullable=False)
    category = Column(Enum(PostCategory), nullable=False, default=PostCategory.general)
    status = Column(Enum(PostStatus), default=PostStatus.active)
    
    # Counters
    views_count = Column(Integer, default=0)
    replies_count = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    # =====================================================
    # Relationships
    # =====================================================
    author = relationship("User", back_populates="posts")
    replies = relationship("Reply", back_populates="post", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Post(id={self.id}, title='{self.title}', category='{self.category}')>"

# =====================================================
# Bảng 6: Replies (Forum - Comments)
# =====================================================

class Reply(Base):
    __tablename__ = "replies"

    # Primary key
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # Foreign keys
    post_id = Column(Integer, ForeignKey("posts.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Reply content
    content = Column(TEXT, nullable=False)
    status = Column(Enum(PostStatus), default=PostStatus.active)
    
    # Timestamps
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    # =====================================================
    # Relationships
    # =====================================================
    post = relationship("Post", back_populates="replies")
    author = relationship("User", back_populates="replies")

    def __repr__(self):
        return f"<Reply(id={self.id}, post_id={self.post_id})>"


# =====================================================
# Export tất cả models
# =====================================================
__all__ = [
    "Base",
    "User",
    "UserRole",
    "Accommodation",
    "Booking",
    "Review",
    "Post",
    "Reply",
    "PostCategory",
    "PostStatus"
]
    # --- Bảng 5: Notification ---
class Notification(Base):
    __tablename__ = "Notification"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    message = Column(String(255), nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(TIMESTAMP, server_default=func.now())

    # Quan hệ ngược: 1 user có nhiều notification
    user = relationship("User", backref="notifications")
