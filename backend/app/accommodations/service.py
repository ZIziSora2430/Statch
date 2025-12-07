from sqlalchemy import select, func, text, and_, or_, desc
from sqlalchemy.orm import Session, joinedload
from datetime import date
from datetime import datetime, date
from .. import models
from . import schemas
from typing import Optional
from decimal import Decimal
from geopy.geocoders import Nominatim
from sqlalchemy.sql.expression import func 
import unicodedata
from sqlalchemy.orm import Session
from sqlalchemy.sql import text

#Hàm helper xóa dấu
def remove_accents(input_str):
    if not input_str: return ""
    # Chuyển đổi đ -> d, Đ -> D thủ công vì thư viện chuẩn bỏ qua
    s = input_str.replace("đ", "d").replace("Đ", "D")
    nfkd_form = unicodedata.normalize('NFKD', s)
    return "".join([c for c in nfkd_form if not unicodedata.combining(c)])

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
    accommodation = db.scalar(
        select(models.Accommodation)
        .options(joinedload(models.Accommodation.owner))
        .where(models.Accommodation.accommodation_id == accommodation_id)
    )
    
    # Gọi hàm tính điểm trước khi trả về
    return _attach_rating_info(db, accommodation)

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
    location_text: Optional[str],
    check_in_date: Optional[date] = None,
    check_out_date: Optional[date] = None,
    number_of_guests: Optional[int] = None
):
    """
    Hàm logic để tìm kiếm chỗ ở dựa trên tọa độ và bán kính.
    Sử dụng công thức Haversine.
    """
    print(f"SEARCH START: Text='{location_text}', Date={check_in_date} -> {check_out_date}")    
    query = select(models.Accommodation).where(models.Accommodation.status == 'available')

    # Lọc theo Số lượng Khách
    if number_of_guests is not None:
        query = query.where(models.Accommodation.max_guests >= number_of_guests)
    
    # Lọc theo Ngày (Kiểm tra Availability - Model Booking của bạn)
    if check_in_date is not None and check_out_date is not None:
        
        # 1. Tìm ra ID của các phòng ĐÃ BỊ ĐẶT và BỊ CHỒNG LẤN
        # CHỒNG LẤN: Booking.date_end > check_in_date VÀ Booking.date_start < check_out_date
        busy_rooms_subquery = select(models.Booking.accommodation_id).where(
                and_(
                    models.Booking.date_end > check_in_date,
                    models.Booking.date_start < check_out_date,
                    # Chỉ loại trừ các booking đã được xác nhận
                    models.Booking.status == 'confirmed'
                )
            )
            
        # 2. Loại bỏ các phòng đã bị đặt
        query = query.where(models.Accommodation.accommodation_id.notin_(busy_rooms_subquery))

    results = []
    # CASE A: Có nhập Text (Ưu tiên tìm theo địa điểm/tên) -> BỎ QUA RADIUS
    if location_text:
        print(f"🔍 Mode: Text Search ('{location_text}')")
        search_term = f"%{location_text}%"
        
        # Tìm theo text
        query = query.where(
            or_(
                models.Accommodation.title.ilike(search_term),
                models.Accommodation.location.ilike(search_term),
                models.Accommodation.tags.ilike(search_term) 
            )
        )
        
        # Nếu có tọa độ, ta vẫn tính khoảng cách để SẮP XẾP cho đẹp (Gần user nhất lên đầu)
        # NHƯNG KHÔNG dùng .where(distance <= radius) để lọc bỏ
        if lat is not None and lng is not None:
             distance_col = (
                6371 * func.acos(
                    func.cos(func.radians(lat)) *
                    func.cos(func.radians(models.Accommodation.latitude)) *
                    func.cos(func.radians(models.Accommodation.longitude) - func.radians(lng)) +
                    func.sin(func.radians(lat)) *
                    func.sin(func.radians(models.Accommodation.latitude))
                )
            ).label("distance")
             
             # Chỉ order by distance, không filter radius
             results = db.execute(
                 query.add_columns(distance_col).order_by(distance_col.asc()).limit(50)
             ).all()
             
             # Map lại kết quả (SQLAlchemy trả về tuple khi dùng add_columns)
             final_results = []
             for row in results:
                 final_results.append(row[0])
             results = final_results
             
        else:
            # Nếu không có tọa độ thì query bình thường
            results = db.scalars(query.limit(50)).all()
    else:
        results = db.scalars(query.limit(50)).all()
    
    # Xử lý kết quả trả về
    accommodations = []
    for row in results:
        _attach_rating_info(db, row)
        accommodations.append(row)

    return accommodations


def get_accommodations_by_owner(db: Session, owner_id: int):
    """
    Lấy danh sách tất cả chỗ ở của một owner cụ thể.
    """
    return db.query(models.Accommodation).filter(
        models.Accommodation.owner_id == owner_id
    ).all()

def get_random_accommodations(db: Session, limit: int = 10):
    """
    Lấy ngẫu nhiên một số chỗ ở để làm ứng viên cho AI chấm điểm.
    """
    return db.query(models.Accommodation)\
        .order_by(func.random())\
        .limit(limit)\
        .all()

# (Dùng khi user chưa có sở thích)
def get_top_accommodations(db: Session, limit: int = 6):
    """
    Lấy danh sách chỗ ở mới nhất (hoặc top rate nếu có cột rating).
    """
    results = db.query(models.Accommodation)\
        .outerjoin(models.Review)\
        .group_by(models.Accommodation.accommodation_id)\
        .order_by(func.avg(models.Review.rating).desc())\
        .limit(limit)\
        .all()
    
    # Gắn thêm thông tin chi tiết (số sao, số lượng review) để hiển thị ra Frontend
    for acc in results:
        _attach_rating_info(db, acc)

    return results


# --- HÀM HELPER TÍNH ĐIỂM ---
def _attach_rating_info(db: Session, accommodation):
    """
    Hàm nội bộ: Tính điểm trung bình từ bảng Review và gắn vào object Accommodation.
    """
    if not accommodation:
        return None

    # 1. Query tính toán Aggregate (Trung bình và Tổng số)
    # query: SELECT COUNT(*), AVG(rating) FROM review WHERE accommodation_id = ...
    result = db.query(
        func.count(models.Review.review_id),
        func.avg(models.Review.rating)
    ).filter(
        models.Review.accommodation_id == accommodation.accommodation_id
    ).first()

    count, avg_stars = result

    # 2. Xử lý dữ liệu
    if count and count > 0:
        avg_val = float(avg_stars)
        
        # --- QUY ĐỔI THANG ĐIỂM ---
        # Ví dụ: 4.5 sao -> 9.0 điểm
        score_out_of_10 = round(avg_val * 2, 1) 
        
        # Gán vào thuộc tính ảo 
        accommodation.rating_score = score_out_of_10
        accommodation.review_count = count
    else:
        # Chưa có đánh giá nào
        accommodation.rating_score = 0.0 
        accommodation.review_count = 0
        
    return accommodation

from sqlalchemy.orm import Session
from sqlalchemy import select, and_, or_, func, text
# Giả định models và database đã được import đúng

def get_recommended_accommodations(db: Session, accommodation_id: int, limit: int = 4):
    """
    Hàm logic lấy danh sách chỗ ở được gợi ý dựa trên cột 'tags' và fallback ngẫu nhiên.
    Đã được điều chỉnh để tương thích với MySQL (sử dụng ORDER BY RAND()).
    """
    
    current_acc = db.scalar(
        select(models.Accommodation).where(models.Accommodation.accommodation_id == accommodation_id)
    )
    
    if not current_acc:
        return []

    existing_ids = [accommodation_id]
    results = []
    
    # 1. Chuẩn hóa Tags
    raw_tags = current_acc.tags if current_acc.tags else ""
    tags_list = [
        tag.strip()
        for tag in raw_tags.lower().replace(",", " ").split()
        if tag.strip() and len(tag.strip()) > 2
    ]

    # --- 2. TRUY VẤN THEO TAGS (Ưu tiên) ---
    if tags_list:
        tag_conditions = []
        for tag in tags_list:
            # Dùng LOWER(tags) LIKE '%%{tag}%%' (Tương thích với MySQL)
            tag_conditions.append(text(f"LOWER(tags) LIKE '%%{tag}%%'")) 
            
        tag_query = select(models.Accommodation).where(
            and_(
                models.Accommodation.accommodation_id.notin_(existing_ids),
                or_(*tag_conditions)
            )
        )
        
        # 🚨 SỬA LỖI QUAN TRỌNG: Dùng text("RAND()") cho MySQL
        recommended_by_tags = db.scalars(
            tag_query.order_by(text("RAND()")) 
            .limit(limit)
        ).all()
        
        results.extend(recommended_by_tags)
        existing_ids.extend([acc.accommodation_id for acc in recommended_by_tags])


    # --- 3. FALLBACK (Tìm Ngẫu nhiên Tuyệt đối để lấp đầy) ---
    if len(results) < limit:
        additional_limit = limit - len(results)
        
        fallback_query = select(models.Accommodation).where(
            models.Accommodation.accommodation_id.notin_(existing_ids)
        )
        
        # 🚨 SỬA LỖI QUAN TRỌNG: Dùng text("RAND()") cho MySQL
        additional_results = db.scalars(
            fallback_query.order_by(text("RAND()")).limit(additional_limit)
        ).all()
        
        results.extend(additional_results)
    

    final_results = []
    for acc in results:
        # Gọi hàm helper để tính toán rating_score và review_count
        _attach_rating_info(db, acc) 
        final_results.append(acc)
    return final_results