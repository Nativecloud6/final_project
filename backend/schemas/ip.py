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
    
