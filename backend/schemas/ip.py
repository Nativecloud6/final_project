from pydantic import BaseModel

class IPRangeCreate(BaseModel):
    dc_id: int
    cidr: str

class IPAllocateRequest(BaseModel):
    range_id: int

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

