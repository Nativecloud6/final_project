from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

user_DATABASE_URL = "sqlite:///./database/user.db"

engine = create_engine(
    user_DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
