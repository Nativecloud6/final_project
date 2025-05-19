from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from ..controllers.ip_controller import (
    create_ip_range,
    allocate_ip,
    release_ip,
    getIPInformationByIP,
    getIPInformationByMachine,
    getIPInformationByIPRange
)
from ..schemas.database import get_dc_db
from ..schemas.ip import (
    IPRangeCreate,
    IPAllocateRequest,
    IPReleaseRequest,
    IPRangeResponse,
    IPAssignmentResponse,
    IPInfoResponse
)

router = APIRouter(prefix="/api/ips", tags=["ips"])

@router.post("", response_model=IPRangeResponse)
def post_create_range(
    payload: IPRangeCreate,
    db: Session = Depends(get_dc_db)
):
    rec = create_ip_range(db, payload)
    return {
        "status": "success",
        "id": rec.id,
        "cidr": rec.cidr,
    }

@router.post("/allocate", response_model=IPAssignmentResponse)
def post_allocate(
    payload: IPAllocateRequest,
    db: Session = Depends(get_dc_db)
):
    rec = allocate_ip(db, payload.range_id)
    return {
        "status":    "success",
        "id":        rec.id,
        "ip":        rec.ip,
        "range_id":  rec.range_id,
        "assigned":  rec.assigned.isoformat() if hasattr(rec, "assigned") else rec.assigned,
        "released":  rec.released.isoformat() if getattr(rec, "released", None) else None,
    }

@router.post("/release", response_model=IPAssignmentResponse)
def post_release(
    payload: IPReleaseRequest,
    db: Session = Depends(get_dc_db)
):
    rec = release_ip(db, payload.ip)
    return {
        "status":    "success",
        "id":        rec.id,
        "ip":        rec.ip,
        "range_id":  rec.range_id,
        "assigned":  rec.assigned.isoformat() if hasattr(rec, "assigned") else rec.assigned,
        "released":  rec.released.isoformat() if getattr(rec, "released", None) else rec.released,
    }


@router.get("/ip/{ip_address}", response_model=IPInfoResponse)
def get_ipInfo(
    ip_address: str,
    db: Session = Depends(get_dc_db)
):
    return getIPInformationByIP(db, ip_address)

@router.get("/ip/{machine_id}", response_model=IPInfoResponse)
def get_ipInfo(
    machine_id: int,
    db: Session = Depends(get_dc_db)
):
    return getIPInformationByMachine(db, machine_id)

@router.get("/ip/{ip_range_id}", response_model=IPInfoResponse)
def get_ipInfo(
    ip_range_id: int,
    db: Session = Depends(get_dc_db)
):
    return getIPInformationByIPRange(db, ip_range_id)

