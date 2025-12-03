# app/accommodations/router.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

# Import các thành phần từ các file khác
from .. import models         # Từ app/models.py
from ..database import get_db # Từ app/database.py
from ..auth.security import get_current_active_owner # Từ app/auth/security.py (Giả sử)

# Import từ các file trong cùng thư mục 'accommodations'
from . import schemas, service 

# Khởi tạo router cho tính năng này
router = APIRouter(
    prefix="/api/owner/accommodations", # Tiền tố cho tất cả API trong file này
    tags=["Owner Accommodations"],      # Tên nhóm trong tài liệu Swagger
)

@router.post(
    "/", 
    response_model=schemas.AccommodationRead, 
    status_code=status.HTTP_201_CREATED
)
def create_accommodation_endpoint(
    # 1. Nhận dữ liệu từ body của request,
    #    FastAPI tự động validate bằng AccommodationCreate
    accommodation_data: schemas.AccommodationCreate, 
    
    # 2. Dependencies
    db: Session = Depends(get_db),
    current_owner: models.User = Depends(get_current_active_owner)
):
    """
    API Endpoint để tạo một chỗ ở mới.
    """
    
    # 3. Kiểm tra xem người dùng có đúng vai trò 'owner' không
    # (Hàm get_current_active_owner nên làm việc này, 
    #  nhưng ta có thể kiểm tra lại cho chắc)
    if current_owner.role != "owner":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Chỉ có chủ sở hữu mới có thể thêm chỗ ở."
        )

    # 4. GỌI HÀM SERVICE
    # Tách biệt hoàn toàn logic ra khỏi router
    try:
        return service.create_new_accommodation(
            db=db, 
            accommodation_data=accommodation_data, 
            owner_id=current_owner.users_id # Lấy ID từ user đã xác thực
        )
    except Exception as e:
        # Bắt lỗi chung từ service
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Không thể tạo chỗ ở: {str(e)}"
        )