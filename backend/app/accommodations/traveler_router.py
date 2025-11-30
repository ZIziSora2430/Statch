from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional 
from datetime import date
from decimal import Decimal
from typing import List, Optional

from .. import ai_service

# Import từ thư mục app/
from .. import models, database
# Import từ thư mục accommodations/ hiện tại
from . import schemas, service 

# Import dependency (bảo mật)
from ..feature_login.security_helpers import get_current_active_owner, get_current_user

router = APIRouter(
    prefix="/accommodations",
    tags=["Public Accommodations"],
    # Yêu cầu tất cả API trong file này phải đăng nhập
    dependencies=[Depends(get_current_user)]
)

@router.get("/recommendations", response_model=List[schemas.AccommodationRead]) # Bạn cần update schema để có field score
async def get_smart_recommendations(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    # 1. Lấy sở thích user
    preference = current_user.preference
    if not preference:
        # Nếu không có sở thích, trả về random hoặc top rate
        return service.get_top_accommodations(db, limit=6)

    # 2. Lấy danh sách ứng viên thô từ DB (Lấy khoảng 10-20 cái mới nhất/tốt nhất để AI lọc)
    # Không nên gửi toàn bộ DB cho AI vì tốn tiền/chậm
    candidates = service.get_random_accommodations(db, limit=10) 
    
    # 3. Nhờ AI chấm điểm
    ai_scores = await ai_service.calculate_match_score(preference, candidates)
    
    # 4. Ghép điểm số vào object kết quả
    final_results = []
    for acc in candidates:
        # Tìm kết quả chấm điểm tương ứng
        match = next((item for item in ai_scores if item["id"] == acc.accommodation_id), None)
        
        if match:
            # Gán thêm thuộc tính ảo (bạn cần thêm field này vào Schema nếu muốn trả về FE)
            acc.match_score = match['score']
            acc.match_reason = match['reason']
            final_results.append(acc)
    
    # 5. Sắp xếp theo điểm số AI giảm dần
    final_results.sort(key=lambda x: x.match_score, reverse=True)
    
    return final_results[:3] # Chỉ lấy Top 3 cái hợp nhất

# API TÌM KIẾM
@router.get(
    "/search/", 
    response_model=List[schemas.AccommodationRead] 
)
def search_accommodations_endpoint(
    # Tìm theo tọa độ 
    # Ví dụ: /search/?lat=10.77&lng=106.69&radius=5 (tìm trong bán kính 5km)
    lat: Optional[float] = Query(None, description="Vĩ độ của điểm tìm kiếm"),
    lng: Optional[float] = Query(None, description="Kinh độ của điểm tìm kiếm"),
    radius: Optional[int] = Query(10, description="Bán kính tìm kiếm (km)"),
    location_text: Optional[str] = Query(None, description="Tìm kiếm theo text (fallback)"),
    check_in_date: Optional[date] = Query(None, description="Ngày nhận phòng (YYYY-MM-DD)"),
    check_out_date: Optional[date] = Query(None, description="Ngày trả phòng (YYYY-MM-DD)"),
    number_of_guests: Optional[int] = Query(None, description="Số lượng khách tối đa"),

    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user) # Lấy user

):
    """
    API Endpoint cho traveler tìm kiếm chỗ ở dựa trên tọa độ (lat/lng)
    và bán kính (radius). Yêu cầu phải đăng nhập.
    """
    if check_in_date and check_out_date and check_in_date >= check_out_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ngày nhận phòng phải trước ngày trả phòng."
        )
    try:
        accommodations = service.search_accommodations(
            db=db,
            lat=lat,
            lng=lng,
            radius=radius,
            location_text=location_text,
            check_in_date=check_in_date,
            check_out_date=check_out_date,
            number_of_guests=number_of_guests
        )
        return accommodations
    except Exception as e:
        raise HTTPException (
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi khi tìm kiếm: {str(e)}"
        )

# API Lấy danh sách chỗ ở được GỢI Ý
@router.get(
    "/{accommodation_id}/recommendations", 
    response_model=List[schemas.AccommodationRead] 
)
def get_recommendations_endpoint(
    accommodation_id: int,
    limit: int = Query(4, description="Số lượng kết quả đề xuất"),
    db: Session = Depends(database.get_db),
    # Dùng get_current_user (nếu bạn cho phép người dùng chưa đăng nhập xem)
    current_user: models.User = Depends(get_current_user) 
):
    """
    API Endpoint lấy danh sách chỗ ở được đề xuất dựa trên ID của chỗ ở hiện tại.
    """
    
    recommendations = service.get_recommended_accommodations(
        db=db, 
        accommodation_id=accommodation_id, 
        limit=limit
    )
    return recommendations

# Lấy chi tiết MỘT chỗ ở
@router.get(
    "/{accommodation_id}", 
    response_model=schemas.AccommodationRead
)
def get_accommodation_details_endpoint(
    accommodation_id: int,
    db: Session = Depends(database.get_db)
    # (Hàm này cũng tự động được bảo vệ bởi get_current_user ở router)
):
    """
    API Endpoint cho traveler xem chi tiết một chỗ ở.
    """
    accommodation = service.get_accommodation_by_id(db, accommodation_id)
    if not accommodation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy chỗ ở."
        )
    return accommodation

# API Lấy Chi tiết Booking
@router.get(
    "/bookings/{booking_id}", 
    response_model=schemas.BookingRead 
)
def get_booking_details_endpoint(
    booking_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user) 
):
    """
    API Endpoint cho traveler hoặc owner xem chi tiết một Booking cụ thể.
    """
    
    booking = service.get_booking_details(
        db=db, 
        booking_id=booking_id, 
        user_id=current_user.id
    )
    
    if booking is False:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền xem chi tiết booking này."
        )
    elif booking is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy Booking."
        )
        
    return booking

# API TẠO BOOKING MỚI (POST Request)
@router.post(
    "/bookings/create",
    response_model=schemas.BookingRead, 
    status_code=status.HTTP_201_CREATED
)
def create_booking_endpoint(
    booking_data: schemas.BookingCreate, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    API Endpoint để Traveler gửi yêu cầu đặt phòng.
    """
    result = service.create_new_booking(
        db=db,
        booking_data=booking_data,
        user_id=current_user.id
    )
    
    if "error" in result:
        raise HTTPException(
            status_code=result["code"],
            detail=result["error"]
        )

    return result