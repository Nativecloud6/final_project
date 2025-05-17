from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from ..controllers import query_controller
from ..schemas.database import get_dc_db
from ..schemas.query import DeviceSearchResponse
from ..schemas.datacenter import DataCenter, Room, Rack

router = APIRouter(prefix="/api/devices", tags=["devices"])

@router.get("/search", response_model=DeviceSearchResponse)
def search_device(query: str = Query(...), db: Session = Depends(get_dc_db)):
    d = query_controller.search_device(db, query)
    d.ip = d.ip_address
    if d.start_unit is not None and d.end_unit is not None:
        d.unit_count = d.end_unit - d.start_unit + 1
    else:
        d.unit_count = None
    if not d.data_center_id or not d.room_id or not d.rack_id:
        raise HTTPException(status_code=400, detail="Device is not installed or has no location")

    dc = db.query(DataCenter).get(d.data_center_id)
    rm = db.query(Room).get(d.room_id)
    rk = db.query(Rack).get(d.rack_id)
    if not dc or not rm or not rk:
        raise HTTPException(status_code=404, detail="Location data not found")

    location = {
        "data_center": dc.name,
        "room": rm.name,
        "rack": rk.name,
        "start_unit": d.start_unit,
        "end_unit": d.end_unit
    }
    return {
        "status": "success",
        "device": d,
        "location": location
    }
