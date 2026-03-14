# CoreInventory — Changes Made & How to Run

## Changes Made

### 1. Backend Dependencies ([requirements.txt](file:///c:/Users/amaln/OneDrive/Desktop/CoreInventory-/backend/requirements.txt))
- Upgraded `pydantic` from `<2.0.0` to `>=2.0` (Pydantic v2)
- Added `pydantic-settings` (BaseSettings moved to separate package in v2)
- Added `asyncpg` (PostgreSQL async driver — was missing)
- Added `psycopg2-binary` (needed by Alembic for sync migrations)
- Pinned `bcrypt==4.0.1` (avoids passlib compatibility issues)

### 2. Pydantic v2 Migration
- **[config.py](file:///c:/Users/amaln/OneDrive/Desktop/CoreInventory-/backend/config.py)** — `from pydantic import BaseSettings` → `from pydantic_settings import BaseSettings`, replaced inner `Config` class with `model_config = ConfigDict(...)`
- **All 5 schema files** — replaced `class Config: orm_mode = True` with `model_config = ConfigDict(from_attributes=True)` in:
  - [schemas/user.py](file:///c:/Users/amaln/OneDrive/Desktop/CoreInventory-/backend/schemas/user.py), [schemas/product.py](file:///c:/Users/amaln/OneDrive/Desktop/CoreInventory-/backend/schemas/product.py), [schemas/warehouse.py](file:///c:/Users/amaln/OneDrive/Desktop/CoreInventory-/backend/schemas/warehouse.py), [schemas/operations.py](file:///c:/Users/amaln/OneDrive/Desktop/CoreInventory-/backend/schemas/operations.py), [schemas/inventory.py](file:///c:/Users/amaln/OneDrive/Desktop/CoreInventory-/backend/schemas/inventory.py)

### 3. Receipt/Delivery Item Loading
- **[models/receipt.py](file:///c:/Users/amaln/OneDrive/Desktop/CoreInventory-/backend/models/receipt.py)** — added `relationship("ReceiptItem")` with `lazy="selectin"` so receipt items are automatically loaded
- **[models/delivery.py](file:///c:/Users/amaln/OneDrive/Desktop/CoreInventory-/backend/models/delivery.py)** — added `relationship("DeliveryItem")` with `lazy="selectin"` so delivery items are automatically loaded

### 4. Docker Configuration
- **[docker-compose.yml](file:///c:/Users/amaln/OneDrive/Desktop/CoreInventory-/docker-compose.yml)** — fixed backend port from `8008:8000` to `8000:8000`
- **[.env](file:///c:/Users/amaln/OneDrive/Desktop/CoreInventory-/.env)** — created with proper Docker-compatible defaults

---

## How to Run (Step by Step)

### Prerequisites
- **Docker Desktop** installed and running ([download here](https://www.docker.com/products/docker-desktop/))

### Steps

**1. Open PowerShell and navigate to the project:**
```powershell
cd "c:\Users\amaln\OneDrive\Desktop\CoreInventory-"
```

**2. Build and start everything:**
```powershell
docker compose up --build -d
```
> First run takes ~5-10 mins (downloading images + building).

**3. Check all containers are running:**
```powershell
docker compose ps
```
You should see 4 containers (postgres, redis, backend, frontend) all healthy/running.

**4. Access the application:**

| Service | URL |
|---|---|
| **Frontend** | http://localhost:3000 |
| **Backend API** | http://localhost:8000 |
| **Swagger Docs** | http://localhost:8000/docs |
| **Health Check** | http://localhost:8000/health |

**5. Create your first user** (via Swagger or PowerShell):
```powershell
Invoke-RestMethod -Uri "http://localhost:8000/api/v1/auth/register" -Method POST -ContentType "application/json" -Body '{"name": "Admin", "email": "admin@company.com", "password": "Admin@123", "role": "inventory_manager"}'
```

**6. Login at the frontend:** http://localhost:3000 with email `admin@company.com` and password `Admin@123`

### Stopping
```powershell
docker compose down        # stop, keep data
docker compose down -v     # stop and wipe database
```

### Troubleshooting
| Issue | Fix |
|---|---|
| Port 5432 in use | Stop local PostgreSQL or change port in [docker-compose.yml](file:///c:/Users/amaln/OneDrive/Desktop/CoreInventory-/docker-compose.yml) |
| Port 3000 in use | Change `"3000:80"` to e.g. `"3001:80"` in [docker-compose.yml](file:///c:/Users/amaln/OneDrive/Desktop/CoreInventory-/docker-compose.yml) |
| Backend crashes | Run `docker compose logs backend` |
| Frontend not loading | Run `docker compose logs frontend` |
