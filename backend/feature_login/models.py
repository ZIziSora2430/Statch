from sqlalchemy import Column, Integer, String, Enum
from .database import Base  # ✅ Changed to relative import
import enum

# Enum cho role
class UserRole(str, enum.Enum):
    traveler = "traveler"
    owner = "owner"
    admin = "admin"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.traveler)
    full_name = Column(String(100), nullable=True)