# app/seed_data.py
import random
import uuid
from datetime import date, timedelta
from decimal import Decimal

from faker import Faker
from sqlalchemy import text
from sqlalchemy.orm import Session

# Import chuẩn từ app
from app.database import SessionLocal, engine
from app.models import (
    User, Accommodation, Booking, Review, Post, Reply, Notification, # <--- Thêm Notification
    UserRole, PostCategory, PostStatus
)

fake = Faker(['vi_VN'])

# --- BỘ DỮ LIỆU ĐỊA ĐIỂM THẬT TẠI TP.HCM ---
REAL_ESTATES = [
    {"address": "2 Công xã Paris, Bến Nghé, Quận 1, TP.HCM", "lat": 10.779785, "lng": 106.699018, "type": "Khách sạn", "area": "Nhà thờ Đức Bà"},
    {"address": "135 Nam Kỳ Khởi Nghĩa, Bến Thành, Quận 1, TP.HCM", "lat": 10.776993, "lng": 106.695353, "type": "Khách sạn", "area": "Dinh Độc Lập"},
    {"address": "36 Hồ Tùng Mậu, Bến Nghé, Quận 1, TP.HCM", "lat": 10.771867, "lng": 106.703461, "type": "Homestay", "area": "Bitexco"},
    {"address": "183 Bùi Viện, Phường Phạm Ngũ Lão, Quận 1, TP.HCM", "lat": 10.767432, "lng": 106.692341, "type": "Homestay", "area": "Phố Tây Bùi Viện"},
    {"address": "68 Nguyễn Huệ, Bến Nghé, Quận 1, TP.HCM", "lat": 10.774409, "lng": 106.703831, "type": "Khách sạn", "area": "Phố đi bộ Nguyễn Huệ"},
    {"address": "6 Pasteur, Phường 6, Quận 3, TP.HCM", "lat": 10.785321, "lng": 106.693732, "type": "Biệt thự", "area": "Hồ Con Rùa"},
    {"address": "117 Nguyễn Đình Chiểu, Phường 6, Quận 3, TP.HCM", "lat": 10.779340, "lng": 106.691510, "type": "Căn hộ", "area": "Léman Luxury"},
    {"address": "151 Bến Vân Đồn, Phường 6, Quận 4, TP.HCM", "lat": 10.763012, "lng": 106.696123, "type": "Căn hộ", "area": "River Gate Residence"},
    {"address": "18 An Dương Vương, Phường 9, Quận 5, TP.HCM", "lat": 10.757772, "lng": 106.670552, "type": "Khách sạn", "area": "Windsor Plaza"},
    {"address": "161 Xa lộ Hà Nội, Thảo Điền, Quận 2, TP.HCM", "lat": 10.801863, "lng": 106.740772, "type": "Căn hộ", "area": "Masteri Thảo Điền"},
    {"address": "28 Trần Ngọc Diện, Thảo Điền, Quận 2, TP.HCM", "lat": 10.805052, "lng": 106.733364, "type": "Villa", "area": "Khu biệt thự Thảo Điền"},
    {"address": "101 Tôn Dật Tiên, Tân Phú, Quận 7, TP.HCM", "lat": 10.729568, "lng": 106.721627, "type": "Căn hộ", "area": "Crescent Mall"},
    {"address": "208 Nguyễn Hữu Cảnh, Phường 22, Bình Thạnh, TP.HCM", "lat": 10.795122, "lng": 106.721768, "type": "Căn hộ", "area": "Vinhomes Central Park"},
    {"address": "720A Điện Biên Phủ, Phường 22, Bình Thạnh, TP.HCM", "lat": 10.796123, "lng": 106.723456, "type": "Khách sạn", "area": "Landmark 81"},
    {"address": "60A Trường Sơn, Phường 2, Tân Bình, TP.HCM", "lat": 10.811234, "lng": 106.663456, "type": "Khách sạn", "area": "Sân bay Tân Sơn Nhất"},
    {"address": "100 Phan Xích Long, Phường 2, Phú Nhuận, TP.HCM", "lat": 10.798123, "lng": 106.689456, "type": "Homestay", "area": "Phố ẩm thực Phan Xích Long"},
]

TRAVEL_KEYWORDS = [
    "thích leo núi", "yêu biển", "đam mê ẩm thực", "thích check-in",
    "muốn yên tĩnh", "thích náo nhiệt", "du lịch bụi", "luxury", "yêu động vật"
]

FORUM_TOPICS = [
    ("Kinh nghiệm đi Đà Lạt mùa mưa?", PostCategory.questions),
    ("Review chuyến đi Phú Quốc 3 ngày 2 đêm", PostCategory.reviews),
    ("Top 5 quán cà phê đẹp ở Quận 1", PostCategory.tips),
    ("Cần tìm bạn đồng hành đi Tây Bắc", PostCategory.general),
    ("Câu chuyện bị lừa khi đặt phòng online và bài học", PostCategory.stories),
    ("Hỏi về thủ tục thuê xe máy ở Đà Nẵng", PostCategory.questions),
    ("Review Homestay X ở Sapa - Quá thất vọng!", PostCategory.reviews),
]

def clean_database(db: Session):
    """Xóa sạch dữ liệu cũ để tránh trùng lặp"""
    print("🧹 ĐANG DỌN DẸP DATABASE CŨ...")
    try:
        # Tắt kiểm tra khóa ngoại để xóa thoải mái
        db.execute(text("SET FOREIGN_KEY_CHECKS = 0;"))
        
        # Xóa theo thứ tự (tên bảng phải khớp trong database)
        # Lưu ý: "Notification" viết hoa nếu trong models.py __tablename__ viết hoa
        tables = ["replies", "posts", "reviews", "bookings", "accommodations", "Notification", "users"]
        for table in tables:
            try:
                db.execute(text(f"TRUNCATE TABLE {table};"))
            except Exception as table_err:
                # Fallback nếu tên bảng là chữ thường (tùy config MySQL/MariaDB)
                db.execute(text(f"TRUNCATE TABLE {table.lower()};"))
            
        db.execute(text("SET FOREIGN_KEY_CHECKS = 1;"))
        db.commit()
        print("✅ Đã xóa sạch dữ liệu cũ!")
    except Exception as e:
        print(f"❌ Lỗi dọn dẹp (có thể bỏ qua nếu lần đầu chạy): {e}")
        db.rollback()

def seed_data():
    db = SessionLocal()
    db.expire_on_commit = False 

    try:
        clean_database(db)
        print("\n🌱 BẮT ĐẦU TẠO DỮ LIỆU MỚI...")

        # =====================================================
        # 1. TẠO USERS
        # =====================================================
        users = []
        print("👤 1. Đang tạo 30 users...")
        
        # Tạo mật khẩu hash chung: "password123"
        common_password_hash = "$2b$12$10WVg2p82V.cdKfv46RzJe5EYwrf4cy7VofdKpwh7hiGU5x0I9YIa"
        
        for i in range(30):
            role = random.choice([UserRole.traveler, UserRole.owner])
            interests = " và ".join(random.sample(TRAVEL_KEYWORDS, k=2))
            
            user = User(
                username=f"user{i+1}",
                password_hash=common_password_hash, 
                email=f"user{i+1}@example.com",
                full_name=fake.name(),
                sex=random.choice(["Nam", "Nữ", "Khác"]),
                dob=fake.date_of_birth(minimum_age=18, maximum_age=40),
                role=role,
                phone=f"09{random.randint(10000000, 99999999)}",
                preference=f"Mình là người {interests}.",
                is_verified_traveler=random.choice([True, False])
            )
            db.add(user)
            users.append(user)
        
        db.commit() 
        
        # Đảm bảo có ít nhất 1 owner và 1 traveler
        owners = [u for u in users if u.role == UserRole.owner]
        travelers = [u for u in users if u.role == UserRole.traveler]
        
        if not owners: 
            users[0].role = UserRole.owner; owners.append(users[0])
        if not travelers:
            users[1].role = UserRole.traveler; travelers.append(users[1])
            
        db.commit()

        # =====================================================
        # 2. TẠO ACCOMMODATIONS
        # =====================================================
        accommodations = []
        print(f"🏠 2. Đang tạo {len(REAL_ESTATES)} chỗ ở từ dữ liệu thật...")
        
        AVAILABLE_TAGS = [
        "wifi", "ac", "parking", "kitchen", "pool", "gym", 
        "breakfast", "pet_friendly", "balcony", "view", "washing_machine"
        ]

        # Số lượng tags ngẫu nhiên sẽ được chọn cho mỗi chỗ ở (ví dụ: từ 3 đến 6 tags)
        MIN_TAGS = 3
        MAX_TAGS = 6


        for real_place in REAL_ESTATES:
            owner = random.choice(owners)
            adjectives = ["View đẹp", "Luxury", "Cozy", "Hiện đại", "Vintage", "Thoáng mát"]
            
            # 1. Chọn ngẫu nhiên số lượng tags
            num_tags_to_pick = random.randint(MIN_TAGS, MAX_TAGS)
            
            # 2. Chọn ngẫu nhiên tags từ danh sách có sẵn (không lặp lại)
            random_tags_list = random.sample(AVAILABLE_TAGS, num_tags_to_pick)
            
            # 3. Chuyển list thành chuỗi phân cách bằng dấu phẩy
            dynamic_tags = ",".join(random_tags_list)

            accom = Accommodation(
                owner_id=owner.id,
                title=f"{real_place['type']} {real_place['area']} - {random.choice(adjectives)}",
                description=f"Nằm tại {real_place['address']}. Rất gần {real_place['area']}. Tiện nghi đầy đủ.",
                location=real_place['address'],
                property_type=real_place['type'],
                max_guests=random.choice([2, 4, 6, 8]),
                price=Decimal(random.randint(500, 5000) * 1000),
                status='available',
                picture_url=f"https://picsum.photos/seed/{random.randint(1,1000)}/800/600",
                latitude=Decimal(real_place['lat']),
                longitude=Decimal(real_place['lng']),
                tags=dynamic_tags # ✅ Thêm tags
            )
            db.add(accom)
            accommodations.append(accom)
            
        db.commit()

        # =====================================================
        # 3. TẠO BOOKINGS & REVIEWS
        # =====================================================
        bookings = []
        reviews = []
        print("📅 3. Đang tạo Bookings và Reviews...")
        
        for _ in range(50):
            guest = random.choice(travelers)
            accom = random.choice(accommodations)
            
            # Random ngày
            is_past = random.choice([True, False])
            today = date.today()
            
            if is_past:
                # Booking trong quá khứ -> Completed
                start_date = today - timedelta(days=random.randint(10, 60))
                status = 'completed'
            else:
                # Booking tương lai
                start_date = today + timedelta(days=random.randint(1, 30))
                status = random.choice(['confirmed', 'pending_confirmation', 'cancelled'])

            stay_days = random.randint(1, 5)
            end_date = start_date + timedelta(days=stay_days)
            
            # Tính tiền (Giá * Số đêm) - Logic mới không có rooms
            total = accom.price * stay_days

            # Tạo Booking (ĐÃ SỬA: Bỏ rooms, thêm note)
            booking = Booking(
                user_id=guest.id,
                accommodation_id=accom.accommodation_id,
                date_start=start_date,   
                date_end=end_date,
                guests=random.randint(1, accom.max_guests),
                # rooms=1, <--- Đã xóa
                note=fake.sentence(), # <--- Đã thêm
                total_price=total,
                status=status,
                booking_code=str(uuid.uuid4())[:8].upper()
            )
            db.add(booking)
            bookings.append(booking)
            
            # Tạo Review nếu booking đã hoàn thành
            if status == 'completed' and random.random() > 0.3:
                review = Review(
                    user_id=guest.id,
                    accommodation_id=accom.accommodation_id,
                    rating=random.randint(3, 5),
                    content=fake.paragraph(nb_sentences=2)
                )
                db.add(review)
                reviews.append(review)

        db.commit()
        print(f"   - Đã tạo {len(bookings)} bookings.")
        print(f"   - Đã tạo {len(reviews)} reviews.")

        # =====================================================
        # 4. TẠO FORUM POSTS & REPLIES
        # =====================================================
        print("💬 4. Đang tạo dữ liệu Forum...")
        
        posts = []
        for _ in range(20):
            author = random.choice(users)
            topic_title, topic_cat = random.choice(FORUM_TOPICS)
            
            post = Post(
                user_id=author.id,
                title=f"{topic_title} #{random.randint(1, 100)}",
                content=fake.text(max_nb_chars=500),
                category=topic_cat,
                status=PostStatus.active,
                views_count=random.randint(10, 500),
                replies_count=0 
            )
            db.add(post)
            posts.append(post)
        
        db.commit()
        
        # Tạo replies
        replies_count = 0
        for post in posts:
            num_replies = random.randint(0, 5)
            post.replies_count = num_replies
            
            for _ in range(num_replies):
                replier = random.choice(users)
                reply = Reply(
                    post_id=post.id,
                    user_id=replier.id,
                    content=fake.sentence(nb_words=15),
                    status=PostStatus.active
                )
                db.add(reply)
                replies_count += 1
                
        db.commit()
        print(f"   - Đã tạo {len(posts)} bài viết và {replies_count} bình luận.")

        # =====================================================
        # 5. TẠO NOTIFICATIONS (MỚI THÊM)
        # =====================================================
        print("🔔 5. Đang tạo Notifications...")
        for u in users:
            # Random 0-3 thông báo cho mỗi user
            for _ in range(random.randint(0, 3)):
                noti = Notification(
                    user_id=u.id,
                    message=random.choice([
                        "Đơn đặt phòng #123 của bạn đã được xác nhận.",
                        "Chào mừng bạn đến với Statch!",
                        "Bạn có tin nhắn mới từ chủ nhà.",
                        "Ưu đãi giảm giá 20% cho chuyến đi tiếp theo."
                    ]),
                    is_read=random.choice([True, False])
                )
                db.add(noti)
        db.commit()
        print("   - Đã tạo notifications thành công.")

        print("\n✅ SEED DATA SUCCESSFUL! (User pass: 123456)")

    except Exception as e:
        print(f"\n❌ CÓ LỖI XẢY RA: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()