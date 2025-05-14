from pydantic import BaseModel
from typing import List
from .room import RoomDetail

class DataCenterBase(BaseModel):
    name: str

class DataCenterCreate(DataCenterBase):
    pass

class DataCenterResponse(BaseModel):
    status: str
    id: int
    name: str

class Msg(BaseModel):
    status: str
    message: str

class DataCenterDetail(BaseModel):
    id: int
    name: str
    rooms: List[RoomDetail] = []

    class Config:
        from_attributes = True
