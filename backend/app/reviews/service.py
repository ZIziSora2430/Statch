from sqlalchemy.orm import Session
from sqlalchemy import desc
from .. import models  # Import model từ thư mục cha (app)
from . import schemas  # Import schema từ thư mục hiện tại (app/reviews)

def create_review(db: Session, user_id: int, accommodation_id: int, review_data: schemas.ReviewCreate):
    # 1. Check booking completed
    has_stayed = db.query(models.Booking).filter(
        models.Booking.user_id == user_id,
        models.Booking.accommodation_id == accommodation_id,
        models.Booking.status == 'completed'
    ).first()

    if not has_stayed:
        raise ValueError("Bạn chưa hoàn thành chuyến đi tại đây nên không thể đánh giá.")

    # 2. Save review
    new_review = models.Review(
        user_id=user_id,
        accommodation_id=accommodation_id,
        rating=review_data.rating,
        content=review_data.content
    )
    
    try:
        db.add(new_review)
        db.commit()
        db.refresh(new_review)
        return new_review
    except Exception as e:
        db.rollback()
        raise e

def get_reviews_by_accommodation(db: Session, accommodation_id: int, limit: int = 5):
    return db.query(models.Review)\
        .filter(models.Review.accommodation_id == accommodation_id)\
        .order_by(models.Review.review_id.desc())\
        .limit(limit)\
        .all()