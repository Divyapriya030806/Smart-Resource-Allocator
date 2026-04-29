from pydantic import BaseModel
from typing import Optional

class JobCreate(BaseModel):
    name: str
    cpu_required: int
    mem_required: int
    priority: int = 1
    duration_ms: int = 1000

class AllocateRequest(BaseModel):
    job_id: int

class ServerOut(BaseModel):
    id: int
    name: str
    ip_address: Optional[str]
    cpu_capacity: int
    mem_capacity: int
    current_cpu: float
    current_mem: float
    weight: int
    status: str
    class Config:
        from_attributes = True

class JobOut(BaseModel):
    id: int
    name: str
    cpu_required: int
    mem_required: int
    priority: int
    duration_ms: int
    status: str
    class Config:
        from_attributes = True
