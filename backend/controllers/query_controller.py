from sqlalchemy.orm import Session
from fastapi import HTTPException
from ..schemas import models

def search_device(db: Session, query: str):
    device = None
    if query.isdigit():
        device = db.query(models.Device).filter(models.Device.id == int(query)).first()
    if not device:
        device = db.query(models.Device).filter(models.Device.name.ilike(f"%{query}%")).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    return device

