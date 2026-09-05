from datetime import datetime
from sqlalchemy import Column, String, Float, ForeignKey, DateTime
from app.database.base import Base

class Payment(Base):
    __tablename__ = "payments"

    id = Column(String, primary_key=True, index=True)
    order_id = Column(String, ForeignKey("orders.id"), nullable=False)
    razorpay_order_id = Column(String, nullable=True)
    razorpay_payment_id = Column(String, nullable=True)
    amount = Column(Float, nullable=False)
    status = Column(String, nullable=False, default="CREATED")  # CREATED, AUTHORIZED, CAPTURED, FAILED
    created_at = Column(DateTime, default=datetime.utcnow)
