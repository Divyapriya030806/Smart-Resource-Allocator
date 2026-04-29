import random
import asyncio
from datetime import datetime
from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import get_db, engine
import models, schemas
from algorithms import greedy, scheduler, ml_predictor

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Smart Resource Allocation Framework")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Servers ──────────────────────────────────────────────────────────────────

@app.get("/api/servers")
def get_servers(db: Session = Depends(get_db)):
    servers = db.query(models.Server).all()
    result = []
    for s in servers:
        result.append({
            "id": s.id, "name": s.name, "ip_address": s.ip_address,
            "cpu_capacity": s.cpu_capacity, "mem_capacity": s.mem_capacity,
            "current_cpu": s.current_cpu, "current_mem": s.current_mem,
            "weight": s.weight, "status": s.status
        })
    return result

# ── Jobs ─────────────────────────────────────────────────────────────────────

@app.get("/api/jobs")
def get_jobs(db: Session = Depends(get_db)):
    jobs = db.query(models.Job).all()
    return [{"id": j.id, "name": j.name, "cpu_required": j.cpu_required,
             "mem_required": j.mem_required, "priority": j.priority,
             "duration_ms": j.duration_ms, "status": j.status} for j in jobs]

@app.post("/api/jobs")
def create_job(job: schemas.JobCreate, db: Session = Depends(get_db)):
    db_job = models.Job(**job.dict())
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return {"id": db_job.id, "name": db_job.name, "status": db_job.status}

# ── Allocate ──────────────────────────────────────────────────────────────────

@app.post("/api/allocate")
def allocate_job(req: schemas.AllocateRequest, db: Session = Depends(get_db)):
    job = db.query(models.Job).filter(models.Job.id == req.job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    servers = db.query(models.Server).filter(models.Server.status == "active").all()
    result = greedy.greedy_allocate(job, servers)

    if not result:
        raise HTTPException(status_code=400, detail="No server has enough capacity")

    alloc = models.Allocation(job_id=job.id, server_id=result["server_id"],
                              algorithm_used=result["algorithm"])
    db.add(alloc)

    server = db.query(models.Server).filter(models.Server.id == result["server_id"]).first()
    server.current_cpu = min(server.cpu_capacity, server.current_cpu + job.cpu_required)
    server.current_mem = min(server.mem_capacity, server.current_mem + job.mem_required)
    job.status = "allocated"

    db.commit()
    return result

# ── Allocations ───────────────────────────────────────────────────────────────

@app.get("/api/allocations")
def get_allocations(db: Session = Depends(get_db)):
    allocs = db.query(models.Allocation).all()
    result = []
    for a in allocs:
        job = db.query(models.Job).filter(models.Job.id == a.job_id).first()
        srv = db.query(models.Server).filter(models.Server.id == a.server_id).first()
        result.append({
            "id": a.id,
            "job_name": job.name if job else "N/A",
            "server_name": srv.name if srv else "N/A",
            "algorithm_used": a.algorithm_used,
            "allocated_at": str(a.allocated_at)
        })
    return result

# ── Schedule ──────────────────────────────────────────────────────────────────

@app.get("/api/schedule")
def get_schedule(algorithm: str = "RR", db: Session = Depends(get_db)):
    jobs = db.query(models.Job).all()
    job_list = [{"id": j.id, "name": j.name, "cpu_required": j.cpu_required,
                 "mem_required": j.mem_required, "priority": j.priority,
                 "duration_ms": j.duration_ms} for j in jobs]
    return scheduler.run_scheduling(job_list, algorithm=algorithm)

# ── Predict ───────────────────────────────────────────────────────────────────

@app.get("/api/predict/{server_id}")
def predict_load(server_id: int, db: Session = Depends(get_db)):
    server = db.query(models.Server).filter(models.Server.id == server_id).first()
    if not server:
        raise HTTPException(status_code=404, detail="Server not found")
    predictions = ml_predictor.predict(server_id)
    trend = "stable"
    if predictions[-1]["cpu_predicted"] > predictions[0]["cpu_predicted"] + 10:
        trend = "increasing"
    elif predictions[-1]["cpu_predicted"] < predictions[0]["cpu_predicted"] - 10:
        trend = "decreasing"
    return {"server_name": server.name, "predictions": predictions, "trend": trend}

# ── Metrics ───────────────────────────────────────────────────────────────────

@app.get("/api/metrics")
def get_metrics(db: Session = Depends(get_db)):
    metrics = db.query(models.Metric).order_by(models.Metric.id.desc()).limit(40).all()
    return [{"id": m.id, "server_id": m.server_id, "cpu_percent": m.cpu_percent,
             "mem_percent": m.mem_percent, "recorded_at": str(m.recorded_at)} for m in metrics]

# ── Health ────────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "OK", "timestamp": str(datetime.now())}

# ── WebSocket ─────────────────────────────────────────────────────────────────

active_connections = []

@app.websocket("/ws/live")
async def websocket_live(websocket: WebSocket, db: Session = Depends(get_db)):
    await websocket.accept()
    active_connections.append(websocket)
    try:
        servers = db.query(models.Server).all()
        while True:
            for s in servers:
                cpu = round(random.uniform(10, 90), 1)
                mem = round(random.uniform(15, 85), 1)

                metric = models.Metric(server_id=s.id, cpu_percent=cpu, mem_percent=mem)
                db.add(metric)
                s.current_cpu = cpu
                s.current_mem = mem
            db.commit()

            for s in servers:
                data = {
                    "server_id": s.id,
                    "name": s.name,
                    "cpu_percent": s.current_cpu,
                    "mem_percent": s.current_mem,
                    "timestamp": datetime.now().strftime("%H:%M:%S")
                }
                await websocket.send_json(data)
            await asyncio.sleep(3)
    except WebSocketDisconnect:
        active_connections.remove(websocket)
    except Exception:
        if websocket in active_connections:
            active_connections.remove(websocket)
