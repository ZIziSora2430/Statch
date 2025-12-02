# app/database.py
"""
Database connection và session management
Sử dụng SQLAlchemy với MySQL
"""

from sqlalchemy import create_engine, text  
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.declarative import declarative_base
from dotenv import load_dotenv
import os

# =====================================================
# Lấy DATABASE_URL từ .env
# =====================================================
DATABASE_URL = "mysql+pymysql://root:123456@localhost:3306/testdb"

if not DATABASE_URL:
    raise ValueError(
        "❌ DATABASE_URL not found in .env file!\n"
        "Please create .env file with:\n"
        "DATABASE_URL=mysql+pymysql://root:123456@localhost:3306/STACH"
    )

# =====================================================
# Lấy DEBUG mode từ .env
# =====================================================
DEBUG = os.getenv("DEBUG", "False").lower() == "true"

# =====================================================
# Tạo engine kết nối với MySQL
# =====================================================
engine = create_engine(
    DATABASE_URL,
    echo=DEBUG,                 # Chỉ bật SQL log khi DEBUG=True
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
    pool_recycle=3600,
    connect_args={
        "charset": "utf8mb4",
    }
)

# =====================================================
# Session maker
# =====================================================
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# =====================================================
# Base class cho tất cả models
# =====================================================
Base = declarative_base()
    
# =====================================================
# Dependency function cho FastAPI
# =====================================================
def get_db():
    """
    Dependency injection để cung cấp database session
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# =====================================================
# Helper functions
# =====================================================
def test_connection():
    """
    Test database connection
    Returns True nếu kết nối thành công
    """
    try:
        with engine.connect() as connection:
            # ✅ DÙNG text() để wrap SQL string
            result = connection.execute(text("SELECT 1"))
            print("✅ Database connection successful!")
            print(f"📊 Database: {engine.url.database}")
            print(f"🔗 Host: {engine.url.host}:{engine.url.port}")
            print(f"👤 User: {engine.url.username}")
            return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

