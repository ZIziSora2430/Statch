import bcrypt
from sqlalchemy.orm import Session
from sqlalchemy import select
from .. import models
from typing import Optional
from fastapi import Header, Depends, HTTPException, status
from ..database import get_db # Import get_db trung tâm



def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    # Truncate password to 72 bytes if needed
    password_bytes = password.encode('utf-8')[:72]
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hashed password"""
    password_bytes = plain_password.encode('utf-8')[:72]
    hashed_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password_bytes, hashed_bytes)

# ======= Get current user từ token =======
def get_current_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing token")
    try:
        token = authorization.split(" ")[1]
        username, role = token.split(":")
        user = db.scalar(select(models.User).where(models.User.username == username))
        if not user:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
    

# --- Dependency cho Accommodation ---
def get_current_active_owner(current_user: models.User = Depends(get_current_user)):
    """
    Dependency dựa trên get_current_user, nhưng kiểm tra vai trò 'owner'.
    """
    if current_user.role != "owner":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operation not permitted: Requires owner role."
        )
    return current_user