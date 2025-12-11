from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
from .. import ai_service

# Import các thành phần từ các file "trung tâm"
from .. import models, database  # Import từ thư mục app/
from . import schemas, service 

# Import dependency bảo mật (để kiểm tra owner)
from ..auth.security_helpers import get_current_active_owner

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
async def create_accommodation_endpoint(
    accommodation_data: schemas.AccommodationCreate, 
    db: Session = Depends(database.get_db),
    current_owner: models.User = Depends(get_current_active_owner)
):
    """
    API Endpoint để tạo một chỗ ở mới.
    'current_owner' đã được xác thực là role 'owner'.
    """
    try:
        # Logic: Lấy description và location từ dữ liệu gửi lên để AI phân tích
        print("🤖 Đang nhờ AI trích xuất tags...")
        generated_tags = await ai_service.generate_tags_from_desc(
            description=accommodation_data.description,
            location=accommodation_data.location
        )
        print(f"✅ Tags AI tạo ra: {generated_tags}")


        # Gọi service để xử lý logic
        return service.create_new_accommodation(
            db=db, 
            accommodation_data=accommodation_data, 
            owner_id=current_owner.id, # Lấy ID từ user đã xác thực
            ai_tags=generated_tags
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Không thể tạo chỗ ở: {str(e)}"
        )
    
@router.post("/generate-description")
async def generate_description_api(
    request_data: schemas.GenerateDescRequest,
    current_owner: models.User = Depends(get_current_active_owner)
):
    """
    API này nhận thông tin thô -> Trả về văn mẫu do AI viết.
    """
    description = await ai_service.generate_description_text(
        title=request_data.title,
        property_type=request_data.property_type,
        location=request_data.location,
        features=request_data.features
    )
    
    return {"generated_description": description}

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
async def update_accommodation_endpoint(  # <--- 1. Thêm async để gọi AI
    accommodation_id: int,
    accommodation_data: schemas.AccommodationUpdate,
    db: Session = Depends(database.get_db),
    current_owner: models.User = Depends(get_current_active_owner)
):
    """
    API Cập nhật chỗ ở. 
    TỰ ĐỘNG: Nếu có thay đổi Description hoặc Location -> Gọi AI tạo lại Tags.
    """
    
    # 1. Lấy thông tin cũ từ DB
    accommodation = service.get_accommodation_by_id(db, accommodation_id)
    
    if not accommodation:
        raise HTTPException(status_code=404, detail="Không tìm thấy chỗ ở.")
    
    if accommodation.owner_id != current_owner.id:
        raise HTTPException(status_code=403, detail="Không có quyền sửa chỗ ở này.")

    # --- LOGIC AI CẬP NHẬT TAGS TỰ ĐỘNG ---
    # Kiểm tra xem người dùng có gửi Description hoặc Location mới không
    if accommodation_data.description is not None or accommodation_data.location is not None:
        print("🔄 Phát hiện thay đổi nội dung, đang cập nhật Tags...")
        
        # Lấy nội dung mới nhất (nếu user không gửi cái mới thì dùng cái cũ trong DB)
        desc_to_use = accommodation_data.description if accommodation_data.description is not None else accommodation.description
        loc_to_use = accommodation_data.location if accommodation_data.location is not None else accommodation.location

        # Gọi AI (chỉ gọi nếu có đủ thông tin)
        if desc_to_use and loc_to_use:
            try:
                new_tags = await ai_service.generate_tags_from_desc(
                    description=desc_to_use, 
                    location=loc_to_use
                )
                
                # Gán trực tiếp vào object Database (SQLAlchemy)
                # Service sẽ commit thay đổi này cùng với các trường khác
                accommodation.tags = new_tags 
                print(f"✅ Tags mới: {new_tags}")
            except Exception as e:
                print(f"⚠️ Lỗi cập nhật tags: {e}")
                # Không raise lỗi để cho phép lưu các thông tin khác bình thường

    # 2. Gọi Service để lưu các thay đổi còn lại (Title, Price...)
    return service.update_accommodation(
        db=db,
        accommodation=accommodation,
        update_data=accommodation_data
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

@router.get(
    "/accommodations/{accommodation_id}/recommendations", 
    response_model=List[schemas.AccommodationRead] 
)
def get_recommendations_endpoint(
    accommodation_id: int,
    limit: int = Query(4),
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_active_owner) 
):
    recommendations = service.get_recommended_accommodations(
        db=db, 
        accommodation_id=accommodation_id, 
        limit=limit
    )
    return recommendations