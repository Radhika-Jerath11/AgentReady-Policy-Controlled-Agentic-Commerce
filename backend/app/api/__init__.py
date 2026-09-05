from app.api.products import router as products_router
from app.api.agent import router as agent_router
from app.api.orders import router as orders_router
from app.api.payments import router as payments_router
from app.api.merchant import router as merchant_router

__all__ = [
    "products_router",
    "agent_router",
    "orders_router",
    "payments_router",
    "merchant_router",
]
