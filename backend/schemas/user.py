from sqlalchemy import Column, Integer, String
from .database import UserBase

class User(UserBase):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    user_level = Column(String, default="user")
    token = Column(String, nullable=True)  # temporary key

