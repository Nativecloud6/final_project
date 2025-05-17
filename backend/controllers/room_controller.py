from sqlalchemy.orm import Session
from fastapi import HTTPException
from ..schemas import datacenter

def create_data_center(db: Session, dc: datacenter.DataCenterCreate):
    db_dc = datacenter.DataCenter(name=dc.name)
    db.add(db_dc)
    db.commit()
    db.refresh(db_dc)
    return db_dc

def get_data_centers(db: Session):
    return db.query(datacenter.DataCenter).all()

def delete_data_center(db: Session, dc_id: int):
    dc = db.query(datacenter.DataCenter).filter(datacenter.DataCenter.id == dc_id).first()
    if not dc:
        raise HTTPException(status_code=404, detail="DataCenter not found")
    db.delete(dc)
    db.commit()
    return {"status": "success", "message": "Deleted successfully"}

