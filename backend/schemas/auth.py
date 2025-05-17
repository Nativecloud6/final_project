from pydantic import BaseModel

class LoginRequest(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    role: str

class LoginResponse(BaseModel):
    status: str
    user: UserResponse
    token: str

class RegisterRequest(BaseModel):
    username: str
    password: str
