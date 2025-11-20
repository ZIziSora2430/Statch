import random
from datetime import date, timedelta
from faker import Faker
from sqlalchemy.orm import Session
from sqlalchemy import text
from decimal import Decimal

# Import chuẩn từ app
from app.database import SessionLocal, engine
from app.models import User, Accommodation, Booking, Review, UserRole 

fake = Faker(['vi_VN'])

# --- BỘ DỮ LIỆU ĐỊA ĐIỂM THẬT TẠI TP.HCM (Coordinates chuẩn Google Maps/OSM) ---
REAL_ESTATES = [
    # QUẬN 1 (Trung tâm - Khách sạn & Homestay cao cấp)
    {
        "address": "2 Công xã Paris, Bến Nghé, Quận 1, TP.HCM",
        "lat": 10.779785, "lng": 106.699018, "type": "Khách sạn", "area": "Nhà thờ Đức Bà"
    },
    {
        "address": "135 Nam Kỳ Khởi Nghĩa, Bến Thành, Quận 1, TP.HCM",
        "lat": 10.776993, "lng": 106.695353, "type": "Khách sạn", "area": "Dinh Độc Lập"
    },
    {
        "address": "36 Hồ Tùng Mậu, Bến Nghé, Quận 1, TP.HCM",
        "lat": 10.771867, "lng": 106.703461, "type": "Homestay", "area": "Bitexco"
    },
    {
        "address": "18 An Dương Vương, Phường 9, Quận 5, TP.HCM",
        "lat": 10.757772, "lng": 106.670552, "type": "Khách sạn", "area": "Windsor Plaza"
    },
    {
        "address": "10B Tôn Đức Thắng, Bến Nghé, Quận 1, TP.HCM",
        "lat": 10.780393, "lng": 106.706667, "type": "Khách sạn", "area": "Bờ sông Sài Gòn"
    },

    # QUẬN 2 (Thảo Điền - Villa & Căn hộ cao cấp)
    {
        "address": "161 Xa lộ Hà Nội, Thảo Điền, Quận 2, TP.HCM",
        "lat": 10.801863, "lng": 106.740772, "type": "Căn hộ", "area": "Masteri Thảo Điền"
    },
    {
        "address": "28 Trần Ngọc Diện, Thảo Điền, Quận 2, TP.HCM",
        "lat": 10.805052, "lng": 106.733364, "type": "Villa", "area": "Khu biệt thự Thảo Điền"
    },
    {
        "address": "21 Võ Trường Toản, An Phú, Quận 2, TP.HCM",
        "lat": 10.803542, "lng": 106.734532, "type": "Căn hộ", "area": "Gateway Thảo Điền"
    },
    {
        "address": "1 Đường số 10, Thảo Điền, Quận 2, TP.HCM",
        "lat": 10.807120, "lng": 106.728900, "type": "Homestay", "area": "Ven sông Sài Gòn"
    },

    # QUẬN 7 (Phú Mỹ Hưng - Căn hộ & Yên tĩnh)
    {
        "address": "101 Tôn Dật Tiên, Tân Phú, Quận 7, TP.HCM",
        "lat": 10.729568, "lng": 106.721627, "type": "Căn hộ", "area": "Crescent Mall"
    },
    {
        "address": "79 Nguyễn Văn Linh, Tân Phong, Quận 7, TP.HCM",
        "lat": 10.730678, "lng": 106.706345, "type": "Căn hộ", "area": "Vivo City"
    },
    {
        "address": "801 Nguyễn Văn Linh, Tân Phú, Quận 7, TP.HCM",
        "lat": 10.721122, "lng": 106.711233, "type": "Homestay", "area": "Hồ Bán Nguyệt"
    },

    # BÌNH THẠNH (Landmark - Căn hộ view đẹp)
    {
        "address": "208 Nguyễn Hữu Cảnh, Phường 22, Bình Thạnh, TP.HCM",
        "lat": 10.795122, "lng": 106.721768, "type": "Căn hộ", "area": "Vinhomes Central Park"
    },
    {
        "address": "561A Điện Biên Phủ, Phường 25, Bình Thạnh, TP.HCM",
        "lat": 10.799563, "lng": 106.718654, "type": "Khách sạn", "area": "Pearl Plaza"
    },
    {
        "address": "600 Điện Biên Phủ, Phường 22, Bình Thạnh, TP.HCM",
        "lat": 10.793838, "lng": 106.713263, "type": "Homestay", "area": "Khu Văn Thánh"
    },

    # QUẬN 3 (Yên tĩnh, lãng mạn)
    {
        "address": "6 Pasteur, Phường 6, Quận 3, TP.HCM",
        "lat": 10.785321, "lng": 106.693732, "type": "Biệt thự", "area": "Hồ Con Rùa"
    },
    {
        "address": "193 Lý Chính Thắng, Võ Thị Sáu, Quận 3, TP.HCM",
        "lat": 10.788213, "lng": 106.685521, "type": "Khách sạn", "area": "Nam Kỳ Khởi Nghĩa"
    }
]

# Bộ từ khóa sở thích
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
    """
    Dùng TRUNCATE để xóa dữ liệu và RESET ID về 1
    """
    print("--- ĐANG DỌN DẸP DATABASE CŨ... ---")
    try:
        # 1. Tắt kiểm tra khóa ngoại (Bắt buộc để chạy TRUNCATE)
        db.execute(text("SET FOREIGN_KEY_CHECKS = 0;"))
        
        # 2. Dùng TRUNCATE thay vì delete()
        # Lưu ý: Phải viết đúng tên bảng trong Database (thường là chữ thường hoặc y hệt __tablename__)
        print("-> Đang Reset bảng Review...")
        db.execute(text("TRUNCATE TABLE review;"))
        
        print("-> Đang Reset bảng Booking...")
        db.execute(text("TRUNCATE TABLE booking;"))
        
        print("-> Đang Reset bảng Accommodation...")
        db.execute(text("TRUNCATE TABLE accommodation;"))
        
        print("-> Đang Reset bảng Users...")
        db.execute(text("TRUNCATE TABLE users;")) 
        
        # 3. Bật lại kiểm tra khóa ngoại
        db.execute(text("SET FOREIGN_KEY_CHECKS = 1;"))
        db.commit()
        print("✅ Đã xóa sạch và RESET ID về 1!")
        
    except Exception as e:
        print(f"❌ Lỗi dọn dẹp: {e}")
        db.rollback()


def seed_data():
    db = SessionLocal()
    try:
        clean_database(db)
        print("--- BẮT ĐẦU TẠO DỮ LIỆU MỚI ---")

        # 1. TẠO USERS
        users = []
        print("1. Đang tạo 30 users...")
        for i in range(30):
            profile = fake.profile()
            role_choice = random.choice([UserRole.traveler, UserRole.owner])
            
            selected_interests = random.sample(TRAVEL_KEYWORDS, k=2)
            interests_str = " và ".join(selected_interests)
            preference_text = random.choice(INTRO_TEMPLATES).format(interests_str)
            
            user = User(
                username=f"user{i+1}", # Username dễ nhớ để test: user1, user2...
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
        # Đảm bảo luôn có ít nhất 1 owner
        if not owners:
            users[0].role = UserRole.owner
            owners.append(users[0])
            db.commit()

        # 2. TẠO ACCOMMODATION (Dùng dữ liệu thật)
        accommodations = []
        print("2. Đang tạo Accommodation từ dữ liệu thực tế...")
        
        # Lặp qua danh sách địa điểm thật
        for real_place in REAL_ESTATES:
            owner = random.choice(owners)
            
            # Tạo tiêu đề hấp dẫn dựa trên địa danh
            adjectives = ["View đẹp", "Thoáng mát", "Luxury", "Cozy", "Hiện đại", "Vintage"]
            title = f"{real_place['type']} {real_place['area']} - {random.choice(adjectives)}"
            
            # Tạo mô tả phù hợp
            desc = f"Nằm ngay tại {real_place['address']}. {real_place['type']} này rất thuận tiện để di chuyển tham quan {real_place['area']}. Đầy đủ tiện nghi: Wifi, Máy lạnh, Bếp..."

            # Xác định Property Type cho đúng chuẩn Enum/Select của bạn
            # (Map từ data của tôi sang data của bạn)
            prop_type_map = {
                "Khách sạn": "Khách sạn",
                "Căn hộ": "Căn hộ", 
                "Homestay": "Homestay",
                "Villa": "Biệt thự",
                "Biệt thự": "Biệt thự"
            }
            
            accom = Accommodation(
                owner_id=owner.id,
                title=title,                
                description=desc,
                location=real_place['address'], # Dùng địa chỉ thật
                property_type=prop_type_map.get(real_place['type'], "Khách sạn"),
                max_guests=random.choice([2, 4, 6]),
                price=Decimal(random.randint(500, 3000) * 1000),
                status='available',
                picture_url=f"https://picsum.photos/seed/{random.randint(1,1000)}/800/600",
                
                # TỌA ĐỘ CHUẨN CỦA ĐỊA ĐIỂM ĐÓ
                latitude=Decimal(real_place['lat']),
                longitude=Decimal(real_place['lng'])
            )
            db.add(accom)
            accommodations.append(accom)
            
        db.commit()

        print(f"--- ĐÃ TẠO {len(accommodations)} CHỖ Ở TẠI CÁC VỊ TRÍ THẬT ---")
        print("Hãy thử mở map lên, ghim sẽ nằm đúng ngay tòa nhà/con đường đó!")

    except Exception as e:
        print(f"CÓ LỖI XẢY RA: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()