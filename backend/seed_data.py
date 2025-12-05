# app/seed_data.py
import random
import uuid
from datetime import date, timedelta
from decimal import Decimal

from faker import Faker
from sqlalchemy import text
from sqlalchemy.orm import Session

# Import chuẩn từ app
from app.database import SessionLocal
from app.models import (
    User, Accommodation, Booking, Review, Post, Reply,
    UserRole, PostLocation, PostStatus
    # Đã bỏ import Notification vì không dùng để tạo data
)

fake = Faker(['vi_VN'])

# =====================================================
# DỮ LIỆU CỐ ĐỊNH (CONSTANTS)
# =====================================================

# 1. Kho ảnh Unsplash chất lượng cao theo từng loại hình
IMAGE_COLLECTIONS = {
    "Homestay": [
        "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=80", # Phòng khách ấm cúng
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80", # Decor hiện đại
        "https://images.unsplash.com/photo-1512918760532-3ed64bc80409?auto=format&fit=crop&w=800&q=80", # Căn hộ thoáng
        "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80", # Sofa xám
    ],
    "Căn hộ": [
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80", # Loft style
        "https://images.unsplash.com/photo-1484154218962-a1c002085d2f?auto=format&fit=crop&w=800&q=80", # Bếp hiện đại
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80", # Phòng khách sang
        "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=800&q=80", # View đẹp
    ],
    "Khách sạn": [
        "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80", # Giường trắng
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80", # Resort
        "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80", # Sảnh chờ
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80", # Phòng gỗ
    ],
    "Biệt thự": [
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80", # Villa hiện đại
        "https://images.unsplash.com/photo-1575517111478-7f60e01f51f6?auto=format&fit=crop&w=800&q=80", # Có hồ bơi
        "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80", # Sân vườn
        "https://images.unsplash.com/photo-1600596542815-22b845069566?auto=format&fit=crop&w=800&q=80", # Biệt thự kính
    ],
    # Fallback
    "Villa": [
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1575517111478-7f60e01f51f6?auto=format&fit=crop&w=800&q=80",
    ]
}

# 2. Ngân hàng phổ biến tại VN
BANKS = ["Vietcombank", "Techcombank", "MB Bank", "ACB", "TPBank", "VPBank"]

# 3. Địa điểm thực tế
REAL_ESTATES = [
    {"address": "2 Công xã Paris, Bến Nghé, Quận 1, TP.HCM", "lat": 10.779785, "lng": 106.699018, "type": "Khách sạn", "area": "Nhà thờ Đức Bà"},
    {"address": "135 Nam Kỳ Khởi Nghĩa, Bến Thành, Quận 1, TP. HCM", "lat": 10.776993, "lng": 106.695353, "type": "Khách sạn", "area": "Dinh Độc Lập"},
    {"address": "36 Hồ Tùng Mậu, Bến Nghé, Quận 1, TP.HCM", "lat": 10.771867, "lng": 106.703461, "type": "Homestay", "area": "Bitexco"},
    {"address": "183 Bùi Viện, Phường Phạm Ngũ Lão, Quận 1, TP. HCM", "lat": 10.767432, "lng": 106.692341, "type": "Homestay", "area": "Phố Tây Bùi Viện"},
    {"address": "68 Nguyễn Huệ, Bến Nghé, Quận 1, TP.HCM", "lat": 10.774409, "lng": 106.703831, "type": "Khách sạn", "area": "Phố đi bộ Nguyễn Huệ"},
    {"address": "6 Pasteur, Phường 6, Quận 3, TP.HCM", "lat": 10.785321, "lng": 106.693732, "type": "Biệt thự", "area": "Hồ Con Rùa"},
    {"address": "117 Nguyễn Đình Chiểu, Phường 6, Quận 3, TP.HCM", "lat": 10.779340, "lng": 106.691510, "type": "Căn hộ", "area": "Léman Luxury"},
    {"address": "151 Bến Vân Đồn, Phường 6, Quận 4, TP.HCM", "lat": 10.763012, "lng": 106.696123, "type": "Căn hộ", "area": "River Gate Residence"},
    {"address": "18 An Dương Vương, Phường 9, Quận 5, TP.HCM", "lat": 10.757772, "lng": 106.670552, "type": "Khách sạn", "area": "Windsor Plaza"},
    {"address": "161 Xa lộ Hà Nội, Thảo Điền, Quận 2, TP.HCM", "lat": 10.801863, "lng": 106.740772, "type": "Căn hộ", "area": "Masteri Thảo Điền"},
    {"address": "28 Trần Ngọc Diện, Thảo Điền, Quận 2, TP. HCM", "lat": 10.805052, "lng": 106.733364, "type": "Biệt thự", "area": "Khu biệt thự Thảo Điền"},
    {"address": "101 Tôn Dật Tiên, Tân Phú, Quận 7, TP.HCM", "lat": 10.729568, "lng": 106.721627, "type": "Căn hộ", "area": "Crescent Mall"},
    {"address": "208 Nguyễn Hữu Cảnh, Phường 22, Bình Thạnh, TP.HCM", "lat": 10.795122, "lng": 106.721768, "type": "Căn hộ", "area": "Vinhomes Central Park"},
    {"address": "720A Điện Biên Phủ, Phường 22, Bình Thạnh, TP. HCM", "lat": 10.796123, "lng": 106.723456, "type": "Khách sạn", "area": "Landmark 81"},
    {"address": "60A Trường Sơn, Phường 2, Tân Bình, TP. HCM", "lat": 10.811234, "lng": 106.663456, "type": "Khách sạn", "area": "Sân bay Tân Sơn Nhất"},
    {"address": "100 Phan Xích Long, Phường 2, Phú Nhuận, TP. HCM", "lat": 10.798123, "lng": 106.689456, "type": "Homestay", "area": "Phố ẩm thực Phan Xích Long"},
]

TRAVEL_KEYWORDS = [
    "thích leo núi", "yêu biển", "đam mê ẩm thực", "thích check-in",
    "muốn yên tĩnh", "thích náo nhiệt", "du lịch bụi", "luxury", "yêu động vật"
]

FORUM_TOPICS = [
    ("Kinh nghiệm tìm homestay ở", PostLocation.district1),
    ("Review chỗ ở giá rẻ tại", PostLocation.district3),
    ("Top 5 quán cà phê đẹp ở", PostLocation.district1),
    ("Cần tìm bạn đồng hành khám phá", PostLocation.thu_duc),
    ("Câu chuyện du lịch thú vị tại", PostLocation.district7),
    ("Hỏi về chỗ ở an toàn ở", PostLocation.binh_thanh),
    ("Review Homestay X ở", PostLocation.phu_nhuan),
    ("Địa điểm check-in đẹp tại", PostLocation.district2),
    ("Tìm phòng trọ sinh viên ở", PostLocation.go_vap),
    ("Kinh nghiệm thuê căn hộ tại", PostLocation.district4),
]

def clean_database(db: Session):
    """Xóa sạch dữ liệu cũ để tránh trùng lặp"""
    print("🧹 ĐANG DỌN DẸP DATABASE CŨ...")
    try:
        db.execute(text("SET FOREIGN_KEY_CHECKS = 0;"))
        # Vẫn xóa bảng Notification nếu có dữ liệu cũ, dù lần này không tạo mới
        tables = [
            "Notification", "replies", "posts", "reviews", 
            "bookings", "accommodations", "users"
        ]
        for table in tables:
            try:
                db.execute(text(f"TRUNCATE TABLE {table};"))
            except Exception:
                try:
                    db.execute(text(f"TRUNCATE TABLE {table.lower()};"))
                except:
                    pass
        db.execute(text("SET FOREIGN_KEY_CHECKS = 1;"))
        db.commit()
        print("✅ Đã xóa sạch dữ liệu cũ!")
    except Exception as e:
        print(f"❌ Lỗi dọn dẹp (có thể bỏ qua nếu lần đầu chạy): {e}")
        db.rollback()

def get_image_by_type(acc_type):
    """Lấy ảnh phù hợp với loại hình"""
    collection = IMAGE_COLLECTIONS.get(acc_type, IMAGE_COLLECTIONS["Khách sạn"])
    return random.choice(collection)

def get_tags_by_type(acc_type):
    """Lấy tags phù hợp (VD: Villa thì phải có hồ bơi)"""
    common_tags = ["wifi", "ac", "parking", "shampoo"]
    
    if acc_type in ["Biệt thự", "Villa"]:
        return common_tags + ["pool", "bbq", "garden", "kitchen", "balcony"]
    elif acc_type == "Căn hộ":
        return common_tags + ["kitchen", "washing_machine", "elevator", "gym", "view"]
    elif acc_type == "Homestay":
        return common_tags + ["hair_dryer", "breakfast", "pets_allowed"]
    else: # Khách sạn
        return common_tags + ["tv", "elevator", "reception_24h", "breakfast"]

def get_price_range(acc_type):
    """Giá tiền hợp lý (VND)"""
    if acc_type in ["Biệt thự", "Villa"]:
        return (3000, 10000) # 3tr - 10tr
    elif acc_type == "Căn hộ":
        return (1000, 3000) # 1tr - 3tr
    elif acc_type == "Homestay":
        return (400, 1200) # 400k - 1tr2
    else:
        return (500, 4000) # 500k - 4tr

def seed_data():
    db = SessionLocal()
    db.expire_on_commit = False 

    try:
        clean_database(db)
        print("\n🌱 BẮT ĐẦU TẠO DỮ LIỆU MỚI (NO NOTIFICATIONS)...")

        # =====================================================
        # 1. TẠO USERS
        # =====================================================
        users = []
        print("👤 1. Đang tạo 30 users (có thông tin ngân hàng)...")
        
        common_password_hash = "$2b$12$10WVg2p82V.cdKfv46RzJe5EYwrf4cy7VofdKpwh7hiGU5x0I9YIa"
        
        for i in range(30):
            role = random.choice([UserRole.traveler, UserRole.owner])
            interests = " và ".join(random.sample(TRAVEL_KEYWORDS, k=2))
            
            sex = random.choice(["Nam", "Nữ"])
            full_name = fake.name_male() if sex == "Nam" else fake.name_female()

            # Tạo dữ liệu ngân hàng nếu là Owner
            bank_name = None
            account_number = None
            account_holder = None
            
            if role == UserRole.owner:
                bank_name = random.choice(BANKS)
                account_number = str(random.randint(1000000000, 9999999999))
                account_holder = full_name.upper()

            user = User(
                username=f"user{i+1}",
                password_hash=common_password_hash, 
                email=f"user{i+1}@example.com",
                full_name=full_name,
                sex=sex,
                dob=fake.date_of_birth(minimum_age=18, maximum_age=45),
                role=role,
                phone=f"09{random.randint(10000000, 99999999)}",
                preference=f"Mình là người {interests}.",
                bank_name=bank_name,
                account_number=account_number,
                account_holder=account_holder,
                bookings_count=0,
                is_verified_traveler=random.choices([True, False], weights=[0.2, 0.8])[0]
            )
            db.add(user)
            users.append(user)
        
        db.commit()
        
        # Đảm bảo role
        owners = [u for u in users if u.role == UserRole.owner]
        travelers = [u for u in users if u.role == UserRole.traveler]
        
        if not owners: 
            users[0].role = UserRole.owner
            owners.append(users[0])
        if not travelers:
            users[1].role = UserRole.traveler
            travelers.append(users[1])
            
        db.commit()

        # =====================================================
        # 2. TẠO ACCOMMODATIONS
        # =====================================================
        accommodations = []
        print(f"🏠 2. Đang tạo {len(REAL_ESTATES)} chỗ ở...")

        for real_place in REAL_ESTATES:
            owner = random.choice(owners)
            p_type = real_place['type']
            area = real_place['area']
            
            min_p, max_p = get_price_range(p_type)
            price_val = Decimal(random.randint(min_p, max_p) * 1000)
            
            tags_list = random.sample(get_tags_by_type(p_type), k=random.randint(4, 7))
            img_url = get_image_by_type(p_type)

            accom = Accommodation(
                owner_id=owner.id,
                title=f"{p_type} {area} - {random.choice(['View Đẹp', 'Giá Tốt', 'Hiện Đại', 'Chill'])}",
                description=f"Nằm tại {real_place['address']}. Phù hợp nghỉ dưỡng.",
                location=real_place['address'],
                property_type=p_type,
                max_guests=random.choice([2, 4, 6]),
                price=price_val,
                status='available',
                picture_url=img_url,
                latitude=Decimal(real_place['lat']),
                longitude=Decimal(real_place['lng']),
                tags=",".join(tags_list)
            )
            db.add(accom)
            accommodations.append(accom)
            
        db.commit()

        # =====================================================
        # 3. TẠO BOOKINGS & REVIEWS (NO NOTIFICATIONS)
        # =====================================================
        bookings = []
        reviews = []
        print("📅 3. Đang tạo Bookings và Reviews (Bỏ qua Notification)...")
        
        for _ in range(60):
            guest = random.choice(travelers)
            accom = random.choice(accommodations)
            
            is_past = random.choice([True, False])
            today = date.today()
            
            # Logic trạng thái booking
            if is_past:
                start_date = today - timedelta(days=random.randint(10, 90))
                status = 'completed'
                payment_proof = "https://picsum.photos/200/300" # Ảnh fake proof
            else:
                start_date = today + timedelta(days=random.randint(1, 30))
                status = random.choice(['confirmed', 'pending_approval', 'cancelled'])
                payment_proof = "https://picsum.photos/200/300" if status == 'confirmed' else None

            stay_days = random.randint(1, 5)
            end_date = start_date + timedelta(days=stay_days)
            total = accom.price * stay_days

            booking = Booking(
                user_id=guest.id,
                accommodation_id=accom.accommodation_id,
                date_start=start_date,   
                date_end=end_date,
                guests=random.randint(1, accom.max_guests),
                guest_name=guest.full_name,
                guest_email=guest.email,
                guest_phone=guest.phone,
                note="Cho mình checkin sớm nếu được nhé",
                total_price=total,
                status=status,
                booking_code=str(uuid.uuid4())[:8].upper(),
                payment_proof=payment_proof
            )
            db.add(booking)
            bookings.append(booking)
            
            # Cập nhật số lần booking của user nếu thành công
            if status in ['confirmed', 'completed']:
                guest.bookings_count += 1

            # --- ĐÃ XÓA PHẦN TẠO NOTIFICATION TẠI ĐÂY ---
            
            # Tạo Review nếu completed
            if status == 'completed' and random.random() > 0.4:
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
        # 4. TẠO FORUM POSTS
        # =====================================================
        print("💬 4. Đang tạo dữ liệu Forum...")
        
        posts = []
        for _ in range(25):
            author = random.choice(users)
            topic_title, topic_location = random.choice(FORUM_TOPICS)
            
            full_title = f"{topic_title} {topic_location.value.replace('_', ' ').title()}"
            
            post = Post(
                user_id=author.id,
                title=full_title,
                content=fake.text(max_nb_chars=600),
                location=topic_location,
                status=PostStatus.active,
                views_count=random.randint(50, 1000),
                replies_count=0 
            )
            db.add(post)
            posts.append(post)
        
        db.commit()
        
        # Replies
        replies_count = 0
        for post in posts:
            num_replies = random.randint(0, 8)
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

        print("\n✅ SEED DATA SUCCESSFUL! (User pass: 123456)")

    except Exception as e:
        print(f"\n❌ CÓ LỖI XẢY RA: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()