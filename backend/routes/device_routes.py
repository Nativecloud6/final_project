from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..controllers import device_controller
from ..schemas.database import get_dc_db
from ..schemas.device import DeviceCreate, DeviceInstall, DeviceResponse, DeviceActionResponse

router = APIRouter(prefix="/api/devices", tags=["devices"])

@router.post("", response_model=DeviceResponse)
def create_device(dev: DeviceCreate, db: Session = Depends(get_dc_db)):
    return device_controller.create_device(db, dev)

@router.post("/{device_id}/install", response_model=DeviceActionResponse)
def install_device(device_id: int, ins: DeviceInstall, db: Session = Depends(get_dc_db)):
    d = device_controller.install_device(db, device_id, ins)
    return {"status": "success", "device": d}

@router.post("/{device_id}/uninstall", response_model=DeviceActionResponse)
def uninstall_device(device_id: int, db: Session = Depends(get_dc_db)):
    d = device_controller.uninstall_device(db, device_id)
    return {"status": "success", "device": d}
