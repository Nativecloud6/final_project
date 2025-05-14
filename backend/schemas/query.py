from pydantic import BaseModel
from .device import DeviceResponse

class Location(BaseModel):
    data_center: str
    room:        str
    rack:        str
    start_unit:  int
    end_unit:    int

    class Config:
        from_attributes = True

class DeviceSearchResponse(BaseModel):
    status:   str
    device:   DeviceResponse
    location: Location

    class Config:
        from_attributes = True
