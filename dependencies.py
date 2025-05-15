from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

user_DATABASE_URL = "sqlite:///./database/user.db"
ip_DATABASE_URL = "sqlite:///./database/ip.db"
server_DATABASE_URL = "sqlite:///./database/server.db"

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

server_engine = create_engine(
    server_DATABASE_URL, connect_args={"check_same_thread": False}
)
server_SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=server_engine)

def get_server_db():
    db = server_SessionLocal()
    try:
        yield db
    finally:
        db.close()