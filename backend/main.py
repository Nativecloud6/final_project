from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles  # ✅ This line is required

# Import both DB bases and engines
from .schemas.database import DCBase, dc_engine, UserBase, user_engine

# Import all route modules
from backend.routes import (
    datacenter_routes,
    room_routes,
    rack_routes,
    device_routes,
    query_routes,
    ip_routes,
    auth_routes,  # <-- add this for login/register
)

# Create tables for both databases
DCBase.metadata.create_all(bind=dc_engine)
UserBase.metadata.create_all(bind=user_engine)

app = FastAPI(title="Data Center Management System")
app.mount("/static", StaticFiles(directory="DCM_frontend", html=True), name="static")

# Include routers
app.include_router(datacenter_routes.router)
app.include_router(room_routes.router)
app.include_router(rack_routes.router)
app.include_router(device_routes.router)
app.include_router(query_routes.router)
app.include_router(ip_routes.router)
app.include_router(auth_routes.router)  # <-- login/register endpoints

