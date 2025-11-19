from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

# Import các thành phần từ các file "trung tâm"
from .. import models, database  # Import từ thư mục app/
from . import schemas, service 

# Import dependency bảo mật (để kiểm tra owner)
from ..feature_login.security_helpers import get_current_active_owner


# --- ĐỊNH NGHĨA ROUTER ---
# Đây là biến "router" mà app/main.py đang tìm kiếm
router = APIRouter(
    prefix="/api/owner/accommodations", # Tiền tố cho tất cả API trong file này
    tags=["Owner Accommodations"],      # Tên nhóm trong Swagger
    # Bảo vệ tất cả API trong file này bằng cách yêu cầu vai trò "owner"
    dependencies=[Depends(get_current_active_owner)] 
)

@router.post(
    "/", 
    response_model=schemas.AccommodationRead, 
    status_code=status.HTTP_201_CREATED
)
def create_accommodation_endpoint(
    accommodation_data: schemas.AccommodationCreate, 
    db: Session = Depends(database.get_db),
    # Chúng ta lấy current_owner từ dependency ở trên
    current_owner: models.User = Depends(get_current_active_owner)
):
    """
    API Endpoint để tạo một chỗ ở mới.
    'current_owner' đã được xác thực là role 'owner'.
    """
    try:
        # Gọi service để xử lý logic
        return service.create_new_accommodation(
            db=db, 
            accommodation_data=accommodation_data, 
            owner_id=current_owner.id # Lấy ID từ user đã xác thực
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Không thể tạo chỗ ở: {str(e)}"
        )
    
#Xóa một chỗ ở
@router.delete(
    "/{accommodation_id}",
    status_code=status.HTTP_204_NO_CONTENT # 204 nghĩa là "Thành công, không có nội dung"
)
def delete_accommodation_endpoint(
    accommodation_id: int, # Lấy ID từ URL
    db: Session = Depends(database.get_db),
    current_owner: models.User = Depends(get_current_active_owner)
):
    """
    API Endpoint để chủ sở hữu (owner) xóa một chỗ ở.
    """
    
    # 1. Tìm chỗ ở trong DB
    accommodation = service.get_accommodation_by_id(
        db=db, 
        accommodation_id=accommodation_id
    )
    
    # 2. Kiểm tra xem chỗ ở có tồn tại không
    if not accommodation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy chỗ ở."
        )
        
    # 3. KIỂM TRA QUYỀN SỞ HỮU 
    # Đảm bảo owner chỉ có thể xóa nhà của chính mình
    if accommodation.owner_id != current_owner.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền xóa chỗ ở này."
        )
        
    # 4. Gọi service để xóa
    try:
        service.delete_accommodation(db=db, accommodation=accommodation)
        # HTTP 204 không trả về body, nên không cần return
        return None 
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Không thể xóa chỗ ở: {str(e)}"
        )
    
# Edit một chỗ ở
@router.put(
    "/{accommodation_id}",
    response_model=schemas.AccommodationRead # Trả về chỗ ở đã được cập nhật
)
def update_accommodation_endpoint(
    accommodation_id: int, # Lấy ID từ URL
    accommodation_data: schemas.AccommodationUpdate, # Lấy data mới từ Body
    db: Session = Depends(database.get_db),
    current_owner: models.User = Depends(get_current_active_owner)
):
    """
    API Endpoint để chủ sở hữu (owner) cập nhật chỗ ở của mình.
    """
    
    # 1. Tìm chỗ ở
    accommodation = service.get_accommodation_by_id(db, accommodation_id)
    
    # 2. Kiểm tra 404
    if not accommodation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy chỗ ở."
        )
    
    # 3. Kiểm tra quyền sở hữu
    if accommodation.owner_id != current_owner.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền sửa chỗ ở này."
        )
        
    # 4. Gọi service để cập nhật
    try:
        return service.update_accommodation(
            db=db,
            accommodation=accommodation,
            update_data=accommodation_data
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Không thể cập nhật chỗ ở: {str(e)}"
        )


@router.get(
    "/", 
    response_model=List[schemas.AccommodationRead]
)
def get_my_accommodations_endpoint(
    db: Session = Depends(database.get_db),
    current_owner: models.User = Depends(get_current_active_owner)
):
    """
    API lấy danh sách nhà của chính Owner đang đăng nhập.
    URL thực tế: GET /api/owner/accommodations/
    """
    return service.get_accommodations_by_owner(db, owner_id=current_owner.id)