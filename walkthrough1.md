# CoreInventory — Complete Setup & Run Guide

## What Is CoreInventory?

A full-stack **Enterprise Inventory Management System** with:
- **Backend:** Python 3.11 · FastAPI · PostgreSQL · Redis · JWT Auth
- **Frontend:** React 18 · Vite · Recharts · Lucide Icons
- **Infra:** Docker Compose (4 containers)

```mermaid
graph LR
    Browser -->|:3000| Nginx[Frontend - Nginx]
    Nginx -->|/api/*| Backend[Backend - FastAPI]
    Backend --> Postgres[(PostgreSQL)]
    Backend --> Redis[(Redis)]
```

---

## 🆕 Fresh System Setup (New PC)

### Step 1 — Install Prerequisites

| Software | Download | Why |
|---|---|---|
| **Docker Desktop** | [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/) | Runs all containers |
| **Git** | [git-scm.com](https://git-scm.com/) | Clone the repo |

> [!IMPORTANT]
> After installing Docker Desktop, **open it and let it finish starting** before proceeding. You should see "Docker Desktop is running" in the system tray.

### Step 2 — Clone the Repository

```powershell
git clone https://github.com/DeathRay00/CoreInventory-.git
cd CoreInventory-
```

### Step 3 — Create the [.env](file:///c:/Users/amaln/OneDrive/Desktop/CoreInventory-/.env) File

Create a file called [.env](file:///c:/Users/amaln/OneDrive/Desktop/CoreInventory-/.env) in the project root with:

```env
DATABASE_URL=postgresql+asyncpg://coreinventory:strongpassword123@postgres:5432/coreinventory
REDIS_URL=redis://redis:6379
JWT_SECRET_KEY=super-secret-jwt-key-change-in-production-2026
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
RATE_LIMIT_LOGIN=5/minute
RATE_LIMIT_RESET=3/minute
ENVIRONMENT=development
POSTGRES_USER=coreinventory
POSTGRES_PASSWORD=strongpassword123
POSTGRES_DB=coreinventory
```

> [!TIP]
> For production, change `JWT_SECRET_KEY` to a long random string and set a strong `POSTGRES_PASSWORD`.

### Step 4 — Build & Start

```powershell
docker compose up --build -d
```

First run downloads images and builds containers (~5–10 minutes on a fresh system).

### Step 5 — Verify Everything Is Running

```powershell
docker compose ps
```

You should see **4 containers** all `running` / `healthy`:

| Container | Port | Purpose |
|---|---|---|
| `ci_postgres` | 5432 | Database |
| `ci_redis` | 6379 | Cache & rate limiting |
| `ci_backend` | 8000 | FastAPI server |
| `ci_frontend` | 3000 | React app (Nginx) |

### Step 6 — Seed Sample Data (Optional)

```powershell
docker compose exec backend python seed_data.py
```

This creates **4 users, 8 categories, 4 warehouses, 24 locations, 28 products**, plus sample receipts, deliveries, transfers, and adjustments.

### Step 7 — Open the App

| Page | URL |
|---|---|
| **Frontend** | http://localhost:3000 |
| **API Docs (Swagger)** | http://localhost:8000/docs |
| **Health Check** | http://localhost:8000/health |

---

## 🔄 Running on an Existing System (Already Set Up)

If the project is already cloned and [.env](file:///c:/Users/amaln/OneDrive/Desktop/CoreInventory-/.env) exists:

### Start

```powershell
cd CoreInventory-
docker compose up -d
```

> No `--build` needed unless you changed code. Starts in ~5 seconds.

### Stop

```powershell
docker compose down
```

### Restart After Code Changes

```powershell
docker compose up --build -d backend    # rebuild only backend
docker compose up --build -d frontend   # rebuild only frontend
docker compose up --build -d            # rebuild everything
```

### Reset Database (Fresh Start)

```powershell
docker compose down -v                  # deletes all data
docker compose up --build -d            # start fresh
docker compose exec backend python seed_data.py   # re-seed
```

### View Logs

```powershell
docker compose logs backend --tail 50    # last 50 lines
docker compose logs backend -f           # live stream (Ctrl+C to exit)
docker compose logs                      # all containers
```

---

## 🔐 Login Credentials

After running [seed_data.py](file:///c:/Users/amaln/OneDrive/Desktop/CoreInventory-/backend/seed_data.py):

| Role | Email | Password |
|---|---|---|
| **Manager** | `amal@company.com` | `Admin@123` |
| **Manager** | `sneha@company.com` | `Admin@123` |
| **Staff** | `priya@company.com` | `Staff@123` |
| **Staff** | `rahul@company.com` | `Staff@123` |

Or register a new user via Swagger:

```powershell
Invoke-RestMethod -Uri "http://localhost:8000/api/v1/auth/register" `
  -Method POST -ContentType "application/json" `
  -Body '{"name":"Your Name","email":"you@company.com","password":"YourPass@123","role":"inventory_manager"}'
```

---

## 📱 Features & Pages

### Manager Role
| Page | What It Does |
|---|---|
| **Dashboard** | KPI cards, bar chart (pending ops), pie chart (stock health) |
| **Products** | CRUD products with SKU, category, reorder level |
| **Categories** | Create/list product categories |
| **Warehouses** | Manage warehouse locations |
| **Locations** | Rack/zone management per warehouse |
| **Stock** | Live inventory levels with low-stock warnings |
| **Movement History** | Immutable audit trail of all stock changes |
| **Settings** | Account info & role permissions |

### Staff Role
| Page | What It Does |
|---|---|
| **Receipts** | Log incoming goods from suppliers, validate to add stock |
| **Deliveries** | Log outgoing goods to customers, validate to deduct stock |
| **Transfers** | Move stock between warehouses |
| **Adjustments** | Correct stock for damage/audit/expiry |
| **Stock** | View current stock levels |

---

## 🛠 Troubleshooting

| Problem | Solution |
|---|---|
| `port 5432 already in use` | Stop local PostgreSQL: `net stop postgresql-x64-16` or change port in [docker-compose.yml](file:///c:/Users/amaln/OneDrive/Desktop/CoreInventory-/docker-compose.yml) |
| `port 3000 already in use` | Change `"3000:80"` → `"3001:80"` in [docker-compose.yml](file:///c:/Users/amaln/OneDrive/Desktop/CoreInventory-/docker-compose.yml) |
| `port 8000 already in use` | Change `"8000:8000"` → `"8001:8000"` in [docker-compose.yml](file:///c:/Users/amaln/OneDrive/Desktop/CoreInventory-/docker-compose.yml) |
| Backend crashes on startup | `docker compose logs backend` — look for import/config errors |
| Frontend shows blank page | `docker compose logs frontend` — check for build errors |
| `request validation failed` | The API rejected a parameter — check Swagger docs for allowed values |
| Cannot login after `docker compose down -v` | Database was wiped — re-register or re-run [seed_data.py](file:///c:/Users/amaln/OneDrive/Desktop/CoreInventory-/backend/seed_data.py) |
| Docker Desktop not found | Install Docker Desktop and **start it** before running commands |

---

## 📂 Project Structure

```
CoreInventory-/
├── .env                    # Environment variables (you create this)
├── docker-compose.yml      # Orchestrates all 4 services
├── backend/
│   ├── Dockerfile          # Multi-stage Python build
│   ├── main.py             # FastAPI app entry point
│   ├── config.py           # Settings from .env
│   ├── database.py         # SQLAlchemy async engine
│   ├── seed_data.py        # Sample data seeder
│   ├── requirements.txt    # Python dependencies
│   ├── auth/               # JWT, hashing, role dependencies
│   ├── models/             # 12 SQLAlchemy ORM models
│   ├── schemas/            # Pydantic v2 request/response schemas
│   ├── services/           # Business logic layer
│   ├── routes/             # FastAPI route handlers
│   ├── middleware/          # Logging middleware
│   └── alembic/            # Database migrations
└── frontend/
    ├── Dockerfile          # Multi-stage Node → Nginx build
    ├── nginx.conf          # Reverse proxy + SPA routing
    ├── package.json        # Node dependencies
    ├── vite.config.js      # Dev server config
    └── src/
        ├── main.jsx        # React entry point
        ├── App.jsx         # Router + layout
        ├── index.css       # 680-line premium dark mode CSS
        ├── api/client.js   # Axios API client with JWT interceptor
        ├── context/        # Auth + Notification contexts
        ├── components/     # Sidebar, Navbar, DataTable, Modal, StatsCard
        └── pages/          # 13 page components
```
