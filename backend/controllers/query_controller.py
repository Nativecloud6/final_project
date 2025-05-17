from sqlalchemy.orm import Session
from fastapi import HTTPException
from ..schemas import datacenter

def search_device(db: Session, query: str):
    device = None
    if query.isdigit():
        device = db.query(datacenter.Device).filter(datacenter.Device.id == int(query)).first()
    if not device:
        device = db.query(datacenter.Device).filter(datacenter.Device.name.ilike(f"%{query}%")).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    return device

