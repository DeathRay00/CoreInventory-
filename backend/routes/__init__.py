from routes.auth import router as auth_router
from routes.products import router as products_router
from routes.warehouses import router as warehouses_router

__all__ = ["auth_router", "products_router", "warehouses_router"]
