import uuid
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.config import settings
from app.database.connection import engine, SessionLocal
from app.database.base import Base
from app.models.merchant import Merchant
from app.models.policy import MerchantPolicy
from app.models.product import Product
from app.models.user import User

from app.api import (
    products_router,
    agent_router,
    orders_router,
    payments_router,
    merchant_router,
)

def seed_database():
    """Seeds database with initial RunPro Sports merchant data and products."""
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    try:
        # Seed Merchant: RunPro Sports
        merchant_id = "merch_runpro_1"
        merchant = db.query(Merchant).filter(Merchant.id == merchant_id).first()
        if not merchant:
            merchant = Merchant(
                id=merchant_id,
                name="RunPro Sports",
                business_type="Sports & Fitness"
            )
            db.add(merchant)

        # Seed Merchant Policy
        policy = db.query(MerchantPolicy).filter(MerchantPolicy.merchant_id == merchant_id).first()
        if not policy:
            policy = MerchantPolicy(
                id="pol_runpro_1",
                merchant_id=merchant_id,
                max_transaction_amount=25000.0,
                max_discount_percentage=10.0,
                allow_create_cart=True,
                allow_apply_discount=True,
                allow_reserve_inventory=True,
                allow_refund=False,
                allow_shipping_change=False,
                require_payment_approval=True
            )
            db.add(policy)

        # Seed User
        user = db.query(User).filter(User.id == "demo_user_1").first()
        if not user:
            user = User(
                id="demo_user_1",
                name="Demo Buyer",
                email="buyer@runpro.com"
            )
            db.add(user)

        # Seed Products (at least 9 products)
        existing_count = db.query(Product).count()
        if existing_count == 0:
            products_data = [
                {
                    "id": "prod_nike_1",
                    "merchant_id": merchant_id,
                    "name": "Nike Pegasus 40",
                    "description": "Responsive daily running shoe with dual Zoom Air units and engineered mesh upper.",
                    "category": "Running shoes",
                    "price": 4799.0,
                    "stock": 12,
                    "rating": 4.6,
                    "delivery_days": 2,
                    "specifications": "Weight: 288g | Drop: 10mm | Neutral support"
                },
                {
                    "id": "prod_asics_1",
                    "merchant_id": merchant_id,
                    "name": "ASICS Gel-Nimbus 25",
                    "description": "Maximum cushion neutral running shoe with PureGEL technology for plush comfort.",
                    "category": "Running shoes",
                    "price": 4499.0,
                    "stock": 8,
                    "rating": 4.5,
                    "delivery_days": 3,
                    "specifications": "Weight: 290g | Drop: 8mm | Max Cushioning"
                },
                {
                    "id": "prod_adidas_1",
                    "merchant_id": merchant_id,
                    "name": "Adidas Ultraboost Light",
                    "description": "Lightweight high-performance running shoe with Light BOOST cushioning.",
                    "category": "Running shoes",
                    "price": 7999.0,
                    "stock": 6,
                    "rating": 4.7,
                    "delivery_days": 4,
                    "specifications": "Weight: 262g | Drop: 10mm | Primeknit upper"
                },
                {
                    "id": "prod_puma_1",
                    "merchant_id": merchant_id,
                    "name": "Puma Velocity Nitro 2",
                    "description": "All-in-one neutral running shoe for any distance with NITRO foam responsiveness.",
                    "category": "Running shoes",
                    "price": 4299.0,
                    "stock": 15,
                    "rating": 4.4,
                    "delivery_days": 2,
                    "specifications": "Weight: 257g | Drop: 8mm | PUMAGRIP rubber"
                },
                {
                    "id": "prod_nike_2",
                    "merchant_id": merchant_id,
                    "name": "Nike ZoomX Vaporfly NEXT% 3",
                    "description": "Elite marathon racing shoe with full-length carbon fiber flyplate.",
                    "category": "Running shoes",
                    "price": 18500.0,
                    "stock": 3,
                    "rating": 4.8,
                    "delivery_days": 3,
                    "specifications": "Weight: 198g | Drop: 8mm | Carbon Plate"
                },
                {
                    "id": "prod_ua_1",
                    "merchant_id": merchant_id,
                    "name": "Under Armour Charged Impulse",
                    "description": "Flexible and lightweight training shoes built for gym workouts and light runs.",
                    "category": "Training shoes",
                    "price": 3899.0,
                    "stock": 20,
                    "rating": 4.3,
                    "delivery_days": 2,
                    "specifications": "Weight: 227g | Drop: 8mm | Breathable upper"
                },
                {
                    "id": "prod_reebok_1",
                    "merchant_id": merchant_id,
                    "name": "Reebok Nano X3",
                    "description": "Cross-training shoe featuring Lift and Run chassis system for ultimate stability.",
                    "category": "Training shoes",
                    "price": 6499.0,
                    "stock": 10,
                    "rating": 4.5,
                    "delivery_days": 3,
                    "specifications": "Weight: 340g | Drop: 7mm | Flexweave upper"
                },
                {
                    "id": "prod_band_1",
                    "merchant_id": merchant_id,
                    "name": "RunPro Fitness Smart Band 5",
                    "description": "Activity tracker with heart rate monitoring, GPS tracking, and 14-day battery life.",
                    "category": "Fitness accessories",
                    "price": 1999.0,
                    "stock": 25,
                    "rating": 4.2,
                    "delivery_days": 2,
                    "specifications": "Display: 1.12\" AMOLED | Water resistance: 5ATM"
                },
                {
                    "id": "prod_kit_1",
                    "merchant_id": merchant_id,
                    "name": "RunPro Speed Rope & Mat Kit",
                    "description": "High-speed ball bearing jump rope paired with non-slip 6mm TPE exercise mat.",
                    "category": "Fitness accessories",
                    "price": 999.0,
                    "stock": 30,
                    "rating": 4.1,
                    "delivery_days": 1,
                    "specifications": "Rope Length: 3m adjustable | Mat size: 183x61cm"
                }
            ]
            for pd in products_data:
                db.add(Product(**pd))

        db.commit()
    finally:
        db.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    seed_database()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="AgentReady - Policy-controlled agentic commerce platform",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products_router, prefix=settings.API_PREFIX)
app.include_router(agent_router, prefix=settings.API_PREFIX)
app.include_router(orders_router, prefix=settings.API_PREFIX)
app.include_router(payments_router, prefix=settings.API_PREFIX)
app.include_router(merchant_router, prefix=settings.API_PREFIX)

@app.get("/")
def root():
    return {
        "status": "online",
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "demo_mode": settings.DEMO_MODE,
        "merchant": "RunPro Sports"
    }
