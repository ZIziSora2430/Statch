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
)

fake = Faker(['vi_VN'])

# =====================================================
# 1. KHO ẢNH (ĐÃ FIX LINK CHẾT)
# =====================================================
# Sử dụng Direct Link có ID cụ thể để tránh lỗi redirect
IMAGE_COLLECTIONS = {
    "Homestay": [
        "https://images.unsplash.com/photo-1522771753033-6a9a6b991b5e?auto=format&fit=crop&w=800&q=80", # Cozy room
        "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80", # Living room
        "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80", # Bedroom pillow
        "https://images.unsplash.com/photo-1512918760532-3ed64bc80409?auto=format&fit=crop&w=800&q=80", # Bright apartment
        "https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&w=800&q=80", # Home decor
    ],
    "Căn hộ": [
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80", # Loft style
        "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=800&q=80", # White interior
        "https://images.unsplash.com/photo-1484154218962-a1c002085d2f?auto=format&fit=crop&w=800&q=80", # Modern kitchen
        "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=800&q=80", # Sofa view
    ],
    "Khách sạn": [
        "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80", # Clean bedroom
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80", # Resort pool
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80", # Luxury room
        "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80", # Hotel lobby
    ],
    "Biệt thự": [
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80", # Modern house
        "https://images.unsplash.com/photo-1575517111478-7f60e01f51f6?auto=format&fit=crop&w=800&q=80", # Villa with pool
        "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80", # Mansion
        "https://images.unsplash.com/photo-1600596542815-22b845069566?auto=format&fit=crop&w=800&q=80", # Luxury home
    ],
    "Villa": [ # Fallback cho loại Villa
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1575517111478-7f60e01f51f6?auto=format&fit=crop&w=800&q=80",
    ]
}

BANKS = ["Vietcombank", "Techcombank", "MB Bank", "ACB", "TPBank", "VPBank"]

# =====================================================
# 2. FULL DATA CÁC QUẬN HUYỆN TP.HCM
# =====================================================
# Mapping tên hiển thị -> Enum trong models.py
LOCATION_MAPPING = {
    "Quận 1": PostLocation.district1, "Quận 2": PostLocation.district2, "Quận 3": PostLocation.district3,
    "Quận 4": PostLocation.district4, "Quận 5": PostLocation.district5, "Quận 6": PostLocation.district6,
    "Quận 7": PostLocation.district7, "Quận 8": PostLocation.district8, "Quận 9": PostLocation.district9,
    "Quận 10": PostLocation.district10, "Quận 11": PostLocation.district11, "Quận 12": PostLocation.district12,
    "Bình Thạnh": PostLocation.binh_thanh, "Gò Vấp": PostLocation.go_vap, "Phú Nhuận": PostLocation.phu_nhuan,
    "Tân Bình": PostLocation.tan_binh, "Tân Phú": PostLocation.tan_phu, "Bình Tân": PostLocation.binh_tan,
    "TP. Thủ Đức": PostLocation.thu_duc, "Bình Chánh": PostLocation.binh_chanh, "Hóc Môn": PostLocation.hoc_mon,
    "Củ Chi": PostLocation.cu_chi, "Nhà Bè": PostLocation.nha_be, "Cần Giờ": PostLocation.can_gio
}

# Dữ liệu Hub để sinh tọa độ và tên đường
DISTRICT_HUBS = [
    # --- KHU VỰC TRUNG TÂM ---
    {"name": "Quận 1", "lat": 10.7756, "lng": 106.7004, "areas": ["Bùi Viện", "Nguyễn Huệ", "Đồng Khởi"], "types": ["Khách sạn", "Homestay"]},
    {"name": "Quận 3", "lat": 10.7843, "lng": 106.6844, "areas": ["Hồ Con Rùa", "Võ Văn Tần", "Lê Quý Đôn"], "types": ["Biệt thự", "Homestay"]},
    {"name": "Quận 4", "lat": 10.7578, "lng": 106.7013, "areas": ["Bến Vân Đồn", "Hoàng Diệu"], "types": ["Căn hộ"]},
    {"name": "Quận 5", "lat": 10.7540, "lng": 106.6633, "areas": ["Chợ Lớn", "Hồng Bàng", "Nguyễn Trãi"], "types": ["Khách sạn"]},
    {"name": "Quận 10", "lat": 10.7715, "lng": 106.6675, "areas": ["Sư Vạn Hạnh", "Thành Thái"], "types": ["Khách sạn", "Homestay"]},
    
    # --- KHU VỰC ĐÔNG ---
    {"name": "TP. Thủ Đức", "lat": 10.8494, "lng": 106.7537, "areas": ["Võ Văn Ngân", "Làng Đại Học", "Khu Công Nghệ Cao"], "types": ["Homestay", "Căn hộ"]},
    {"name": "Quận 2", "lat": 10.8018, "lng": 106.7407, "areas": ["Thảo Điền", "Trần Não", "An Phú"], "types": ["Biệt thự", "Villa", "Căn hộ"]},
    
    # --- KHU VỰC NAM ---
    {"name": "Quận 7", "lat": 10.7295, "lng": 106.7216, "areas": ["Phú Mỹ Hưng", "Crescent Mall", "Him Lam"], "types": ["Căn hộ", "Biệt thự"]},
    {"name": "Nhà Bè", "lat": 10.6953, "lng": 106.7047, "areas": ["Phước Kiển", "Lê Văn Lương"], "types": ["Căn hộ", "Nhà phố"]},
    {"name": "Bình Chánh", "lat": 10.6865, "lng": 106.5925, "areas": ["Trung Sơn", "Quốc Lộ 50"], "types": ["Khách sạn", "Homestay"]},
    {"name": "Cần Giờ", "lat": 10.4116, "lng": 106.9547, "areas": ["Biển 30/4", "Thị trấn Cần Thạnh"], "types": ["Homestay", "Resort"]},

    # --- KHU VỰC TÂY & BẮC ---
    {"name": "Tân Bình", "lat": 10.8014, "lng": 106.6523, "areas": ["Sân Bay TSN", "Hoàng Văn Thụ", "Cộng Hòa"], "types": ["Khách sạn", "Căn hộ"]},
    {"name": "Phú Nhuận", "lat": 10.7991, "lng": 106.6802, "areas": ["Phan Xích Long", "Trường Sa"], "types": ["Homestay", "Khách sạn"]},
    {"name": "Gò Vấp", "lat": 10.8386, "lng": 106.6653, "areas": ["Quang Trung", "Phan Văn Trị", "Cityland"], "types": ["Homestay", "Căn hộ"]},
    {"name": "Bình Thạnh", "lat": 10.8105, "lng": 106.7091, "areas": ["Landmark 81", "Thanh Đa", "Hàng Xanh"], "types": ["Căn hộ", "Homestay"]},
    {"name": "Tân Phú", "lat": 10.7900, "lng": 106.6280, "areas": ["Aeon Mall", "Tân Sơn Nhì"], "types": ["Căn hộ"]},
    {"name": "Bình Tân", "lat": 10.7656, "lng": 106.6038, "areas": ["Tên Lửa", "Aeon Bình Tân"], "types": ["Căn hộ", "Khách sạn"]},
    {"name": "Quận 12", "lat": 10.8671, "lng": 106.6413, "areas": ["Tô Ký", "Ngã Tư Ga"], "types": ["Homestay"]},
    {"name": "Hóc Môn", "lat": 10.8856, "lng": 106.5913, "areas": ["Bà Điểm", "Chợ Hóc Môn"], "types": ["Homestay"]},
    {"name": "Củ Chi", "lat": 11.0066, "lng": 106.5132, "areas": ["Địa Đạo", "Tỉnh Lộ 8"], "types": ["Homestay", "Biệt thự"]},

    # Các quận còn lại
    {"name": "Quận 6", "lat": 10.7483, "lng": 106.6321, "areas": ["Bình Tây", "Kinh Dương Vương"], "types": ["Khách sạn"]},
    {"name": "Quận 8", "lat": 10.7230, "lng": 106.6277, "areas": ["Phạm Hùng", "Cầu Chữ Y"], "types": ["Căn hộ"]},
    {"name": "Quận 11", "lat": 10.7630, "lng": 106.6508, "areas": ["Đầm Sen", "Lê Đại Hành"], "types": ["Khách sạn"]},
]

# =====================================================
# 3. FORUM TEMPLATES
# =====================================================
FORUM_TEMPLATES = [
    # Review
    {"t": "Review chuyến staycation tại {loc}", "c": "Cuối tuần rồi mình vừa đổi gió ở khu {loc}. Không gian cực chill, view đẹp, giá khoảng 800k/đêm. Rất hợp cho cặp đôi nhé.", "tag": "Review"},
    {"t": "Cảnh báo khi thuê phòng giá rẻ ở {loc}", "c": "Mọi người cẩn thận mấy chỗ ở {loc} mà giá dưới 200k nha. Hình một đằng phòng một nẻo, máy lạnh hư nữa. Nên check kỹ review trước khi book.", "tag": "Cảnh báo"},
    
    # Hỏi đáp
    {"t": "Hỏi chỗ ăn ngon quanh khu vực {loc}", "c": "Mình sắp chuyển đến {loc} ở vài ngày. Khu này có quán ốc hay lẩu nào ngon bổ rẻ không mọi người? Thanks cả nhà.", "tag": "Ăn uống"},
    {"t": "Tìm homestay có bếp riêng tại {loc}", "c": "Mình cần tìm homestay ở {loc} có bếp để tự nấu ăn, budget 500k quay đầu. Ai biết chỉ giúp mình với ạ.", "tag": "Tìm phòng"},
    {"t": "Khu vực {loc} buổi tối có an ninh không?", "c": "Mình con gái đi công tác một mình, định book phòng ở {loc} nhưng nghe nói khu này hơi vắng. Ai ở đây rồi cho mình xin review với.", "tag": "Hỏi đáp"},

    # Tìm bạn
    {"t": "Tìm bạn cafe làm việc ở {loc}", "c": "Mình freelancer đang ở {loc}, muốn tìm bạn ra cafe ngồi làm việc chung cho có động lực. Ai rảnh inbox nhé.", "tag": "Giao lưu"},
    {"t": "Rủ rê đi foodtour {loc} cuối tuần này", "c": "Nghe nói {loc} là thiên đường ăn vặt. Có team nào đi không cho mình ké 1 slot với!", "tag": "Rủ rê"},
    
    # Specific
    {"t": "Góc pass phòng {loc} giá yêu thương", "c": "Mình bận việc đột xuất nên pass lại phòng đã book ở {loc} ngày mai. Giá gốc 1tr pass còn 500k. Phòng view đẹp, bao ăn sáng.", "tag": "Pass phòng"}
]

# =====================================================
# HELPER FUNCTIONS
# =====================================================

def clean_database(db: Session):
    print("🧹 ĐANG DỌN DẸP DATABASE CŨ...")
    try:
        db.execute(text("SET FOREIGN_KEY_CHECKS = 0;"))
        tables = ["Notification", "post_views", "replies", "posts", "reviews", "bookings", "accommodations", "users"]
        for table in tables:
            try:
                db.execute(text(f"TRUNCATE TABLE {table};"))
            except: pass
        db.execute(text("SET FOREIGN_KEY_CHECKS = 1;"))
        db.commit()
        print("✅ Đã xóa sạch dữ liệu cũ!")
    except Exception as e:
        print(f"❌ Lỗi dọn dẹp: {e}")
        db.rollback()

def get_image_and_tags(acc_type):
    # Image (Lấy ngẫu nhiên từ kho ảnh đã fix)
    collection = IMAGE_COLLECTIONS.get(acc_type, IMAGE_COLLECTIONS["Khách sạn"])
    img = random.choice(collection)
    
    # Tags
    base = ["Wifi", "Máy lạnh", "Đậu xe"]
    if acc_type in ["Biệt thự", "Villa"]: extra = ["Hồ bơi", "BBQ", "Sân vườn", "Bếp rộng"]
    elif acc_type == "Căn hộ": extra = ["Bếp", "Máy giặt", "Thang máy", "View đẹp"]
    elif acc_type == "Homestay": extra = ["Máy sấy", "Decor đẹp", "Netflix", "Thú cưng"]
    else: extra = ["TV", "Thang máy", "Lễ tân 24h", "Dọn phòng"]
    
    tags = ",".join(base + random.sample(extra, k=min(3, len(extra))))
    return img, tags

def get_price(acc_type):
    if acc_type in ["Biệt thự", "Villa"]: return random.randint(3000, 10000) * 1000
    elif acc_type == "Căn hộ": return random.randint(1000, 3000) * 1000
    elif acc_type == "Homestay": return random.randint(400, 1200) * 1000
    else: return random.randint(500, 2000) * 1000

def jitter_coord(lat, lng):
    # Lệch tọa độ khoảng 1-2km để các nhà không trùng nhau
    return Decimal(lat + random.uniform(-0.015, 0.015)), Decimal(lng + random.uniform(-0.015, 0.015))

# =====================================================
# MAIN SEED
# =====================================================

def seed_data():
    db = SessionLocal()
    try:
        from app.database import engine, Base
        Base.metadata.create_all(bind=engine)
        clean_database(db)
        print("\n🌱 KHỞI TẠO DỮ LIỆU TOÀN TP.HCM (IMAGES FIXED)...")

        # 1. TẠO USERS
        print("👤 1. Tạo 40 Users...")
        users = []
        pw_hash = "$2b$12$10WVg2p82V.cdKfv46RzJe5EYwrf4cy7VofdKpwh7hiGU5x0I9YIa" # pass: 123456
        
        for i in range(40):
            role = random.choice([UserRole.traveler, UserRole.owner])
            sex = random.choice(["Nam", "Nữ"])
            fname = fake.name_male() if sex == "Nam" else fake.name_female()
            
            bank, acc_n, acc_h = (None, None, None)
            if role == UserRole.owner:
                bank = random.choice(BANKS)
                acc_n = str(random.randint(1000000000, 9999999999))
                acc_h = fname.upper()

            u = User(
                username=f"user{i+1}", password_hash=pw_hash, email=f"user{i+1}@example.com",
                full_name=fname, sex=sex, role=role, phone=f"09{random.randint(10000000, 99999999)}",
                preference="Thích du lịch, trải nghiệm văn hóa.",
                bank_name=bank, account_number=acc_n, account_holder=acc_h,
                is_verified_traveler=random.choice([True, False])
            )
            users.append(u)
            db.add(u)
        db.commit()

        owners = [u for u in users if u.role == UserRole.owner]
        travelers = [u for u in users if u.role == UserRole.traveler]
        if not owners: owners.append(users[0])

        # 2. TẠO ACCOMMODATIONS (PHỦ KHẮP CÁC QUẬN)
        print(f"🏠 2. Tạo Accommodation cho {len(DISTRICT_HUBS)} quận/huyện...")
        accommodations = []
        
        for hub in DISTRICT_HUBS:
            # Mỗi quận tạo khoảng 2-3 căn nhà -> Tổng ~50-60 căn
            num_houses = random.randint(2, 3) 
            
            for _ in range(num_houses):
                owner = random.choice(owners)
                p_type = random.choice(hub["types"])
                area_name = random.choice(hub["areas"])
                
                img, tags = get_image_and_tags(p_type)
                lat, lng = jitter_coord(hub["lat"], hub["lng"])
                
                title_adj = random.choice(["View Đẹp", "Giá Tốt", "Hiện Đại", "Thoáng Mát", "An Ninh", "Cao Cấp"])
                
                acc = Accommodation(
                    owner_id=owner.id,
                    title=f"{p_type} {area_name} {hub['name']} - {title_adj}",
                    description=f"Căn {p_type.lower()} nằm ngay trung tâm khu vực {area_name}, {hub['name']}. "
                                f"Thuận tiện di chuyển, gần chợ và siêu thị. Phù hợp cho gia đình hoặc nhóm bạn. "
                                f"An ninh đảm bảo, chủ nhà thân thiện.",
                    location=f"Đường số {random.randint(1,100)}, {area_name}, {hub['name']}, TP.HCM",
                    property_type=p_type,
                    max_guests=random.choice([2, 4, 6]),
                    price=Decimal(get_price(p_type)),
                    status='available',
                    picture_url=img,
                    latitude=lat, longitude=lng,
                    tags=tags
                )
                db.add(acc)
                accommodations.append(acc)
        
        db.commit()
        print(f"   -> Đã tạo tổng cộng {len(accommodations)} chỗ ở.")

        # 3. BOOKINGS & REVIEWS
        print("📅 3. Tạo 80 Bookings & Reviews...")
        for _ in range(80):
            guest = random.choice(travelers)
            acc = random.choice(accommodations)
            
            is_past = random.choice([True, False])
            today = date.today()
            
            if is_past:
                start = today - timedelta(days=random.randint(5, 60))
                status = 'completed'
            else:
                start = today + timedelta(days=random.randint(1, 30))
                status = random.choice(['confirmed', 'pending_approval'])

            stay = random.randint(1, 5)
            end = start + timedelta(days=stay)
            
            bk = Booking(
                user_id=guest.id, accommodation_id=acc.accommodation_id,
                date_start=start, date_end=end,
                guests=random.randint(1, acc.max_guests),
                total_price=acc.price * stay,
                status=status, booking_code=str(uuid.uuid4())[:8].upper(),
                guest_name=guest.full_name, guest_email=guest.email
            )
            db.add(bk)
            
            if status == 'completed' and random.random() > 0.3:
                rv = Review(
                    user_id=guest.id, accommodation_id=acc.accommodation_id,
                    rating=random.randint(3, 5),
                    content=fake.sentence(nb_words=15)
                )
                db.add(rv)
        db.commit()

        # 4. FORUM POSTS (NỘI DUNG THẬT & FIX LỖI REPLY)
        print("💬 4. Tạo Forum Posts (Realistic Content)...")
        all_districts = list(LOCATION_MAPPING.keys())
        
        for d_name in all_districts:
            if random.random() > 0.2:
                auth = random.choice(users)
                template = random.choice(FORUM_TEMPLATES)
                loc_enum = LOCATION_MAPPING[d_name]
                
                real_title = template["t"].format(loc=d_name)
                real_content = template["c"].format(loc=d_name)
                
                p = Post(
                    user_id=auth.id,
                    title=real_title,
                    content=real_content,
                    location=loc_enum,
                    status=PostStatus.active,
                    views_count=random.randint(10, 500),
                    replies_count=0 
                )
                db.add(p)
                db.flush() # <--- QUAN TRỌNG: Lấy p.id về trước khi tạo reply
                
                if random.random() > 0.5:
                    for _ in range(random.randint(1, 4)):
                        replier = random.choice(users)
                        rp = Reply(
                            post_id=p.id,
                            user_id=replier.id,
                            content=random.choice([
                                "Hay quá, cảm ơn bác review.", 
                                "Chỗ này địa chỉ chính xác là gì vậy?", 
                                "Mình cũng định đi chỗ này nè.", 
                                "Lưu lại khi nào cần.", 
                                "Inbox mình giá chi tiết nha."
                            ]),
                            status=PostStatus.active
                        )
                        db.add(rp)
                        p.replies_count += 1
                        
        db.commit()
        print("\n✅ SEED DATA SUCCESSFUL! (User pass: password123)")

    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()