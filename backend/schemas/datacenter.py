from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from .database import DCBase
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from datetime import datetime
from pydantic import BaseModel
from typing import List
from .room import RoomDetail


class DataCenterBase(BaseModel):
    name: str

class DataCenterCreate(BaseModel):
    name:str

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
# below is what 史昀玉 modified

class DataCenter(DCBase):
    __tablename__ = "data_centers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    rooms = relationship("Room", back_populates="data_center", cascade="all, delete")

class Room(DCBase):
    __tablename__ = "rooms"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    data_center_id = Column(Integer, ForeignKey("data_centers.id"), nullable=False)
    data_center = relationship("DataCenter", back_populates="rooms")
    racks = relationship("Rack", back_populates="room", cascade="all, delete")

class Rack(DCBase):
    __tablename__ = "racks"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    total_units = Column(Integer, nullable=False)
    used_units = Column(Integer, default=0, nullable=False)
    room_id = Column(Integer, ForeignKey("rooms.id"), nullable=False)
    room = relationship("Room", back_populates="racks")
    devices = relationship("Device", back_populates="rack", cascade="all, delete")

class Device(DCBase):
    __tablename__ = "devices"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    model = Column(String, index=True, nullable=True)
    service = Column(String, index=True, nullable=True)
    state = Column(String, default="uninstalled", nullable=False)
    ip_address = Column(String, index=True, nullable=True)
    data_center_id = Column(Integer, ForeignKey("data_centers.id"), nullable=True)
    room_id = Column(Integer, ForeignKey("rooms.id"), nullable=True)
    rack_id = Column(Integer, ForeignKey("racks.id"), nullable=True)
    start_unit = Column(Integer, nullable=True)
    end_unit = Column(Integer, nullable=True)
    rack = relationship("Rack", back_populates="devices")
    
class IPRange(DCBase):
    __tablename__ = "ip_ranges"
    id       = Column(Integer, primary_key=True, index=True)
    dc_id    = Column(Integer, ForeignKey("data_centers.id"), nullable=False)
    cidr     = Column(String, nullable=False)

class IPAssignment(DCBase):
    __tablename__ = "ip_assignments"
    id        = Column(Integer, primary_key=True, index=True)
    ip        = Column(String, nullable=False, unique=True)
    range_id  = Column(Integer, ForeignKey("ip_ranges.id"), nullable=False)
    assigned  = Column(DateTime, default=datetime.utcnow)
    released  = Column(DateTime, nullable=True)
