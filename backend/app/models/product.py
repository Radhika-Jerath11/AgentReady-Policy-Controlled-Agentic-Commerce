from sqlalchemy import Column, String, Float, Integer, ForeignKey, Text
from app.database.base import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(String, primary_key=True, index=True)
    merchant_id = Column(String, ForeignKey("merchants.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String, nullable=False, index=True)
    price = Column(Float, nullable=False)
    stock = Column(Integer, nullable=False, default=0)
    rating = Column(Float, nullable=False, default=4.5)
    delivery_days = Column(Integer, nullable=False, default=3)
    specifications = Column(Text, nullable=True)  # Store JSON string or descriptive text
