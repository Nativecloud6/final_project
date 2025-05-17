from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..controllers import rack_controller
from ..schemas.database import get_dc_db
from ..schemas.rack import RackCreate, RackResponse
from ..schemas.datacenter import Msg

router = APIRouter(prefix="/api", tags=["racks"])

@router.post("/rooms/{room_id}/racks", response_model=RackResponse)
def create_rack(room_id: int, rack: RackCreate, db: Session = Depends(get_dc_db)):
    db_rk = rack_controller.create_rack(db, room_id, rack)
    return {"status": "success", "id": db_rk.id, "name": db_rk.name}

@router.delete("/racks/{rack_id}", response_model=Msg)
def delete_rack(rack_id: int, db: Session = Depends(get_dc_db)):
    return rack_controller.delete_rack(db, rack_id)
