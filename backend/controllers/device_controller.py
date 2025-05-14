from sqlalchemy.orm import Session
from fastapi import HTTPException
from ..schemas import models
from ..schemas.device import DeviceCreate, DeviceInstall

def create_device(db: Session, dev: DeviceCreate):
    db_dev = models.Device(
        name=dev.name,
        model=dev.model,
        service=dev.service,
        state=dev.state
    )
    db.add(db_dev)
    db.commit()
    db.refresh(db_dev)
    db_dev.ip = db_dev.ip_address
    db_dev.unit_count = None
    return db_dev

def install_device(db: Session, device_id: int, ins: DeviceInstall):
    device = db.query(models.Device).filter(models.Device.id == device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    device.data_center_id = ins.data_center_id
    device.room_id = ins.room_id
    device.rack_id = ins.rack_id
    device.start_unit = ins.start_unit
    device.end_unit = ins.end_unit
    device.state = ins.state
    rack = db.query(models.Rack).filter(models.Rack.id == ins.rack_id).first()
    if rack:
        rack.used_units += (ins.end_unit - ins.start_unit + 1)
    db.commit()
    db.refresh(device)
    device.ip = device.ip_address
    if device.start_unit is not None and device.end_unit is not None:
        device.unit_count = device.end_unit - device.start_unit + 1
    else:
        device.unit_count = None
    return device

def uninstall_device(db: Session, device_id: int):
    device = db.query(models.Device).filter(models.Device.id == device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    if device.rack_id and device.start_unit is not None and device.end_unit is not None:
        rack = db.query(models.Rack).filter(models.Rack.id == device.rack_id).first()
        if rack:
            rack.used_units -= (device.end_unit - device.start_unit + 1)
    device.data_center_id = None
    device.room_id = None
    device.rack_id = None
    device.start_unit = None
    device.end_unit = None
    device.state = "uninstalled"
    db.commit()
    db.refresh(device)
    device.ip = None
    device.unit_count = None
    return device
