from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime
from app.database.base import Base

class AgentAction(Base):
    __tablename__ = "agent_actions"

    id = Column(String, primary_key=True, index=True)
    session_id = Column(String, nullable=False, index=True)
    agent = Column(String, nullable=False)  # e.g., BuyerAgent, CheckoutAgent, PolicyEngine
    action = Column(String, nullable=False) # e.g., apply_discount, create_cart
    input_data = Column(Text, nullable=True) # JSON string of inputs
    decision = Column(String, nullable=False) # ALLOWED, BLOCKED, EXECUTED, FAILED
    reason = Column(Text, nullable=True)     # Explanation / error message
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
