from sqlalchemy.orm import Session
from fastapi import HTTPException
from ..schemas import models
from ..schemas.rack import RackCreate

def create_rack(db: Session, room_id: int, rack: RackCreate):
    if not db.query(models.Room).filter(models.Room.id == room_id).first():
        raise HTTPException(status_code=404, detail="Room not found")
    db_rack = models.Rack(
        name=rack.name,
        total_units=rack.total_units,
        room_id=room_id
    )
    db.add(db_rack)
    db.commit()
    db.refresh(db_rack)
    return db_rack

def delete_rack(db: Session, rack_id: int):
    rk = db.query(models.Rack).filter(models.Rack.id == rack_id).first()
    if not rk:
        raise HTTPException(status_code=404, detail="Rack not found")
    db.delete(rk)
    db.commit()
    return {"status": "success", "message": "Deleted successfully"}

