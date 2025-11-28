from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from . import schemas
from ..database import get_db
from ..feature_login.security_helpers import get_current_user
from .service import get_notifications_for_user

router = APIRouter(
    prefix="/api/notifications",
    tags=["Notifications"]
)

@router.get("/", response_model=List[schemas.NotificationRead])
def list_notifications(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    return get_notifications_for_user(db, current_user.id)
