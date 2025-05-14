from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from datetime import datetime

class DataCenter(Base):
    __tablename__ = "data_centers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    rooms = relationship("Room", back_populates="data_center", cascade="all, delete")

class Room(Base):
    __tablename__ = "rooms"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    data_center_id = Column(Integer, ForeignKey("data_centers.id"), nullable=False)
    data_center = relationship("DataCenter", back_populates="rooms")
    racks = relationship("Rack", back_populates="room", cascade="all, delete")

class Rack(Base):
    __tablename__ = "racks"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    total_units = Column(Integer, nullable=False)
    used_units = Column(Integer, default=0, nullable=False)
    room_id = Column(Integer, ForeignKey("rooms.id"), nullable=False)
    room = relationship("Room", back_populates="racks")
    devices = relationship("Device", back_populates="rack", cascade="all, delete")

class Device(Base):
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
    
class IPRange(Base):
    __tablename__ = "ip_ranges"
    id       = Column(Integer, primary_key=True, index=True)
    dc_id    = Column(Integer, ForeignKey("data_centers.id"), nullable=False)
    cidr     = Column(String, nullable=False)

class IPAssignment(Base):
    __tablename__ = "ip_assignments"
    id        = Column(Integer, primary_key=True, index=True)
    ip        = Column(String, nullable=False, unique=True)
    range_id  = Column(Integer, ForeignKey("ip_ranges.id"), nullable=False)
    assigned  = Column(DateTime, default=datetime.utcnow)
    released  = Column(DateTime, nullable=True)
