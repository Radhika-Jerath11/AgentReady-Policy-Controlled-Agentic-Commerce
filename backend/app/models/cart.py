from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.database.base import Base

class Cart(Base):
    __tablename__ = "carts"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    merchant_id = Column(String, ForeignKey("merchants.id"), nullable=False)
    total_amount = Column(Float, nullable=False, default=0.0)
    discount_amount = Column(Float, nullable=False, default=0.0)
    final_amount = Column(Float, nullable=False, default=0.0)
    status = Column(String, nullable=False, default="ACTIVE") # ACTIVE, CONVERTED, ABANDONED
    created_at = Column(DateTime, default=datetime.utcnow)

    items = relationship("CartItem", back_populates="cart", cascade="all, delete-orphan")

class CartItem(Base):
    __tablename__ = "cart_items"

    id = Column(String, primary_key=True, index=True)
    cart_id = Column(String, ForeignKey("carts.id"), nullable=False)
    product_id = Column(String, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    price = Column(Float, nullable=False)

    cart = relationship("Cart", back_populates="items")
