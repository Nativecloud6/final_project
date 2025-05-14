from pydantic import BaseModel
from typing import List
from .device import DeviceResponse

class RackBase(BaseModel):
    name: str
    total_units: int

class RackCreate(RackBase):
    pass

class RackResponse(BaseModel):
    status: str
    id: int
    name: str

class RackDetail(BaseModel):
    id: int
    name: str
    total_units: int
    used_units: int
    devices: List[DeviceResponse] = []

    class Config:
        from_attributes = True
