from fastapi import FastAPI, HTTPException, Request, Depends, Form
from fastapi.responses import FileResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import sessionmaker, declarative_base
import os
import bcrypt
import secrets
import uuid

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