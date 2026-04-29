# Smart Resource Allocation Framework (SRAF)

**Stack:** React + FastAPI + MySQL + Docker Compose  
**Algorithms:** ML (RandomForest), OS Scheduling (RR/SJF/FCFS/Priority), Greedy Best-Fit Knapsack, DBMS (SQLAlchemy)

---

## ▶ Run Locally with Docker

### Prerequisites
- Docker Desktop installed and running
- Git (optional)

### Steps

```bash
# 1. Unzip the project folder
# 2. Open CMD / Terminal inside the folder

cd smart-resource-allocator

# 3. Build and start all 3 containers
docker-compose up --build

# First run takes ~3-5 minutes (downloads images, installs deps)
```

### Access the app
| Service  | URL                        |
|----------|----------------------------|
| Frontend | http://localhost:3000       |
| Backend  | http://localhost:8000       |
| API Docs | http://localhost:8000/docs  |
| MySQL    | localhost:3306              |

### Stop the app
```bash
docker-compose down
# To also delete the database volume:
docker-compose down -v
```

---

## ☁ Deploy on Render

Render does NOT support docker-compose directly.  
Deploy each service separately as below.

### Step 1 — Push to GitHub
```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/YOUR_USERNAME/smart-resource-allocator.git
git push -u origin main
```

### Step 2 — Create MySQL Database on Render
1. Go to https://render.com → New → **PostgreSQL** (Render has no MySQL — use PlanetScale or Railway for MySQL)
2. **Recommended:** Use https://railway.app → New Project → MySQL → copy the connection string

### Step 3 — Deploy Backend on Render
1. Render → New → **Web Service**
2. Connect your GitHub repo
3. Set **Root Directory:** `backend`
4. **Runtime:** Docker
5. **Environment Variables:**
   ```
   DB_HOST      = <your MySQL host from Railway>
   DB_PORT      = 3306
   DB_NAME      = resource_db
   DB_USER      = root
   DB_PASSWORD  = <your password>
   ```
6. Click **Deploy** — note the backend URL (e.g. `https://sraf-backend.onrender.com`)

### Step 4 — Update Frontend API URL
Before deploying frontend, edit `frontend/src/api.js`:
```js
baseURL: 'https://sraf-backend.onrender.com/api'
```
And edit `frontend/nginx.conf` — replace `http://backend:8000` with your Render backend URL.

### Step 5 — Deploy Frontend on Render
1. Render → New → **Web Service**
2. Connect same repo
3. **Root Directory:** `frontend`
4. **Runtime:** Docker
5. Click **Deploy**

---

## 📁 Project Structure
```
smart-resource-allocator/
├── docker-compose.yml
├── database/init.sql
├── backend/
│   ├── Dockerfile
│   ├── main.py          ← FastAPI + WebSocket
│   ├── models.py        ← SQLAlchemy ORM
│   ├── schemas.py       ← Pydantic
│   ├── database.py      ← DB connection + retry
│   └── algorithms/
│       ├── greedy.py        ← Best-Fit Knapsack
│       ├── scheduler.py     ← RR, SJF, FCFS, Priority
│       └── ml_predictor.py  ← RandomForest prediction
└── frontend/
    ├── Dockerfile       ← Multi-stage: Node → Nginx
    ├── nginx.conf
    └── src/
        ├── components/Dashboard.jsx
        ├── components/Allocator.jsx
        ├── components/SchedulerPanel.jsx
        └── components/Predictions.jsx
```

## 🔌 API Endpoints
| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/servers | All servers + live load |
| GET | /api/jobs | All jobs |
| POST | /api/jobs | Create a job |
| POST | /api/allocate | Greedy allocate a job |
| GET | /api/allocations | Allocation history |
| GET | /api/schedule?algorithm=RR | OS scheduling simulation |
| GET | /api/predict/{server_id} | ML load forecast |
| GET | /api/metrics | Recent server metrics |
| WS | /ws/live | Real-time metrics stream |
