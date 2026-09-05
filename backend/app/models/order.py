from datetime import datetime
from sqlalchemy import Column, String, Float, ForeignKey, DateTime
from app.database.base import Base

class Order(Base):
    __tablename__ = "orders"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    merchant_id = Column(String, ForeignKey("merchants.id"), nullable=False)
    cart_id = Column(String, ForeignKey("carts.id"), nullable=False)
    amount = Column(Float, nullable=False)
    status = Column(String, nullable=False, default="CREATED")
    created_at = Column(DateTime, default=datetime.utcnow)
