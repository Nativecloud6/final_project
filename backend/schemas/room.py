from pydantic import BaseModel
from typing import List
from .rack import RackDetail

class RoomBase(BaseModel):
    name: str

class RoomCreate(RoomBase):
    pass

class RoomResponse(BaseModel):
    status: str
    id: int
    name: str

class RoomDetail(BaseModel):
    id: int
    name: str
    racks: List[RackDetail] = []

    class Config:
        from_attributes = True
