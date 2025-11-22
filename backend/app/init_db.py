# app/init_db.py
"""
Script để khởi tạo database tables từ models
"""

from app.database import engine, Base, test_connection
from app.models import *  # Import tất cả models

def init_database():
    """
    Tạo tất cả tables từ models
    """
    print("🔄 Initializing database...")
    
    # Test connection trước
    if not test_connection():
        print("❌ Cannot connect to database!")
        return False
    
    # Tạo tất cả tables
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ All tables created successfully!")
        
        # Hiển thị danh sách tables
        from sqlalchemy import inspect
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        print(f"\n📊 Created {len(tables)} tables:")
        for table in tables:
            print(f"   - {table}")
        
        return True
    
    except Exception as e:
        print(f"❌ Error creating tables: {e}")
        return False

def drop_database():
    """
    Xóa tất cả tables (NGUY HIỂM!)
    """
    response = input("⚠️  Are you sure you want to DROP all tables? (yes/no): ")
    if response.lower() == "yes":
        try:
            Base.metadata.drop_all(bind=engine)
            print("⚠️  All tables dropped!")
            return True
        except Exception as e:
            print(f"❌ Error dropping tables: {e}")
            return False
    else:
        print("❌ Operation cancelled.")
        return False

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "drop":
        drop_database()
    else:
        init_database()