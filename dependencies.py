from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

user_DATABASE_URL = "sqlite:///./database/user.db"
ip_DATABASE_URL = "sqlite:///./database/ip.db"
rack_DATABASE_URL = "sqlite:///./database/rack.db"

user_engine = create_engine(
    user_DATABASE_URL, connect_args={"check_same_thread": False}
)
user_SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=user_engine)

def get_user_db():
    db = user_SessionLocal()
    try:
        yield db
    finally:
        db.close()

ip_engine = create_engine(
    ip_DATABASE_URL, connect_args={"check_same_thread": False}
)
ip_SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=ip_engine)

def get_ip_db():
    db = ip_SessionLocal()
    try:
        yield db
    finally:
        db.close()

rack_engine = create_engine(
    rack_DATABASE_URL, connect_args={"check_same_thread": False}
)
rack_SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=rack_engine)

def get_rack_db():
    db = rack_SessionLocal()
    try:
        yield db
    finally:
        db.close()





import hashlib
import uuid

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return hash_password(plain_password) == hashed_password

def generate_token() -> str:
    return str(uuid.uuid4())






