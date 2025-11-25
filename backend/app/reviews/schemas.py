from pydantic import BaseModel, ConfigDict
from typing import Optional

# Schema phụ: Thông tin người review
class UserInfoInReview(BaseModel):
    id: int
    full_name: str
    # picture_url: Optional[str] = None 

    class Config:
        model_config = ConfigDict(from_attributes=True)

# Input: Dữ liệu gửi lên
class ReviewCreate(BaseModel):
    rating: int  # 1-5
    content: str

# Output: Dữ liệu trả về
class ReviewRead(BaseModel):
    review_id: int
    rating: int
    content: str
    user: UserInfoInReview 

    class Config:
        model_config = ConfigDict(from_attributes=True)