from pydantic import BaseModel
from sqlalchemy import Column, Integer, String, DateTime 
from .database import DCBase
from datetime import datetime
from typing import List

class IPRangeCreate(BaseModel):
    dc_id: int
    cidr: str

class IPAllocateRequest(BaseModel):
    range_id: int
    device_id: int

class IPReleaseRequest(BaseModel):
    ip: str

class IPRangeResponse(BaseModel):
    status: str
    id: int
    cidr: str

class IPAssignmentResponse(BaseModel):
    status: str
    id: int
    ip: str
    range_id: int
    assigned: str
    released: str | None

#below is modified by 陳靖霖

class IPInfoResponse(BaseModel):
    id: int
    ip: str
    range_id: int
    assigned: str
    released: str | None

class IPListResponse(BaseModel):
    count: int
    ips: List[IPInfoResponse]
    

class IP(DCBase):
    __tablename__ = "ip_assignments"

    id = Column(Integer, primary_key=True, index=True)
    ip = Column(String, unique=True, index=True, nullable=False)
    range_id = Column(String, nullable=False)
    assigned = Column(DateTime, default=datetime.now())
    released = Column(DateTime, default=datetime.now())
    #=====
    #status = Column(String, default="available")
    #assigned_to = Column(String, nullable=True)
    #service = Column(String, nullable=True) 

class ip_range(DCBase):
    __tablename__ = "ip_ranges"

    id = Column(Integer, primary_key=True, index=True)
    dc_id =  Column(Integer, nullable=False)
    cidr = Column(String, unique=True, index=True, nullable=False)