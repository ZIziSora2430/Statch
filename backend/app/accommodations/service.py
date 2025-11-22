from sqlalchemy import select, func, text
from sqlalchemy.orm import Session
from .. import models
from . import schemas
from typing import Optional
from decimal import Decimal
from geopy.geocoders import Nominatim

# Hàm helper để Geocode địa chỉ sang tọa độ
def _get_coordinates_for_location(address: str):
    """
    Chuyển đổi địa chỉ text sang tọa độ (Lat, Lng) dùng OpenStreetMap.
    """
    try:
        # Khởi tạo Nominatim với user_agent riêng
        geolocator = Nominatim(user_agent="statch_project_student_hcmus_2025")
        
        # Gọi API để lấy tọa độ (timeout 10s để tránh treo)
        location = geolocator.geocode(address, timeout=10)
        
        if location:
            print(f"📍 Đã tìm thấy tọa độ cho '{address}': {location.latitude}, {location.longitude}")
            return Decimal(location.latitude), Decimal(location.longitude)
        else:
            print(f"⚠️ Không tìm thấy địa chỉ '{address}'. Dùng tọa độ mặc định (TP.HCM).")
            return Decimal(10.7769), Decimal(106.7009)
            
    except Exception as e:
        print(f"❌ Lỗi Geocoding: {e}")
        # Trả về tọa độ mặc định nếu lỗi mạng hoặc API
        return Decimal(10.7769), Decimal(106.7009)

# ĐỊNH NGHĨA HÀM MÀ ROUTER ĐANG TÌM
def create_new_accommodation(
    db: Session, 
    accommodation_data: schemas.AccommodationCreate, 
    owner_id: int,
    ai_tags: str = None
):
    """
    Hàm logic để tạo một chỗ ở mới trong database.
    """

    db_accommodation = models.Accommodation(
        **accommodation_data.model_dump(),
        owner_id=owner_id,  # Gán ID của chủ sở hữu
        tags=ai_tags
        
    )
    
    # 2. Xử lý database
    try:
        db.add(db_accommodation)
        db.commit()
        db.refresh(db_accommodation)
    except Exception as e:
        db.rollback()
        raise e 
        
    # 3. Trả về đối tượng SQLAlchemy đã tạo
    return db_accommodation


# Lấy chỗ ở theo ID
def get_accommodation_by_id(db: Session, accommodation_id: int):
    """
    Hàm helper để lấy một chỗ ở cụ thể bằng ID của nó.
    """
    # Dùng .scalar() để trả về 1 object hoặc None
    return db.scalar(
        select(models.Accommodation)
        .where(models.Accommodation.accommodation_id == accommodation_id)
    )

# Xóa chỗ ở
def delete_accommodation(db: Session, accommodation: models.Accommodation):
    """
    Hàm logic để xóa một chỗ ở khỏi database.
    """
    try:
        db.delete(accommodation)
        db.commit()
    except Exception as e:
        db.rollback()
        raise e
    return True # Trả về True nếu thành công

# Update chi tiết chỗ ở
def update_accommodation(
    db: Session, 
    accommodation: models.Accommodation, # Chỗ ở (lấy từ DB)
    update_data: schemas.AccommodationUpdate # Dữ liệu mới (từ body)
):
    """
    Hàm logic để cập nhật một chỗ ở.
    """
    # Lấy dữ liệu mới dưới dạng dict, chỉ lấy các trường được gửi lên
    update_data_dict = update_data.model_dump(exclude_unset=True)

    # Nếu owner thay đổi địa chỉ (location),
    # chúng ta cần Geocode lại (bằng Nominatim)
    if 'location' in update_data_dict:
        lat, lng = _get_coordinates_for_location(update_data_dict['location'])
        accommodation.latitude = lat
        accommodation.longitude = lng
    
    # Lặp qua các trường được gửi lên và cập nhật
    for key, value in update_data_dict.items():
        setattr(accommodation, key, value)
        
    try:
        db.add(accommodation) # Thêm vào session (SQLAlchemy biết đây là update)
        db.commit()
        db.refresh(accommodation)
    except Exception as e:
        db.rollback()
        raise e
    return accommodation # Trả về chỗ ở đã được cập nhật

# Hàm searching
def search_accommodations(
    db: Session,
    lat: Optional[float],
    lng: Optional[float],
    radius: Optional[int], # Bán kính (km)
    location_text: Optional[str]
):
    """
    Hàm logic để tìm kiếm chỗ ở dựa trên tọa độ và bán kính.
    Sử dụng công thức Haversine.
    """
    query = select(models.Accommodation)

    # Nếu không có tọa độ, trả về tất cả
    if lat is not None and lng is not None and radius is not None:
        # Đảm bảo chỉ tìm các chỗ ở CÓ tọa độ
        query = query.where(
            models.Accommodation.latitude.isnot(None),
            models.Accommodation.longitude.isnot(None)
        )

    # --- Công thức Haversine để tính khoảng cách ---
    # Công thức Haversine
        # 6371 là bán kính Trái Đất (km)
        distance_col = (
            6371 * func.acos(
                func.cos(func.radians(lat)) *
                func.cos(func.radians(models.Accommodation.latitude)) *
                func.cos(func.radians(models.Accommodation.longitude) - func.radians(lng)) +
                func.sin(func.radians(lat)) *
                func.sin(func.radians(models.Accommodation.latitude))
            )
        ).label("distance") # Đặt tên cột là 'distance'
        
        # Thêm cột distance vào query
        query = query.add_columns(distance_col)
        
        # Lọc theo bán kính (radius) PHẢI dùng .having()
        query = query.having(distance_col <= radius)
        
        # Sắp xếp theo khoảng cách
        query = query.order_by(distance_col)

    # --- Lọc theo Text (fallback) ---
    elif location_text:
        # Chỉ tìm khi không có tọa độ
        query = query.where(
            # Dùng ilike (không phân biệt hoa thường)
            models.Accommodation.location.ilike(f"%{location_text}%")
        )
    
    
    # --- Thực thi Query ---
    results = db.execute(query).all()
    
    # Đơn giản hóa logic trả về
    return [row[0] for row in results]


def get_accommodations_by_owner(db: Session, owner_id: int):
    """
    Lấy danh sách tất cả chỗ ở của một owner cụ thể.
    """
    return db.query(models.Accommodation).filter(
        models.Accommodation.owner_id == owner_id
    ).all()