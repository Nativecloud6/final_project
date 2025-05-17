from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..controllers import room_controller
from ..schemas.database import get_dc_db
from ..schemas.room import RoomCreate, RoomResponse
from ..schemas.datacenter import Msg

router = APIRouter(prefix="/api", tags=["rooms"])

@router.post("/data-centers/{dc_id}/rooms", response_model=RoomResponse)
def create_room(dc_id: int, room: RoomCreate, db: Session = Depends(get_dc_db)):
    db_rm = room_controller.create_room(db, dc_id, room)
    return {"status": "success", "id": db_rm.id, "name": db_rm.name}

@router.delete("/rooms/{room_id}", response_model=Msg)
def delete_room(room_id: int, db: Session = Depends(get_dc_db)):
    return room_controller.delete_room(db, room_id)
