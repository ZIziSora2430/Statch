from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Thông tin kết nối MySQL: user:password@host:port/dbname
SQLALCHEMY_DATABASE_URL = "mysql+pymysql://root:123456@127.0.0.1:3306/STACH"

# Tạo engine kết nối với MySQL
# pool_pre_ping=True để tránh lỗi "MySQL server has gone away"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_pre_ping=True,
    echo=True  # hiển thị SQL log khi chạy, để debug
)

# SessionLocal dùng để tạo session DB cho mỗi request
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Base dùng để khai báo các model (models.py sẽ kế thừa)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()