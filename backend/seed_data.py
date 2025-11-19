import random
from datetime import date, timedelta
from faker import Faker
from sqlalchemy.orm import Session
from sqlalchemy import text

# Import chuẩn từ app
from app.database import SessionLocal, engine
from app.models import User, Accommodation, Booking, Review, UserRole 

fake = Faker(['vi_VN'])

# Tọa độ TP.HCM
HCM_LOCATIONS = [
    {"name": "Quận 1 - Trung tâm", "lat": 10.775659, "lng": 106.700424},
    {"name": "Quận 3 - Hồ Con Rùa", "lat": 10.782620, "lng": 106.695900},
    {"name": "Thảo Điền - Quận 2", "lat": 10.803542, "lng": 106.734532},
    {"name": "Phú Mỹ Hưng - Quận 7", "lat": 10.731720, "lng": 106.708600},
    {"name": "Landmark 81 - Bình Thạnh", "lat": 10.795200, "lng": 106.721700}
]

# Bộ từ khóa sở thích (Dành cho AI Recommendation)
TRAVEL_KEYWORDS = [
    "thích leo núi", "yêu biển", "đam mê ẩm thực đường phố", "thích chụp ảnh check-in",
    "muốn tìm nơi yên tĩnh để đọc sách", "thích không khí náo nhiệt về đêm", 
    "du lịch bụi tiết kiệm", "nghỉ dưỡng sang trọng (luxury)",
    "khám phá văn hóa địa phương", "thích đi phượt bằng xe máy", 
    "yêu thiên nhiên hoang dã", "thích mua sắm", "du lịch tâm linh", 
    "thích staycation cuối tuần", "thích các hoạt động mạo hiểm",
    "muốn tìm homestay có mèo", "thích view sông", "cần không gian làm việc (workation)"
]

# Mẫu câu giới thiệu bản thân đa dạng hơn
INTRO_TEMPLATES = [
    "Xin chào, mình là người {}.",
    "Sở thích của mình là {}. Rất vui được làm quen!",
    "Mình đang tìm kiếm chuyến đi {} để xả stress.",
    "Tự giới thiệu: Mình {} và đang muốn tìm bạn đồng hành.",
    "Mình là người đơn giản, {}."
]

def get_random_hcm_coordinate(center_lat, center_lng, radius_km=2):
    offset_range = radius_km / 111.0
    random_lat = center_lat + random.uniform(-offset_range, offset_range)
    random_lng = center_lng + random.uniform(-offset_range, offset_range)
    return random_lat, random_lng

def clean_database(db: Session):
    """Hàm xóa sạch dữ liệu cũ theo thứ tự để tránh lỗi Khóa Ngoại (Foreign Key)"""
    print("--- ĐANG DỌN DẸP DATABASE CŨ... ---")
    try:
        # Tắt kiểm tra khóa ngoại tạm thời để xóa cho nhanh (MySQL)
        db.execute(text("SET FOREIGN_KEY_CHECKS = 0;"))
        
        # Xóa dữ liệu các bảng
        db.query(Review).delete()
        db.query(Booking).delete()
        db.query(Accommodation).delete()
        db.query(User).delete()
        
        # Bật lại kiểm tra khóa ngoại
        db.execute(text("SET FOREIGN_KEY_CHECKS = 1;"))
        db.commit()
        print("-> Đã xóa sạch dữ liệu cũ!")
    except Exception as e:
        print(f"-> Cảnh báo dọn dẹp: {e}")
        db.rollback()

def seed_data():
    db = SessionLocal()
    try:
        # BƯỚC 0: DỌN DẸP DATABASE CŨ
        clean_database(db)

        print("--- BẮT ĐẦU TẠO DỮ LIỆU MỚI (SEED DATA) ---")

        # 1. TẠO USERS
        users = []
        print("1. Đang tạo 50 users...")
        for _ in range(50):
            profile = fake.profile()
            
            age = random.randint(18, 60)
            dob_year = date.today().year - age
            dob_date = fake.date_between_dates(date_start=date(dob_year, 1, 1), date_end=date(dob_year, 12, 31))
            role_choice = random.choice([UserRole.traveler, UserRole.owner])
            unique_suffix = str(random.randint(1000, 99999))

            # --- LOGIC TẠO PREFERENCE (ĐÃ SỬA) ---
            # Chọn ngẫu nhiên 2-4 sở thích từ bộ từ khóa
            selected_interests = random.sample(TRAVEL_KEYWORDS, k=random.randint(2, 4))
            
            # Ghép thành chuỗi: "thích leo núi, yêu biển và khám phá văn hóa"
            # Logic ghép chuỗi mượt mà hơn
            if len(selected_interests) > 1:
                interests_str = ", ".join(selected_interests[:-1]) + " và " + selected_interests[-1]
            else:
                interests_str = selected_interests[0]

            # Ghép vào mẫu câu
            preference_text = random.choice(INTRO_TEMPLATES).format(interests_str)
            # ---------------------------------------
            
            user = User(
                username=profile['username'] + unique_suffix,
                hashed_password="$2b$12$NeY7zOA8DIIdBNfzk9vXAeM.6hJTz2ICk69A6yagqqx3D5JgOhRHC", 
                email=unique_suffix + profile['mail'],
                full_name=fake.name(),
                sex=random.choice(["Nam", "Nữ", "Khác"]),
                dob=dob_date,
                role=role_choice,
                phone=fake.phone_number()[:15],
                preference=preference_text # <--- ĐÃ SỬA: Dùng biến preference_text thay vì fake.text()
            )
            db.add(user)
            users.append(user)
        
        db.commit() 

        owners = [u for u in users if u.role == UserRole.owner]
        travelers = [u for u in users if u.role == UserRole.traveler]

        if not owners:
            owners.append(users[0])
            users[0].role = UserRole.owner
            db.commit()

        # 2. TẠO ACCOMMODATION
        accommodations = []
        print("2. Đang tạo 30 Accommodation...")
        for _ in range(30):
            owner = random.choice(owners)
            area = random.choice(HCM_LOCATIONS)
            lat, lng = get_random_hcm_coordinate(area["lat"], area["lng"])
            full_address = f"{random.randint(1, 999)} đường {fake.street_name()}, {area['name']}, TP.HCM"

            prop_type = random.choice(["Khách sạn", "Căn hộ", "Homestay"])
            desc_keywords = []
            if prop_type == "Homestay":
                desc_keywords = ["gần gũi thiên nhiên", "yên tĩnh", "thích hợp cho người hướng nội", "có mèo"]
            elif prop_type == "Khách sạn":
                desc_keywords = ["sang trọng", "đầy đủ tiện nghi", "ngay trung tâm", "sôi động"]
            else:
                desc_keywords = ["riêng tư", "có bếp nấu ăn", "view đẹp", "thích hợp staycation"]
            
            selected_desc = random.sample(desc_keywords, k=2)
            description_text = f"Chỗ nghỉ {prop_type} tuyệt vời tại {area['name']}. Đặc điểm: {', '.join(selected_desc)}. Rất phù hợp cho chuyến đi của bạn."

            accom = Accommodation(
                owner_id=owner.id,
                title=f"{prop_type} {fake.first_name()} {random.choice(['View đẹp', 'Cozy', 'Luxury'])}",                
                description=description_text,
                location=full_address,
                property_type=prop_type, # Sửa dòng này để khớp với biến prop_type đã random ở trên
                max_guests=random.choice([2, 4, 6, 10]),
                price=random.randint(500, 5000) * 1000,
                status='available',
                picture_url=f"https://picsum.photos/seed/{random.randint(1,1000)}/400/300",
                latitude=lat,
                longitude=lng
            )
            db.add(accom)
            accommodations.append(accom)
        db.commit()

        # 3. TẠO BOOKING & REVIEW
        print("3. Đang tạo 40 Booking & Review...")
        for _ in range(40):
            if not travelers: break 
            
            traveller = random.choice(travelers)
            accom = random.choice(accommodations)
            
            start_date = fake.date_this_year()
            stay_duration = random.randint(1, 5)
            end_date = start_date + timedelta(days=stay_duration)
            status_choice = random.choice(['pending_confirmation', 'confirmed', 'completed', 'cancelled'])

            booking = Booking(
                user_id=traveller.id,
                accommodation_id=accom.accommodation_id,
                date_start=start_date,
                date_end=end_date,
                status=status_choice
            )
            db.add(booking)

            if status_choice == 'completed':
                review = Review(
                    user_id=traveller.id,
                    accommodation_id=accom.accommodation_id,
                    rating=random.randint(3, 5),
                    content=f"Tôi rất thích nơi này vì nó {random.choice(['yên tĩnh', 'sạch sẽ', 'tiện nghi', 'gần trung tâm'])}."
                )
                db.add(review)
        
        db.commit()
        print("--- ĐÃ TẠO DỮ LIỆU THÀNH CÔNG (KHÔNG LỖI)! ---")

    except Exception as e:
        print(f"CÓ LỖI XẢY RA: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()