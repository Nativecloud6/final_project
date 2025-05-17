import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Resolve absolute paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "data"))

# --- Data Center DB ---
DC_SQLALCHEMY_DATABASE_URL = f"sqlite:///{os.path.join(DATA_DIR, 'dc_mvp.db')}"
dc_engine = create_engine(DC_SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
DCSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=dc_engine)
DCBase = declarative_base()

def get_dc_db():
    db = DCSessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- User DB ---
USER_SQLALCHEMY_DATABASE_URL = f"sqlite:///{os.path.join(DATA_DIR, 'user.db')}"
user_engine = create_engine(USER_SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
UserSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=user_engine)
UserBase = declarative_base()

def get_user_db():
    db = UserSessionLocal()
    try:
        yield db
    finally:
        db.close()

