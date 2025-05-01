from fastapi import FastAPI, HTTPException, Request, Depends, Form
from fastapi.responses import FileResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import sessionmaker, declarative_base
import os
import bcrypt
import secrets
import uuid

from dependencies import get_db
from users_manager import auth, role, rack
# from ip_manager import ip

app = FastAPI()
# Static file serving
app.mount("/static", StaticFiles(directory="frontend", html=True), name="static")

#api routers
app.include_router(auth.router, prefix="/api", tags=["auth"])
app.include_router(role.router, prefix="/api", tags=["role"])
app.include_router(rack.router, prefix="/api", tags=["rack"])
# app.include_router(ip.router, prefix="/api", tags=["ip"])

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