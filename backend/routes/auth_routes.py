from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from schemas.auth import RegisterRequest, LoginRequest, LoginResponse, UserResponse
from schemas.database import get_user_db
from models.user import User
from dependencies import hash_password, verify_password, generate_token

router = APIRouter()

@router.post("/api/register", tags=["auth"])
def register(req: RegisterRequest, db: Session = Depends(get_user_db)):
    existing_user = db.query(User).filter(User.username == req.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    new_user = User(
        username=req.username,
        password_hash=hash_password(req.password),
        user_level="1",
        token=None
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"status": "registered", "user_id": new_user.id}


@router.post("/api/login", response_model=LoginResponse, tags=["auth"])
def login(req: LoginRequest, db: Session = Depends(get_user_db)):
    user = db.query(User).filter(User.username == req.username).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    # Generate and store temporary token
    token = generate_token()
    user.token = token
    db.commit()

    return LoginResponse(
        status="success",
        user=UserResponse(id=user.id, username=user.username, role=user.user_level),
        token=token
    )

