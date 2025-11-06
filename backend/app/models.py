from sqlalchemy import (
    Column, Integer, String, Float, Boolean, ForeignKey, Enum, TEXT, DECIMAL, DATE, TIMESTAMP
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from .database import Base  
import enum

# Enum cho role
class UserRole(str, enum.Enum):
    traveler = "traveler"
    owner = "owner"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.traveler)
    full_name = Column(String(100), nullable=True)


    # --- Bổ sung Relationships ---
    # Một User (owner) có thể có nhiều Accommodation
    accommodations = relationship("Accommodation", back_populates="owner")
    
    # Một User (traveler) có thể có nhiều Booking
    bookings = relationship("Booking", back_populates="user")
    
    # Một User (traveler) có thể viết nhiều Review
    reviews = relationship("Review", back_populates="user")


    # --- Bảng 2: Accommodation ---
class Accommodation(Base):
    __tablename__ = "Accommodation"

    accommodation_id = Column(Integer, primary_key=True, autoincrement=True)
    
    # Khóa ngoại trỏ đến 'users.id' 
    owner_id = Column(Integer, ForeignKey("users.id")) 
    
    title = Column(String(255), nullable=False)
    description = Column(TEXT(500))
    location = Column(String(255))
    property_type = Column(String(100))
    max_guests = Column(Integer)
    price = Column(DECIMAL(10, 2), nullable=False)
    status = Column(String(50), default='available')
    picture_url = Column(String(255))

    # CỘT MỚI ĐỂ LƯU TỌA ĐỘ
    # DECIMAL(10, 8) đủ chính xác cho vĩ độ
    latitude = Column(DECIMAL(10, 8), nullable=True) 
    # DECIMAL(11, 8) đủ chính xác cho kinh độ
    longitude = Column(DECIMAL(11, 8), nullable=True)


    # --- Relationships ---
    owner = relationship("User", back_populates="accommodations")
    bookings = relationship("Booking", back_populates="accommodation")
    reviews = relationship("Review", back_populates="accommodation")

    # --- Bảng 3: Booking ---
class Booking(Base):
    __tablename__ = "Booking"

    booking_id = Column(Integer, primary_key=True, autoincrement=True)
    
    # Khóa ngoại trỏ đến 'users.id'
    user_id = Column(Integer, ForeignKey("users.id")) 
    
    accommodation_id = Column(Integer, ForeignKey("Accommodation.accommodation_id"))
    date_start = Column(DATE, nullable=False)
    date_end = Column(DATE, nullable=False)
    status = Column(String(50), nullable=False, default='pending_confirmation')

    # --- Relationships ---
    user = relationship("User", back_populates="bookings")
    accommodation = relationship("Accommodation", back_populates="bookings")


    # --- Bảng 4: Review ---
class Review(Base):
    __tablename__ = "Review"

    review_id = Column(Integer, primary_key=True, autoincrement=True)
    accommodation_id = Column(Integer, ForeignKey("Accommodation.accommodation_id"))
    
    # Khóa ngoại trỏ đến 'users.id'
    user_id = Column(Integer, ForeignKey("users.id")) 
    
    rating = Column(Integer, nullable=False)
    content = Column(TEXT)

    # --- Relationships ---
    accommodation = relationship("Accommodation", back_populates="reviews")
    user = relationship("User", back_populates="reviews")