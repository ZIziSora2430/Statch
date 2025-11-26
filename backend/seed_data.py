import random
from datetime import date, timedelta
from faker import Faker
from sqlalchemy.orm import Session
from sqlalchemy import text
from decimal import Decimal
import uuid

# Import chuẩn từ app
from app.database import SessionLocal, engine
from app.models import User, Accommodation, Booking, Review, UserRole 

fake = Faker(['vi_VN'])

# --- BỘ DỮ LIỆU ĐỊA ĐIỂM THẬT TẠI TP.HCM ---
REAL_ESTATES = [
    # --- QUẬN 1 (Bổ sung) ---
    {"address": "2 Công xã Paris, Bến Nghé, Quận 1, TP.HCM", "lat": 10.779785, "lng": 106.699018, "type": "Khách sạn", "area": "Nhà thờ Đức Bà"},
    {"address": "135 Nam Kỳ Khởi Nghĩa, Bến Thành, Quận 1, TP.HCM", "lat": 10.776993, "lng": 106.695353, "type": "Khách sạn", "area": "Dinh Độc Lập"},
    {"address": "36 Hồ Tùng Mậu, Bến Nghé, Quận 1, TP.HCM", "lat": 10.771867, "lng": 106.703461, "type": "Homestay", "area": "Bitexco"},
    {"address": "10B Tôn Đức Thắng, Bến Nghé, Quận 1, TP.HCM", "lat": 10.780393, "lng": 106.706667, "type": "Khách sạn", "area": "Bờ sông Sài Gòn"},
    {"address": "183 Bùi Viện, Phường Phạm Ngũ Lão, Quận 1, TP.HCM", "lat": 10.767432, "lng": 106.692341, "type": "Homestay", "area": "Phố Tây Bùi Viện"},
    {"address": "68 Nguyễn Huệ, Bến Nghé, Quận 1, TP.HCM", "lat": 10.774409, "lng": 106.703831, "type": "Khách sạn", "area": "Phố đi bộ Nguyễn Huệ"},
    {"address": "2 Lam Sơn, Bến Nghé, Quận 1, TP.HCM", "lat": 10.777321, "lng": 106.702893, "type": "Khách sạn", "area": "Nhà hát Thành phố"},
    {"address": "235 Nguyễn Văn Cừ, Nguyễn Cư Trinh, Quận 1, TP.HCM", "lat": 10.762831, "lng": 106.682619, "type": "Khách sạn", "area": "Nowzone"},

    # --- QUẬN 3 (Bổ sung) ---
    {"address": "6 Pasteur, Phường 6, Quận 3, TP.HCM", "lat": 10.785321, "lng": 106.693732, "type": "Biệt thự", "area": "Hồ Con Rùa"},
    {"address": "193 Lý Chính Thắng, Võ Thị Sáu, Quận 3, TP.HCM", "lat": 10.788213, "lng": 106.685521, "type": "Khách sạn", "area": "Nam Kỳ Khởi Nghĩa"},
    {"address": "117 Nguyễn Đình Chiểu, Phường 6, Quận 3, TP.HCM", "lat": 10.779340, "lng": 106.691510, "type": "Căn hộ", "area": "Léman Luxury"},
    {"address": "280 Nam Kỳ Khởi Nghĩa, Phường 8, Quận 3, TP.HCM", "lat": 10.790512, "lng": 106.681920, "type": "Homestay", "area": "Chùa Vĩnh Nghiêm"},
    {"address": "14 Ngô Thời Nhiệm, Phường 7, Quận 3, TP.HCM", "lat": 10.777912, "lng": 106.690123, "type": "Villa", "area": "Khu biệt thự Pháp cổ"},

    # --- QUẬN 4 (Mới - Khu vực căn hộ cao cấp) ---
    {"address": "151 Bến Vân Đồn, Phường 6, Quận 4, TP.HCM", "lat": 10.763012, "lng": 106.696123, "type": "Căn hộ", "area": "River Gate Residence"},
    {"address": "132 Bến Vân Đồn, Phường 6, Quận 4, TP.HCM", "lat": 10.762234, "lng": 106.698456, "type": "Căn hộ", "area": "Millennium Masteri"},
    {"address": "346 Bến Vân Đồn, Phường 1, Quận 4, TP.HCM", "lat": 10.757890, "lng": 106.689123, "type": "Căn hộ", "area": "The GoldView"},
    {"address": "2 Nguyễn Tất Thành, Phường 12, Quận 4, TP.HCM", "lat": 10.769123, "lng": 106.706789, "type": "Homestay", "area": "Bến Nhà Rồng"},

    # --- QUẬN 5 (Mới - Khu vực Chợ Lớn) ---
    {"address": "18 An Dương Vương, Phường 9, Quận 5, TP.HCM", "lat": 10.757772, "lng": 106.670552, "type": "Khách sạn", "area": "Windsor Plaza"},
    {"address": "964 Võ Văn Kiệt, Phường 6, Quận 5, TP.HCM", "lat": 10.752123, "lng": 106.665432, "type": "Căn hộ", "area": "Đại lộ Đông Tây"},
    {"address": "380 Trần Hưng Đạo, Phường 11, Quận 5, TP.HCM", "lat": 10.754321, "lng": 106.666789, "type": "Khách sạn", "area": "Chinatown"},
    {"address": "190 Hồng Bàng, Phường 12, Quận 5, TP.HCM", "lat": 10.756789, "lng": 106.661234, "type": "Căn hộ", "area": "Hùng Vương Plaza"},

    # --- QUẬN 2 (TP. THỦ ĐỨC) ---
    {"address": "161 Xa lộ Hà Nội, Thảo Điền, Quận 2, TP.HCM", "lat": 10.801863, "lng": 106.740772, "type": "Căn hộ", "area": "Masteri Thảo Điền"},
    {"address": "28 Trần Ngọc Diện, Thảo Điền, Quận 2, TP.HCM", "lat": 10.805052, "lng": 106.733364, "type": "Villa", "area": "Khu biệt thự Thảo Điền"},
    {"address": "1 Đường số 10, Thảo Điền, Quận 2, TP.HCM", "lat": 10.807120, "lng": 106.728900, "type": "Homestay", "area": "Ven sông Sài Gòn"},
    {"address": "1 Đại lộ Mai Chí Thọ, Thủ Thiêm, Quận 2, TP.HCM", "lat": 10.775123, "lng": 106.721456, "type": "Căn hộ", "area": "Empire City"},
    {"address": "Đảo Kim Cương, Bình Trưng Tây, Quận 2, TP.HCM", "lat": 10.768912, "lng": 106.742345, "type": "Căn hộ", "area": "Diamond Island"},

    # --- QUẬN 7 (Khu Phú Mỹ Hưng) ---
    {"address": "101 Tôn Dật Tiên, Tân Phú, Quận 7, TP.HCM", "lat": 10.729568, "lng": 106.721627, "type": "Căn hộ", "area": "Crescent Mall"},
    {"address": "79 Nguyễn Văn Linh, Tân Phong, Quận 7, TP.HCM", "lat": 10.730678, "lng": 106.706345, "type": "Căn hộ", "area": "Vivo City"},
    {"address": "105 Tôn Dật Tiên, Tân Phú, Quận 7, TP.HCM", "lat": 10.728123, "lng": 106.722345, "type": "Biệt thự", "area": "Khu Hồ Bán Nguyệt"},
    {"address": "14 Đường số 6, Tân Phong, Quận 7, TP.HCM", "lat": 10.732456, "lng": 106.708912, "type": "Homestay", "area": "Khu Sky Garden"},

    # --- BÌNH THẠNH ---
    {"address": "208 Nguyễn Hữu Cảnh, Phường 22, Bình Thạnh, TP.HCM", "lat": 10.795122, "lng": 106.721768, "type": "Căn hộ", "area": "Vinhomes Central Park"},
    {"address": "720A Điện Biên Phủ, Phường 22, Bình Thạnh, TP.HCM", "lat": 10.796123, "lng": 106.723456, "type": "Khách sạn", "area": "Landmark 81"},
    {"address": "561A Điện Biên Phủ, Phường 25, Bình Thạnh, TP.HCM", "lat": 10.799563, "lng": 106.718654, "type": "Khách sạn", "area": "Pearl Plaza"},
    {"address": "48 Ngô Tất Tố, Phường 19, Bình Thạnh, TP.HCM", "lat": 10.792345, "lng": 106.711234, "type": "Căn hộ", "area": "City Garden"},
    {"address": "30 Nguyễn Gia Trí, Phường 25, Bình Thạnh, TP.HCM", "lat": 10.803456, "lng": 106.716789, "type": "Homestay", "area": "Đại học Hutech"},

    # --- QUẬN 10 (Mới) ---
    {"address": "200 Đường 3/2, Phường 12, Quận 10, TP.HCM", "lat": 10.771234, "lng": 106.678901, "type": "Căn hộ", "area": "Hà Đô Centrosa"},
    {"address": "11 Sư Vạn Hạnh, Phường 12, Quận 10, TP.HCM", "lat": 10.775678, "lng": 106.669123, "type": "Khách sạn", "area": "Vạn Hạnh Mall"},
    {"address": "242 Thành Thái, Phường 14, Quận 10, TP.HCM", "lat": 10.778901, "lng": 106.662345, "type": "Căn hộ", "area": "Rivera Park"},

    # --- TÂN BÌNH (Mới - Khu sân bay) ---
    {"address": "60A Trường Sơn, Phường 2, Tân Bình, TP.HCM", "lat": 10.811234, "lng": 106.663456, "type": "Khách sạn", "area": "Sân bay Tân Sơn Nhất"},
    {"address": "1 Cộng Hòa, Phường 4, Tân Bình, TP.HCM", "lat": 10.802345, "lng": 106.660123, "type": "Khách sạn", "area": "Vòng xoay Lăng Cha Cả"},
    {"address": "30 Bàu Cát, Phường 14, Tân Bình, TP.HCM", "lat": 10.798901, "lng": 106.645678, "type": "Homestay", "area": "Khu Bàu Cát"},

    # --- PHÚ NHUẬN (Mới - Khu ăn uống) ---
    {"address": "100 Phan Xích Long, Phường 2, Phú Nhuận, TP.HCM", "lat": 10.798123, "lng": 106.689456, "type": "Homestay", "area": "Phố ẩm thực Phan Xích Long"},
    {"address": "17 Nguyễn Văn Trỗi, Phường 12, Phú Nhuận, TP.HCM", "lat": 10.792345, "lng": 106.680123, "type": "Căn hộ", "area": "The Prince Residence"}
]

TRAVEL_KEYWORDS = [
    "thích leo núi", "yêu biển", "đam mê ẩm thực đường phố", "thích chụp ảnh check-in",
    "muốn tìm nơi yên tĩnh để đọc sách", "thích không khí náo nhiệt về đêm", 
    "du lịch bụi tiết kiệm", "nghỉ dưỡng sang trọng (luxury)", "yêu động vật (pet-friendly)"
]

INTRO_TEMPLATES = [
    "Xin chào, mình là người {}.",
    "Sở thích của mình là {}. Rất vui được làm quen!",
    "Mình đang tìm kiếm chuyến đi {} để xả stress.",
]

def clean_database(db: Session):
    print("--- ĐANG DỌN DẸP DATABASE CŨ... ---")
    try:
        db.execute(text("SET FOREIGN_KEY_CHECKS = 0;"))
        db.execute(text("TRUNCATE TABLE review;"))
        db.execute(text("TRUNCATE TABLE booking;"))
        db.execute(text("TRUNCATE TABLE accommodation;"))
        db.execute(text("TRUNCATE TABLE users;")) 
        db.execute(text("SET FOREIGN_KEY_CHECKS = 1;"))
        db.commit()
        print("✅ Đã xóa sạch và RESET ID về 1!")
    except Exception as e:
        print(f"❌ Lỗi dọn dẹp: {e}")
        db.rollback()

def seed_data():
    db = SessionLocal()
    
    #Giữ object sống sau khi commit để dùng tiếp
    db.expire_on_commit = False 

    try:
        clean_database(db)
        print("--- BẮT ĐẦU TẠO DỮ LIỆU MỚI ---")

        # ---------------------------------------------------------
        # 1. TẠO USERS
        # ---------------------------------------------------------
        users = []
        print("1. Đang tạo 30 users...")
        for i in range(30):
            role_choice = random.choice([UserRole.traveler, UserRole.owner])
            selected_interests = random.sample(TRAVEL_KEYWORDS, k=2)
            interests_str = " và ".join(selected_interests)
            preference_text = random.choice(INTRO_TEMPLATES).format(interests_str)
            
            user = User(
                username=f"user{i+1}",
                hashed_password="$2b$12$NeY7zOA8DIIdBNfzk9vXAeM.6hJTz2ICk69A6yagqqx3D5JgOhRHC", # pass: 123456
                email=f"user{i+1}@example.com",
                full_name=fake.name(),
                sex=random.choice(["Nam", "Nữ", "Khác"]),
                dob=fake.date_of_birth(minimum_age=18, maximum_age=40),
                role=role_choice,
                phone=f"09{random.randint(10000000, 99999999)}",
                preference=preference_text
            )
            db.add(user)
            users.append(user)
        
        db.commit() 

        owners = [u for u in users if u.role == UserRole.owner]
        if not owners:
            users[0].role = UserRole.owner
            owners.append(users[0])
            db.commit()

        # ---------------------------------------------------------
        # 2. TẠO ACCOMMODATION
        # ---------------------------------------------------------
        accommodations = []
        print("2. Đang tạo Accommodation từ dữ liệu thực tế...")
        
        prop_type_map = {
            "Khách sạn": "Khách sạn", "Căn hộ": "Căn hộ", 
            "Homestay": "Homestay", "Villa": "Biệt thự", "Biệt thự": "Biệt thự"
        }

        for real_place in REAL_ESTATES:
            owner = random.choice(owners)
            adjectives = ["View đẹp", "Thoáng mát", "Luxury", "Cozy", "Hiện đại", "Vintage"]
            title = f"{real_place['type']} {real_place['area']} - {random.choice(adjectives)}"
            desc = f"Nằm ngay tại {real_place['address']}. {real_place['type']} này rất thuận tiện để di chuyển tham quan {real_place['area']}. Đầy đủ tiện nghi: Wifi, Máy lạnh, Bếp..."

            accom = Accommodation(
                owner_id=owner.id,
                title=title,                
                description=desc,
                location=real_place['address'],
                property_type=prop_type_map.get(real_place['type'], "Khách sạn"),
                max_guests=random.choice([2, 4, 6]),
                price=Decimal(random.randint(500, 3000) * 1000),
                status='available',
                picture_url=f"https://picsum.photos/seed/{random.randint(1,1000)}/800/600",
                latitude=Decimal(real_place['lat']),
                longitude=Decimal(real_place['lng'])
            )
            db.add(accom)
            accommodations.append(accom)
            
        db.commit()
        print(f"--- ĐÃ TẠO {len(accommodations)} CHỖ Ở TẠI CÁC VỊ TRÍ THẬT ---")

        # ---------------------------------------------------------
        # 3. TẠO BOOKING
        # ---------------------------------------------------------
        bookings = []
        print("3. Đang tạo 50 lượt đặt phòng (Booking)...")
        
        travelers = [u for u in users if u.role == UserRole.traveler]
        if not travelers: travelers = users 

        for _ in range(50):
            guest = random.choice(travelers)
            accom = random.choice(accommodations)
            
            is_past = random.choice([True, False])
            today = date.today()
            
            if is_past:
                start_date = today - timedelta(days=random.randint(5, 60))
                status = 'completed' 
            else:
                start_date = today + timedelta(days=random.randint(1, 60))
                status = random.choice(['confirmed', 'confirmed', 'pending_confirmation', 'cancelled'])

            stay_days = random.randint(1, 5)
            end_date = start_date + timedelta(days=stay_days)
            
            num_guests = random.randint(1, accom.max_guests)
            num_rooms = 1 if num_guests <= 2 else 2
            total = accom.price * stay_days
            code = str(uuid.uuid4())[:8].upper()

            booking = Booking(
                user_id=guest.id,
                accommodation_id=accom.accommodation_id,
                date_start=start_date,   
                date_end=end_date,
                guests=num_guests,
                rooms=num_rooms,
                total_price=total,
                status=status,
                booking_code=code
            )
            db.add(booking)
            bookings.append(booking)

        db.commit()
        print(f"--- ĐÃ TẠO {len(bookings)} BOOKING THÀNH CÔNG ---")

    except Exception as e:
        print(f"CÓ LỖI XẢY RA: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()