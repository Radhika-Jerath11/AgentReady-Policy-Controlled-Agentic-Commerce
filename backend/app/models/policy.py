from sqlalchemy import Column, String, Float, Boolean, ForeignKey
from app.database.base import Base

class MerchantPolicy(Base):
    __tablename__ = "merchant_policies"

    id = Column(String, primary_key=True, index=True)
    merchant_id = Column(String, ForeignKey("merchants.id"), nullable=False, unique=True)
    max_transaction_amount = Column(Float, nullable=False, default=25000.0)
    max_discount_percentage = Column(Float, nullable=False, default=10.0)
    allow_create_cart = Column(Boolean, nullable=False, default=True)
    allow_apply_discount = Column(Boolean, nullable=False, default=True)
    allow_reserve_inventory = Column(Boolean, nullable=False, default=True)
    allow_refund = Column(Boolean, nullable=False, default=False)
    allow_shipping_change = Column(Boolean, nullable=False, default=False)
    require_payment_approval = Column(Boolean, nullable=False, default=True)
