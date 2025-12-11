from sqlalchemy.orm import Session
from ..models import Notification


def create_notification(db: Session, user_id: int, message: str):
    notif = Notification(user_id=user_id, message=message)
    db.add(notif)
    db.commit()
    db.refresh(notif)
    return notif


def get_notifications_for_user(db: Session, user_id: int):
    return db.query(Notification)\
             .filter(Notification.user_id == user_id)\
             .order_by(Notification.created_at.desc())\
             .all()

def mark_as_read(db: Session, notif_id: int, user_id: int):
    notif = db.query(Notification).filter(
        Notification.id == notif_id,
        Notification.user_id == user_id
    ).first()

    if not notif:
        raise Exception("Notification not found")

    notif.is_read = True
    db.commit()
    db.refresh(notif)
    return notif

def delete_notification(db: Session, notif_id: int, user_id: int):
    notif = db.query(Notification).filter(
        Notification.id == notif_id,
        Notification.user_id == user_id
    ).first()

    if not notif:
        raise Exception("Notification not found")

    db.delete(notif)
    db.commit()
    return {"message": "Notification deleted successfully"}
