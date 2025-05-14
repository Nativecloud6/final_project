from fastapi import FastAPI, HTTPException
from .schemas.database import Base, engine
from .routes import (
    datacenter_routes,
    room_routes,
    rack_routes,
    device_routes,
    query_routes,
    ip_routes,
)
from .schemas.auth import LoginRequest, LoginResponse, UserResponse

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Data Center Management System")

app.include_router(datacenter_routes.router)
app.include_router(room_routes.router)
app.include_router(rack_routes.router)
app.include_router(device_routes.router)
app.include_router(query_routes.router)
app.include_router(ip_routes.router)

@app.post("/api/login", response_model=LoginResponse, tags=["auth"])
def login(req: LoginRequest):
    if req.username == "admin" and req.password == "123456":
        return LoginResponse(
            status="success",
            user=UserResponse(id=1, username="admin", role="admin"),
            token="xxxxx.yyyyy.zzzzz",
        )
    raise HTTPException(status_code=401, detail="Invalid username or password")

