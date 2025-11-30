from sqlalchemy import select, func, text, and_, or_
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
    query = select(models.Accommodation)
    query = query.where(models.Accommodation.status == 'available')

    # Lọc theo Số lượng Khách
    if number_of_guests is not None:
        query = query.where(
            models.Accommodation.max_guests >= number_of_guests
        )
    
    # Lọc theo Ngày (Kiểm tra Availability - Model Booking của bạn)
    if check_in_date is not None and check_out_date is not None:
        
        # 1. Tìm ra ID của các phòng ĐÃ BỊ ĐẶT và BỊ CHỒNG LẤN
        # CHỒNG LẤN: Booking.date_end > check_in_date VÀ Booking.date_start < check_out_date
        booked_accommodations_subquery = (
            select(models.Booking.accommodation_id)
            .where(
                and_(
                    models.Booking.date_end > check_in_date,
                    models.Booking.date_start < check_out_date,
                    # Chỉ loại trừ các booking đã được xác nhận
                    models.Booking.status == 'confirmed'
                )
            )
            .subquery()
        ) 
        # 2. Loại bỏ các phòng đã bị đặt (các ID có trong subquery)
        # SỬ DỤNG models.Accommodation.accommodation_id vì đây là Primary Key của Model Accommodation
        query = query.where(
            models.Accommodation.accommodation_id.notin_(
                select(booked_accommodations_subquery.c.accommodation_id)
            )
        )

        # --- STRATEGY 1: TÌM THEO TỌA ĐỘ (Ưu tiên) ---
    results = []
    
    if lat is not None and lng is not None and radius is not None:
        geo_query = query.where(
            models.Accommodation.latitude.isnot(None),
            models.Accommodation.longitude.isnot(None)
        )
        
        distance_col = (
            6371 * func.acos(
                func.cos(func.radians(lat)) *
                func.cos(func.radians(models.Accommodation.latitude)) *
                func.cos(func.radians(models.Accommodation.longitude) - func.radians(lng)) +
                func.sin(func.radians(lat)) *
                func.sin(func.radians(models.Accommodation.latitude))
            )
        ).label("distance")

        geo_query = geo_query.add_columns(distance_col).having(distance_col <= radius).order_by(distance_col)
        
        # Thực thi
        geo_results = db.execute(geo_query).all()
        results = [row[0] for row in geo_results]

    # --- STRATEGY 2: FALLBACK SANG TEXT (Nếu Strategy 1 rỗng) ---
    # Nếu không tìm thấy bằng tọa độ NHƯNG người dùng có nhập text -> Tìm bằng text match
    if not results and location_text:
        print(f"⚠️ Chuyển sang tìm text bằng Python Filter: '{location_text}'")
        
        # A. Lấy tất cả ứng viên từ DB (thỏa mãn điều kiện khách/ngày)
        candidates_rows = db.execute(query).all()
        candidates = [row[0] for row in candidates_rows]

        # B. Chuẩn hóa từ khóa tìm kiếm 
        search_normalized = remove_accents(location_text.lower())
        
        filtered_results = []
        for acc in candidates:
            if acc.location:
                acc_loc_normalized = remove_accents(acc.location.lower())
                # Kiểm tra có chứa từ khóa không
                if search_normalized in acc_loc_normalized:
                    filtered_results.append(acc)
        
        results = filtered_results
    # --- Thực thi Query ---
    if not results and lat is None and location_text is None:
         all_results = db.execute(query).all()
         results = [row[0] for row in all_results]

    for acc in results:
        _attach_rating_info(db, acc)
    return results


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
    return db.query(models.Accommodation)\
        .order_by(models.Accommodation.accommodation_id.desc())\
        .limit(limit)\
        .all()

# Hàm logic lấy chi tiết booking
def get_booking_details(db: Session, booking_id: int, user_id: int):
    """
    Hàm logic lấy chi tiết booking và kiểm tra quyền truy cập.
    """
    booking = db.scalar(
        select(models.Booking)
        .where(models.Booking.booking_id == booking_id)
    )
    
    if not booking:
        return None 

    accommodation = db.scalar(
        select(models.Accommodation)
        .where(models.Accommodation.accommodation_id == booking.accommodation_id)
    )

    if booking.user_id == user_id or (accommodation and accommodation.owner_id == user_id):
        return booking
    else:
        return False # Không có quyền


# Hàm logic tạo booking mới
def create_new_booking(db: Session, booking_data: schemas.BookingCreate, user_id: int):
    """
    Hàm logic để tạo một booking mới và kiểm tra tính khả dụng cuối cùng.
    """
    
    # 1. KIỂM TRA TÍNH KHẢ DỤNG LẦN CUỐI
    overlapping_bookings_count = db.scalar(
        select(func.count(models.Booking.booking_id))
        .where(
            and_(
                models.Booking.accommodation_id == booking_data.accommodation_id,
                models.Booking.date_end > booking_data.date_start,
                models.Booking.date_start < booking_data.date_end,
                models.Booking.status.in_(['confirmed', 'pending_confirmation'])
            )
        )
    )

    if overlapping_bookings_count > 0:
        return {"error": "Phòng đã có người đặt trong khoảng thời gian này.", "code": 409}

    # 2. KIỂM TRA SỨC CHỨA
    accommodation = db.scalar(
        select(models.Accommodation)
        .where(models.Accommodation.accommodation_id == booking_data.accommodation_id)
    )

    if not accommodation or accommodation.max_guests < booking_data.number_of_guests: # Dùng max_guests
        return {"error": "Số lượng khách vượt quá sức chứa tối đa.", "code": 400}

    # 3. TẠO BOOKING
    db_booking = models.Booking(
        **booking_data.model_dump(), # Ánh xạ tất cả các trường từ schema
        user_id=user_id, 
        status='pending_confirmation' 
        # Cần tính toán và gán total_price ở đây nếu cần
    )
    
    try:
        db.add(db_booking)
        db.commit()
        db.refresh(db_booking)
        return db_booking
    except Exception as e:
        db.rollback()
        print(f"Lỗi khi tạo booking: {e}")
        return {"error": "Lỗi server khi lưu booking.", "code": 500}
    
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
    
    return results