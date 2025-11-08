from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional 
from decimal import Decimal

# Import từ thư mục app/
from .. import models, database
# Import từ thư mục accommodations/ hiện tại
from . import schemas, service 

# Import dependency (bảo mật)
from ..feature_login.security_helpers import get_current_user

router = APIRouter(
    prefix="/api/accommodations",
    tags=["Public Accommodations"],
    # Yêu cầu tất cả API trong file này phải đăng nhập
    dependencies=[Depends(get_current_user)]
)

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

    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user) # Lấy user

):
    """
    API Endpoint cho traveler tìm kiếm chỗ ở dựa trên tọa độ (lat/lng)
    và bán kính (radius). Yêu cầu phải đăng nhập.
    """
    try:
        accommodations = service.search_accommodations(
            db=db,
            lat=lat,
            lng=lng,
            radius=radius,
            location_text=location_text
        )
        return accommodations
    except Exception as e:
        raise HTTPException (
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi khi tìm kiếm: {str(e)}"
        )

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