from sqlalchemy import Column, Integer, String, Float, ForeignKey, TIMESTAMP
from sqlalchemy.sql import func
from database import Base

class Server(Base):
    __tablename__ = "servers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    ip_address = Column(String(50))
    cpu_capacity = Column(Integer, default=100)
    mem_capacity = Column(Integer, default=100)
    current_cpu = Column(Float, default=0)
    current_mem = Column(Float, default=0)
    weight = Column(Integer, default=1)
    status = Column(String(20), default="active")
    created_at = Column(TIMESTAMP, server_default=func.now())

class Job(Base):
    __tablename__ = "jobs"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    cpu_required = Column(Integer)
    mem_required = Column(Integer)
    priority = Column(Integer, default=1)
    duration_ms = Column(Integer, default=1000)
    status = Column(String(20), default="pending")
    created_at = Column(TIMESTAMP, server_default=func.now())

class Allocation(Base):
    __tablename__ = "allocations"
    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"))
    server_id = Column(Integer, ForeignKey("servers.id"))
    algorithm_used = Column(String(50), default="Greedy Knapsack")
    allocated_at = Column(TIMESTAMP, server_default=func.now())

class Metric(Base):
    __tablename__ = "metrics"
    id = Column(Integer, primary_key=True, index=True)
    server_id = Column(Integer, ForeignKey("servers.id"))
    cpu_percent = Column(Float)
    mem_percent = Column(Float)
    recorded_at = Column(TIMESTAMP, server_default=func.now())
