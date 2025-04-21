from fastapi import FastAPI, HTTPException, Request, Depends, Form
from fastapi.responses import HTMLResponse
from fastapi.responses import FileResponse
import os
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import sessionmaker, declarative_base
import bcrypt
import secrets

app = FastAPI()
DATABASE_URL = "sqlite:///./users.db"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, index=True)
    password_hash = Column(String)
    api_key = Column(String, unique=True, index=True)

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/", response_class=FileResponse)
async def root():
    file_path = os.path.join(os.path.dirname(__file__), "frontend", "index.html")
    return FileResponse(file_path)


@app.post("/api/register")
def register(username: str = Form(...), password: str = Form(...), db=Depends(get_db)):
    if db.query(User).filter(User.username == username).first():
        raise HTTPException(status_code=400, detail="User already exists")

    password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    api_key = secrets.token_hex(16)
    user = User(username=username, password_hash=password_hash, api_key=api_key)
    db.add(user)
    db.commit()
    return {"api_key": api_key}

@app.post("/api/login")
def login(username: str = Form(...), password: str = Form(...), db=Depends(get_db)):
    user = db.query(User).filter(User.username == username).first()
    if not user or not bcrypt.checkpw(password.encode(), user.password_hash.encode()):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"api_key": user.api_key}

@app.get("/api/secure-data")
def secure_data(request: Request, db=Depends(get_db)):
    api_key = request.headers.get("X-API-Key")
    if not api_key:
        raise HTTPException(status_code=403, detail="Missing API key")
    user = db.query(User).filter(User.api_key == api_key).first()
    if not user:
        raise HTTPException(status_code=403, detail="Invalid API key")
    return {"message": f"Hello {user.username}, you accessed secure data!"}

