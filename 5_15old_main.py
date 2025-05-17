from fastapi import FastAPI, HTTPException, Request, Depends, Form
from fastapi.responses import FileResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import sessionmaker, declarative_base
import os
import bcrypt
import secrets
import uuid

from backend.schemas.database import DCBase, dc_engine, UserBase, user_engine
from backend.routes import (
    datacenter_routes,
    room_routes,
    rack_routes,
    device_routes,
    ip_routes,
    auth_routes,
    query_routes,
)
from backend.schemas.auth import LoginRequest, LoginResponse, UserResponse

# Create tables for both databases
# DCBase.metadata.create_all(bind=dc_engine)
# UserBase.metadata.create_all(bind=user_engine)

app = FastAPI()

# ✅ Static file serving
app.mount("/static", StaticFiles(directory="frontend", html=True), name="static")

DATABASE_URL = "sqlite:///./users.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, index=True)
    password_hash = Column(String)
    api_key = Column(String, unique=True, index=True)
    session_token = Column(String, index=True, nullable=True)  # ✅ new
    role = Column(String, default="user") #for rack management

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Include routers
app.include_router(datacenter_routes.router)
app.include_router(room_routes.router)
app.include_router(rack_routes.router)
app.include_router(device_routes.router)
app.include_router(query_routes.router)
app.include_router(ip_routes.router)
app.include_router(auth_routes.router)

# ✅ Smart static page redirect (e.g. /register -> /static/register/index.html)
@app.get("/{page_name:path}")
async def static_redirect(page_name: str):
    if page_name.startswith("api") or page_name.startswith("static"):
        raise HTTPException(status_code=404, detail="Not a static page")

    clean_name = page_name.rstrip("/")

    # Folder-style path
    folder_path = os.path.join(os.path.dirname(__file__), "frontend", clean_name, "index.html")
    if os.path.isfile(folder_path):
        return RedirectResponse(url=f"/static/{clean_name}/index.html")

    # Flat .html fallback
    file_path = os.path.join(os.path.dirname(__file__), "frontend", f"{clean_name}.html")
    if os.path.isfile(file_path):
        return RedirectResponse(url=f"/static/{clean_name}.html")

    raise HTTPException(status_code=404, detail="Page not found")

# ✅ Registration
# added role parameter to the registration endpoint
@app.post("/api/register")
def register(username: str = Form(...), password: str = Form(...), role: str = Form("user"), db=Depends(get_db)):
    if db.query(User).filter(User.username == username).first():
        raise HTTPException(status_code=400, detail="User already exists")

    password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    api_key = secrets.token_hex(16)
    session_token = str(uuid.uuid4())
    user = User(username=username, password_hash=password_hash, api_key=api_key, session_token=session_token, role=role)
    db.add(user)
    db.commit()
    return {"api_key": api_key, "session_token": session_token}

# ✅ Login with session enforcement
@app.post("/api/login")
def login(username: str = Form(...), password: str = Form(...), db=Depends(get_db)):
    user = db.query(User).filter(User.username == username).first()
    if not user or not bcrypt.checkpw(password.encode(), user.password_hash.encode()):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Invalidate old session
    session_token = str(uuid.uuid4())
    user.session_token = session_token
    db.commit()
    return {"api_key": user.api_key, "session_token": session_token}

# ✅ Secure data with session check
@app.get("/api/secure-data")
def secure_data(request: Request, db=Depends(get_db)):
    api_key = request.headers.get("X-API-Key")
    session_token = request.headers.get("X-Session-Token")

    if not api_key or not session_token:
        raise HTTPException(status_code=403, detail="Missing credentials")

    user = db.query(User).filter(User.api_key == api_key).first()
    if not user or user.session_token != session_token:
        raise HTTPException(status_code=403, detail="Session invalidated")

    return {"message": f"Hello {user.username}, you accessed secure data!"}

