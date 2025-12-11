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
    User, Accommodation, Booking, Review, Post, Reply, PostLike,
    UserRole, PostLocation, PostStatus
)

fake = Faker(['vi_VN'])

# =====================================================
# DỮ LIỆU CỐ ĐỊNH (CONSTANTS) - ĐÃ FIX LINK ẢNH
# =====================================================

IMAGE_COLLECTIONS = {
    "Homestay": [
        "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1512918760532-3ed64bc80409?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80",
    ],
    "Căn hộ": [
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1484154218962-a1c002085d2f?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=800&q=80",
    ],
    "Khách sạn": [
        "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
    ],
    "Biệt thự": [
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1575517111478-7f60e01f51f6?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1600596542815-22b845069566?auto=format&fit=crop&w=800&q=80",
    ],
    # Fallback cho trường hợp Villa trùng tên
    "Villa": [
        "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80",
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
REALISTIC_REVIEWS = {
    5: [
        "Tuyệt vời! Phòng sạch sẽ, thơm tho, view đẹp y như hình. Chủ nhà support cực kỳ nhiệt tình.",
        "10 điểm không có nhưng. Vị trí ngay trung tâm, đi đâu cũng tiện. Sẽ quay lại lần sau.",
        "Decor siêu xinh, góc nào cũng sống ảo được. Tiện nghi đầy đủ từ A-Z.",
        "Đáng đồng tiền bát gạo. Giường êm, máy lạnh mát rượi, ngủ rất ngon.",
        "Mình book gấp nhưng phòng vẫn được dọn dẹp rất kỹ. Rất ưng ý!",
        "Không gian yên tĩnh, chill phết. Thích hợp để đi trốn deadline."
    ],
    4: [
        "Phòng ổn, sạch sẽ. Tuy nhiên cách âm hơi kém chút, sáng sớm hơi ồn.",
        "Mọi thứ đều tốt, trừ việc wifi buổi tối hơi chập chờn.",
        "Vị trí đẹp, phòng giống mô tả. Điểm trừ là chỗ để xe hơi chật.",
        "Chủ nhà thân thiện. Phòng ốc gọn gàng nhưng thang máy chờ hơi lâu.",
        "Tổng thể ok trong tầm giá. Nếu có thêm gương toàn thân thì tuyệt hơn."
    ],
    3: [
        "Phòng tạm ổn để ngủ qua đêm. Hơi cũ hơn so với hình chụp trên web.",
        "Vị trí trong hẻm sâu khó tìm. Phòng bình thường, không có gì đặc sắc.",
        "Giá rẻ nên không đòi hỏi nhiều. Tiện nghi ở mức cơ bản.",
        "Hơi thất vọng về vấn đề vệ sinh, sàn nhà còn bụi khi mình nhận phòng.",
        "Máy nước nóng hoạt động không tốt lắm. Cần bảo trì lại."
    ]
}

# ==============================================================
# DỮ LIỆU FORUM THỰC TẾ (REALISTIC FORUM DATA)
# ==============================================================
REALISTIC_POSTS = [
    {
        "title": "Review chi tiết 2N1Đ ăn sập Bình Thạnh, ở Landmark 81",
        "content": "Cuối tuần rồi mình với người yêu book được căn hộ Airbnb ở Landmark 81 giá siêu tốt. Tiện thể làm chuyến foodtour Bình Thạnh luôn. \n\n1. Chỗ ở: Căn mình thuê tầng 35, view sông cực chill. Chủ nhà support nhiệt tình. \n2. Ăn uống: Gần đó có tiệm mì vịt tiềm siêu ngon, tối thì qua chợ Bà Chiểu ăn xôi gà. \n\nTổng thiệt hại chưa tới 2tr/người. Mọi người ai cần info phòng thì comment mình chỉ cho nhé!",
        "location": PostLocation.binh_thanh
    },
    {
        "title": "Cầu cứu: Tìm homestay cho nhóm 10 người ở Quận 1",
        "content": "Chào cả nhà, tháng sau lớp đại học cũ của mình tổ chức họp lớp ở Sài Gòn. \nMình cần tìm một căn homestay hoặc villa nguyên căn khu vực Quận 1 hoặc Quận 3.\n\nYêu cầu: \n- Có bếp để tự nấu nướng.\n- Cho phép làm ồn xíu vì tụi mình hay hát hò.\n- Giá tầm 3-5 triệu/đêm quay đầu.\n\nAi biết chỗ nào ổn áp giới thiệu giúp mình với ạ. Cảm ơn admin duyệt bài.",
        "location": PostLocation.district1
    },
    {
        "title": "Góc cảnh giác: Trải nghiệm tệ hại khi thuê phòng ở Bùi Viện",
        "content": "Mọi người né cái homestay X ở hẻm 1xx Bùi Viện ra nhé. \nThứ nhất, hình trên web một đằng, nhận phòng một nẻo. Phòng siêu bé và có mùi ẩm mốc.\nThứ hai, cách âm cực tệ. Đêm nằm nghe nhạc bar dập thình thịch không ngủ được luôn.\nChủ nhà thì thái độ lồi lõm khi mình phản ánh. Chừa luôn không bao giờ quay lại.",
        "location": PostLocation.district1
    },
    {
        "title": "Hỏi chỗ cafe làm việc yên tĩnh khu Thảo Điền",
        "content": "Mình mới chuyển qua Thảo Điền sống (khu Masteri). \nCó bạn nào biết quán cafe nào không gian yên tĩnh, wifi mạnh, ngồi làm việc (work from home) ổn không ạ? \nƯu tiên quán có view xanh mát xíu cho đỡ stress. Cảm ơn mọi người.",
        "location": PostLocation.district2
    },
    {
        "title": "Tìm bạn ở ghép căn hộ Sunrise City Quận 7",
        "content": "Hiện mình đang thuê căn 2PN ở Sunrise City (đối diện Lotte Mart Q7). \nTháng sau bạn cùng phòng chuyển đi nên mình cần tìm 1 bạn nữ ở ghép.\n- Phòng master có toilet riêng.\n- Full nội thất, chỉ việc xách vali vào ở.\n- Tiện ích hồ bơi, gym free.\n- Giá: 4tr5/tháng (chưa điện nước).\nBạn nào quan tâm inbox mình gửi hình phòng nhé.",
        "location": PostLocation.district7
    },
    {
        "title": "List 5 quán ăn ngon nhức nách khu Chợ Lớn (Quận 5)",
        "content": "Đi Quận 5 mà không ăn đồ Hoa là thiếu sót lớn. Nay mình share list 5 quán ruột của mình:\n1. Sủi cảo Thiên Thiên (Hà Tôn Quyền)\n2. Chè Hà Ký\n3. Dimsum Tiến Phát\n4. Hủ tiếu mì Thiệu Ký\n5. Vịt quay Vĩnh Phong\n\nBạn nào đi du lịch Q5 nhớ ghé thử nha, đảm bảo không thất vọng!",
        "location": PostLocation.district5
    },
    {
        "title": "Có ai đi Cần Giờ cuối tuần này không?",
        "content": "Cuối tuần này mình tính phượt xe máy xuống Cần Giờ đổi gió, ăn hải sản.\nLịch trình: Sáng đi sớm ghé Đảo Khỉ -> Trưa ăn hải sản chợ Hàng Dương -> Chiều checkin bãi biển 30/4 -> Tối về lại SG.\nHiện tại mình đi một mình, muốn rủ thêm 1-2 bạn đồng hành cho vui. Share tiền xăng xe ăn uống sòng phẳng ạ.",
        "location": PostLocation.can_gio
    },
    {
        "title": "Review căn hộ dịch vụ khu sân bay (Tân Bình)",
        "content": "Mình vừa có chuyến công tác 3 ngày ở SG, chọn ở khu Yên Thế, Tân Bình cho gần sân bay.\nKhu này nhiều cây xanh, yên tĩnh dã man dù sát sân bay. Phòng ốc sạch sẽ, giá tầm 600k/đêm.\nĐiểm trừ là buổi chiều đường Trường Sơn hay kẹt xe, các bạn canh giờ ra sân bay cẩn thận kẻo trễ chuyến.",
        "location": PostLocation.tan_binh
    },
    {
        "title": "Hỏi đường đi địa đạo Củ Chi bằng xe buýt",
        "content": "Sắp tới mình có mấy người bạn Tây qua chơi, muốn dẫn đi Củ Chi mà ngại thuê tour.\nNghe nói có thể đi xe buýt từ Bến Thành. Có bạn nào đi rồi cho mình xin kinh nghiệm với ạ? Nên đi tuyến số mấy và mất bao lâu? Cảm ơn cả nhà.",
        "location": PostLocation.cu_chi
    },
    {
        "title": "Phú Nhuận có chỗ nào chill về đêm không?",
        "content": "Tối nay mình muốn tìm chỗ nào nhạc acoustic nhẹ nhàng hoặc pub nhỏ ở khu Phan Xích Long, Phú Nhuận để chill. \nKhông thích ồn ào xập xình đâu ạ. Mọi người recommend giúp mình vài quán với.",
        "location": PostLocation.phu_nhuan
    },
    {
        "title": "Trải nghiệm tệ tại chung cư River Gate Q4",
        "content": "Book phòng qua app, thấy review cũng ổn mà tới nơi thất vọng tràn trề. Thang máy chờ siêu lâu, bảo vệ khó chịu. Hồ bơi thì đông như kiến. Được cái vị trí sát Q1 đi lại tiện thôi. Lần sau chắc mình chọn ở khách sạn cho lành.",
        "location": PostLocation.district4
    },
    {
        "title": "Tìm phòng trọ sinh viên gần ĐH Bách Khoa (Q10)",
        "content": "Em là tân sinh viên K24, cần tìm phòng trọ khu vực Q10, gần trường Bách Khoa.\nTài chính: 2tr - 2tr5.\nYêu cầu: An ninh, không chung chủ, giờ giấc tự do.\nAnh chị nào biết chỉ giúp em với ạ, em cảm ơn nhiều.",
        "location": PostLocation.district10
    }
]

REALISTIC_REPLIES = [
    "Bài viết rất hữu ích, cảm ơn bạn đã chia sẻ!",
    "Mình cũng đang quan tâm khu này, bạn check inbox mình hỏi chút nha.",
    "Chỗ này mình đi rồi nè, công nhận đồ ăn ngon mà rẻ.",
    "Lần trước mình ở đây thấy cũng bình thường, không như quảng cáo.",
    "Lưu lại để hôm nào rủ người yêu đi. Thanks chủ thớt.",
    "Giá này hơi cao so với mặt bằng chung rồi bạn ơi.",
    "Có chỗ đậu xe hơi không bạn?",
    "Hóng review chi tiết hơn ạ.",
    "Chia sẻ kinh nghiệm đi, mình cũng tính đi chỗ này tuần sau.",
    "Né gấp chỗ này ra, mình từng bị chặt chém ở đây rồi."
]

def clean_database(db: Session):
    """Xóa sạch dữ liệu cũ để tránh trùng lặp"""
    print("🧹 ĐANG DỌN DẸP DATABASE CŨ...")
    try:
        db.execute(text("SET FOREIGN_KEY_CHECKS = 0;"))
        tables = [
            "Notification", "replies", "post_likes", "post_views", "posts", "reviews",
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
    """Lấy tags phù hợp (Toàn bộ bằng Tiếng Việt)"""
    common_tags = ["Wifi", "Máy lạnh", "Chỗ đậu xe", "Dầu gội"]
    
    if acc_type in ["Biệt thự", "Villa"]:
        return common_tags + ["Hồ bơi", "BBQ", "Sân vườn", "Bếp", "Ban công"]
    elif acc_type == "Căn hộ":
        return common_tags + ["Bếp", "Máy giặt", "Thang máy", "Phòng Gym", "View đẹp"]
    elif acc_type == "Homestay":
        return common_tags + ["Máy sấy", "Ăn sáng", "Thú cưng"]
    else: # Khách sạn
        return common_tags + ["TV", "Thang máy", "Lễ tân 24h", "Ăn sáng"]

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
        print("\n🌱 BẮT ĐẦU TẠO DỮ LIỆU MỚI (VERIFIED LOGIC UPDATED)...")

        # =====================================================
        # 1. TẠO USERS
        # =====================================================
        users = []
        print("👤 1. Đang tạo 30 users...")
        
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
                # --- SỬA LOGIC: Mặc định False, sẽ cập nhật khi tạo booking ---
                is_verified_traveler=False 
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
        # 3. TẠO BOOKINGS & REVIEWS (CẬP NHẬT VERIFIED STATUS)
        # =====================================================
        bookings = []
        reviews = []
        print("📅 3. Đang tạo Bookings và cập nhật Verified Status...")
        
        for _ in range(60):
            guest = random.choice(travelers)
            accom = random.choice(accommodations)
            
            is_past = random.choice([True, False])
            today = date.today()
            
            if is_past:
                start_date = today - timedelta(days=random.randint(10, 90))
                status = 'completed'
                payment_proof = "https://picsum.photos/200/300"
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
            
            # --- LOGIC CẬP NHẬT VERIFIED ---
            if status in ['completed']:
                guest.bookings_count += 1
                
                # Nếu có ít nhất 1 booking thành công -> Lên Verified
                if guest.bookings_count >= 1:
                    guest.is_verified_traveler = True

            
            # Tạo Review nếu completed
            if status == 'completed' and random.random() > 0.4:
                # Random điểm số từ 3 đến 5
                rating = random.randint(3, 5)
                # Lấy nội dung review tương ứng với điểm số từ kho dữ liệu
                content = random.choice(REALISTIC_REVIEWS[rating])
                
                review = Review(
                    user_id=guest.id,
                    accommodation_id=accom.accommodation_id,
                    rating=rating,
                    content=content # <-- Dùng content thật
                )
                db.add(review)
                reviews.append(review)

        db.commit()
        print(f"   - Đã tạo {len(bookings)} bookings.")
        print(f"   - Đã cập nhật trạng thái Verified cho các user có booking.")

        # =====================================================
        # 4. TẠO FORUM POSTS + LIKES/REPLIES
        # =====================================================
        print("💬 4. Đang tạo dữ liệu Forum...")
        
        posts = []
        # Lặp qua danh sách bài viết thực tế đã định nghĩa
        for post_data in REALISTIC_POSTS:
            author = random.choice(users) # Chọn ngẫu nhiên tác giả
            
            post = Post(
                user_id=author.id,
                title=post_data["title"],
                content=post_data["content"],
                location=post_data["location"],
                status=PostStatus.active,
                likes_count=0,
                replies_count=0 
            )
            db.add(post)
            posts.append(post)
        
        db.commit()
        
        # Tạo replies ngẫu nhiên từ danh sách câu trả lời mẫu
        replies_count = 0
        for post in posts:
            num_replies = random.randint(1, 6) # Mỗi bài có 1-6 cmt
            post.replies_count = num_replies
            
            for _ in range(num_replies):
                replier = random.choice(users)
                # Đảm bảo người trả lời khác người đăng (tùy chọn)
                while replier.id == post.user_id:
                     replier = random.choice(users)

                reply_content = random.choice(REALISTIC_REPLIES)
                
                reply = Reply(
                    post_id=post.id,
                    user_id=replier.id,
                    content=reply_content,
                    status=PostStatus.active
                )
                db.add(reply)
                replies_count += 1
                
        db.commit()

        # Likes (seed PostLike + sync likes_count)
        likes_total = 0
        for post in posts:
            # số like ngẫu nhiên, tránh vượt số user
            k = random.randint(0, min(20, len(users)))
            liked_users = random.sample(users, k=k) if k > 0 else []
            post.likes_count = len(liked_users)
            for u in liked_users:
                like = PostLike(post_id=post.id, user_id=u.id)
                db.add(like)
                likes_total += 1
        db.commit()

        print(f"   - Đã tạo {len(posts)} bài viết, {replies_count} bình luận, {likes_total} lượt like.")
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