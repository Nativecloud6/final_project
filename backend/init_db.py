# backend/init_db.py
from schemas.database import UserBase, DCBase, user_engine, dc_engine
from schemas.user import User
from schemas.datacenter import DataCenter

print("Creating user.db tables...")
UserBase.metadata.create_all(bind=user_engine)

print("Creating dc_mvp.db tables...")
DCBase.metadata.create_all(bind=dc_engine)

