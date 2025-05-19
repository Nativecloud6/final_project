from fastapi import HTTPException
from sqlalchemy.orm import Session
from ..schemas.ip import IPRangeCreate, IPAllocateRequest
from ..schemas import ip
from ..schemas.datacenter import Device
import ipaddress
from datetime import datetime
# from ..services.ip_service import create_range, allocate_ip as svc_allocate, release_ip as svc_release

def create_ip_range(db: Session, payload: IPRangeCreate):
    return create_range(db, payload.dc_id, payload.cidr)

def allocate_ip(db: Session, payload: IPAllocateRequest):
    return svc_allocate(db, payload.range_id, payload.device_id)

def release_ip(db: Session, ip: str):
    return svc_release(db, ip)

def getIPInformationByIP(db: Session, ip_address: str):
    ip_adrs = db.query(ip.IP).filter(ip.IP.ip == ip_address).first()
    return {
        "id": ip_adrs.id,
        "ip": ip_adrs.ip,
        "range_id": ip_adrs.range_id,
        "assigned": ip_adrs.assigned,
        "released": ip_adrs.released
    }

def getIPInformationByMachine(db: Session, machine_id: int):
    device = db.query(Device).filter(Device.id == machine_id).first()
    ip_adrs = db.query(ip.IP).filter(ip.IP.ip == device.ip_address).first()
    return {
        "id": ip_adrs.id,
        "ip": ip_adrs.ip,
        "range_id": ip_adrs.range_id,
        "assigned": ip_adrs.assigned,
        "released": ip_adrs.released
    }

def getIPInformationByIPRange(db: Session, ip_range_id: int):
    ips = db.query(ip.IP).filter(ip.IP.range_id == ip_range_id).all()
    ip_count = db.query(ip.IP).filter(ip.IP.range_id == ip_range_id).count()
    ipss = [
        {
        "id": ip_adrs.id,
        "ip": ip_adrs.ip,
        "range_id": ip_adrs.range_id,
        "assigned": ip_adrs.assigned,
        "released": ip_adrs.released
        } for ip_adrs in ips
    ]
    return {
        "count": ip_count,
        "ips": ipss
    }

def create_range(db: Session, dc_id: int, cidr: str):
    subnet = db.query(ip.ip_range).filter(ip.ip_range.cidr == cidr).first()
    if subnet:# if subnet already exists
        return {
            "message": f"Subnet {cidr} already exists.",
            "id": subnet.id,
            "cidr":subnet.cidr
        }
    else:#if subnet does not exists
        new_subnet = ip.ip_range(dc_id=dc_id, cidr=cidr)
        db.add(new_subnet)
        db.commit()
        return {
            "message": f"New subnet {cidr} is created.",
            "id": new_subnet.id,
            "cidr": cidr
        }

def svc_allocate(db: Session, range_id: int, device_id: int):
    device = db.query(Device).filter(device.id == device_id).first()
    ip_range = db.query(ip.ip_range).filter(ip.ip_range.id == range_id).first()
    if not ip_range:
        raise HTTPException(status_code=404, detail=f"IP range with ID {range_id} does not exist, please create the IP range first.")
        #return {
        #    "message": f"IP range with ID {range_id} does not exist, please create the IP range first.",
        #    "ip": None,
        #    "id": None,
        #    "ip_range": range_id,
        #    "assigned": None,
        #    "released": None
        #}
    if device: # device found
        if device.ip_address is not None:
            raise HTTPException(status_code=400, detail=f"Device {device_id} is allocated with {device.ip_address}, please release the IP before allocating another.")
            #return {
            #"message": f"Device {device_id} is allocated with {device.ip_address}, please release the IP before allocating another.",
            #"ip": device.ip_address,
            #"id": None,
            #"ip_range": range_id,
            #"assigned": None,
            #"released": None
            #}
        else:
            #find ip within range that is not assigned
            #if no ip in database that is not assigned
            #add another ip that is not in database and in range
            network = ipaddress.ip_network(ip_range.cidr)
            existing_ip = db.query(ip.IP).filter(ip.IP.range_id == range_id).filter(ip.IP.released is not None).first()
            if existing_ip:#there are ips within ip_range available in database, released is not none means it's been released and is available
                existing_ip.assigned = str(datetime.now())
                existing_ip.released = None # if released is none, it's assigned
                device.ip_address = existing_ip.ip
                db.commit()
                return {
                    "message": f"IP {existing_ip.ip} is allocated to device {device.id}",
                    "ip": existing_ip.ip,
                    "id": existing_ip.id,
                    "ip_range": range_id,
                    "assigned": existing_ip.assigned,
                    "released": existing_ip.released
                }
            else:#add another ip that is not in database and in ip_range
                existing_ips = {ip.ip for ip in db.query(ip.IP).filter(ip.IP.range_id == range_id).all()}
                for candidate_ip in network.hosts():
                    if ip_str not in existing_ips:
                        ip_str = str(candidate_ip)
                        new_ip = ip.IP(
                            ip=ip_str,
                            range_id=range_id,
                            assigned=str(datetime.now()),
                            released=None
                        )
                        db.add(new_ip)
                        db.commit()
                        return {
                            "message": f"Created and assigned new IP {ip_str} to {device}",
                            "ip": ip_str,
                            "id": new_ip.id,
                            "ip_range": range_id,
                            "assigned": new_ip.assigned,
                            "released": new_ip.released
                        }
                raise HTTPException(status_code=404, detail=f"No IP is available within this IP range, please consider expanding subnets.")
                #return {
                #    "message": f"No IP is available within this IP range, please consider expanding subnets.",
                #    "ip": None,
                #    "id": None,
                #    "ip_range": range_id,
                #    "assigned": None,
                #    "released": None
                #}
    else:
        raise HTTPException(status_code=404, detail=f"Device with ID {device_id} not found.")
        #return {
        #    "message": f"Device with ID {device_id} does not exist.",
        #    "ip": None,
        #    "id": None,
        #    "ip_range": range_id,
        #    "assigned": None,
        #    "released": None
        #}
        

def svc_release(db: Session, ip_address: str):
    ip_adrs = db.query(ip.IP).filter(ip.IP.ip == ip_address).first()
    if not ip_adrs:
        raise HTTPException(status_code=404, detail="IP not found")
    device = db.query(Device).filter(Device.ip_address == ip_address).first()
    device.ip_address = None
    #ip_adrs.assigned = ip_adrs.assigned not changed until next allocation
    ip_adrs.released = str(datetime.now())
    db.commit()
    return {
        "message": f"Released IP {ip_address}",
        "ip": ip_address,
        "id": ip_adrs.id,
        "ip_range": ip_adrs.range_id,
        "assigned": ip_adrs.assigned,
        "released": ip_adrs.released
    }
