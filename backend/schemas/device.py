from pydantic import BaseModel
from typing import Optional

class DeviceBase(BaseModel):
    name: str
    model: Optional[str] = None
    service: Optional[str] = None
    state: Optional[str] = "uninstalled"

class DeviceCreate(DeviceBase):
    pass

class DeviceResponse(BaseModel):
    id: int
    name: str
    # model: Optional[str]
    service: Optional[str]
    state: str
    ip: Optional[str]
    # data_center_id: Optional[int]
    # room_id: Optional[int]
    # rack_id: Optional[int]
    start_unit: Optional[int]
    end_unit: Optional[int]
    unit_count: Optional[int]

    class Config:
        from_attributes = True

class DeviceInstall(BaseModel):
    data_center_id: int
    room_id: int
    rack_id: int
    start_unit: int
    end_unit: int
    state: Optional[str] = "installed"

class DeviceActionResponse(BaseModel):
    status: str
    device: DeviceResponse

