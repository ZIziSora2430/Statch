from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from .. import database, models
from ..auth.security_helpers import get_current_user
from . import schemas, service

# Prefix rỗng ở đây, ta sẽ set prefix "/api" ở main.py hoặc gộp vào accommodation path
router = APIRouter(tags=["Reviews"])

# 1. Viết Review
@router.post(
    "/accommodations/{accommodation_id}/reviews", 
    response_model=schemas.ReviewRead,
    status_code=status.HTTP_201_CREATED
)
def create_review_endpoint(
    accommodation_id: int,
    review_data: schemas.ReviewCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    try:
        return service.create_review(
            db=db,
            user_id=current_user.id,
            accommodation_id=accommodation_id,
            review_data=review_data
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi server: {str(e)}")

# 2. Xem Review
@router.get(
    "/accommodations/{accommodation_id}/reviews", 
    response_model=List[schemas.ReviewRead]
)
def get_reviews_endpoint(
    accommodation_id: int,
    db: Session = Depends(database.get_db)
):
    return service.get_reviews_by_accommodation(db, accommodation_id)