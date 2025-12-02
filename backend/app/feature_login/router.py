from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db # Import get_db trung tâm
from .. import models

from . import schemas, service
from .security_helpers import get_current_user 

router = APIRouter()



# ======= Forgot password =======
@router.post("/forgot-password")
def forgot_password(payload: schemas.ForgotPasswordRequest, db: Session = Depends(get_db)):
    # Luôn trả về thành công để tránh lộ thông tin email nào đã đăng ký
    service.request_password_reset(db, payload.email)
    return {"message": "Nếu email tồn tại, mã xác nhận đã được gửi."}

@router.post("/reset-password")
def reset_password_endpoint(payload: schemas.ResetPasswordRequest, db: Session = Depends(get_db)):
    try:
        service.reset_password(db, payload)
        return {"message": "Đặt lại mật khẩu thành công."}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
# ======= Signup =======
@router.post("/signup", response_model=schemas.UserResponse)
def signup(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    print(f"📝 Signup request: {user_in.username}, {user_in.email}, {user_in.role}")
    
    # Kiểm tra username/email
    if service.get_user_by_username(db, user_in.username):
        print(f"❌ Username already exists")
        raise HTTPException(status_code=400, detail="Username already registered")
    
    if service.get_user_by_email(db, user_in.email):
        print(f"❌ Email already exists")
        raise HTTPException(status_code=400, detail="Email already registered")
    
    try:
        user = service.create_user(db=db, user_in = user_in)
        print(f"✅ User created: {user.username}")
        return user
    
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ====== Đặt lại mật khẩu ==========
@router.put("/users/change-password")
def change_password_endpoint(
    payload: schemas.ChangePasswordRequest, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user) # Yêu cầu phải đăng nhập
):
    is_success = service.change_user_password(db, current_user, payload)
    
    if not is_success:
        raise HTTPException(status_code=400, detail="Mật khẩu hiện tại không chính xác.")
        
    return {"message": "Đổi mật khẩu thành công."}
# ======= Login =======
@router.post("/login", response_model=schemas.Token)
def login(form_data: schemas.UserLogin, db: Session = Depends(get_db)):
    

    token_data = service.login_user(db, form_data)

    # ✅ SỬA: Dùng verify_password helper
    if not token_data: 
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    
    return token_data
    
    
# ======= Get current user =======
@router.get("/users/me", response_model=schemas.UserResponse)
def read_me(current_user: models.User = Depends(get_current_user)):
    return current_user

# ======= Update current user =======
@router.put("/users/me", response_model=schemas.UserResponse)
def update_me(payload: schemas.UserUpdate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    
    current_user = service.update_user(db, current_user, payload)
    
    if not current_user:
        raise HTTPException(status_code=400, detail="Email already used")
    
    return current_user

# ======= Example protected routes =======
@router.get("/owner/dashboard")
def owner_dashboard(current_user: models.User = Depends(get_current_user)):
    if current_user.role.value != "owner":
        raise HTTPException(status_code=403, detail="Forbidden")
    return {"msg": f"Hello owner {current_user.username}"}

@router.get("/traveller/home")
def traveller_home(current_user: models.User = Depends(get_current_user)):
    if current_user.role.value != "traveler":
        raise HTTPException(status_code=403, detail="Forbidden")
    return {"msg": f"Hello traveller {current_user.username}"}