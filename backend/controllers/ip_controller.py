from fastapi import HTTPException
from sqlalchemy.orm import Session
from ..schemas.ip import IPRangeCreate
# from ..services.ip_service import create_range, allocate_ip as svc_allocate, release_ip as svc_release

def create_ip_range(db: Session, payload: IPRangeCreate):
    return create_range(db, payload.dc_id, payload.cidr)

def allocate_ip(db: Session, range_id: int):
    return svc_allocate(db, range_id)

def release_ip(db: Session, ip: str):
    return svc_release(db, ip)


