from datetime import datetime
from sqlalchemy import Column, String, DateTime
from app.database.base import Base

class Merchant(Base):
    __tablename__ = "merchants"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    business_type = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
