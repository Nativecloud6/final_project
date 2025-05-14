from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..controllers import datacenter_controller
from ..schemas.database import get_db
from ..schemas.datacenter import DataCenterCreate, DataCenterResponse, DataCenterDetail, Msg

router = APIRouter(prefix="/api/data-centers", tags=["data-centers"])

@router.post("", response_model=DataCenterResponse)
def create_data_center(dc: DataCenterCreate, db: Session = Depends(get_db)):
    db_dc = datacenter_controller.create_data_center(db, dc)
    return {"status": "success", "id": db_dc.id, "name": db_dc.name}

@router.get("", response_model=List[DataCenterDetail])
def get_data_centers(db: Session = Depends(get_db)):
    dcs = datacenter_controller.get_data_centers(db)
    for dc in dcs:
        for room in dc.rooms:
            for rack in room.racks:
                for device in rack.devices:
                    device.ip = device.ip_address
                    if device.start_unit is not None and device.end_unit is not None:
                        device.unit_count = device.end_unit - device.start_unit + 1
                    else:
                        device.unit_count = None
    return dcs
    # return datacenter_controller.get_data_centers(db)

@router.delete("/{dc_id}", response_model=Msg)
def delete_data_center(dc_id: int, db: Session = Depends(get_db)):
    return datacenter_controller.delete_data_center(db, dc_id)
