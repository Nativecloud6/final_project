from sqlalchemy.orm import Session
from fastapi import HTTPException
from ..schemas import models
from ..schemas.room import RoomCreate

def create_room(db: Session, dc_id: int, room: RoomCreate):
    if not db.query(models.DataCenter).filter(models.DataCenter.id == dc_id).first():
        raise HTTPException(status_code=404, detail="DataCenter not found")
    db_room = models.Room(name=room.name, data_center_id=dc_id)
    db.add(db_room)
    db.commit()
    db.refresh(db_room)
    return db_room

def delete_room(db: Session, room_id: int):
    rm = db.query(models.Room).filter(models.Room.id == room_id).first()
    if not rm:
        raise HTTPException(status_code=404, detail="Room not found")
    db.delete(rm)
    db.commit()
    return {"status": "success", "message": "Deleted successfully"}
