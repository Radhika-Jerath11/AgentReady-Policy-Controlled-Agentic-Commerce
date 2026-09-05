from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.models.policy import MerchantPolicy
from app.models.merchant import Merchant
from app.tools.cart_tools import get_merchant_policy

router = APIRouter(prefix="/merchant", tags=["Merchant"])

class PolicyUpdateRequest(BaseModel):
    max_transaction_amount: float
    max_discount_percentage: float
    allow_create_cart: bool
    allow_apply_discount: bool
    allow_reserve_inventory: bool
    allow_refund: bool
    allow_shipping_change: bool
    require_payment_approval: bool

@router.get("/policy")
def fetch_policy(merchant_id: str = "merch_runpro_1", db: Session = Depends(get_db)):
    policy = get_merchant_policy(db, merchant_id)
    if not policy:
        raise HTTPException(status_code=404, detail="Merchant policy not found")
    return policy

@router.put("/policy")
def update_policy(
    req: PolicyUpdateRequest,
    merchant_id: str = "merch_runpro_1",
    db: Session = Depends(get_db)
):
    pol = db.query(MerchantPolicy).filter(MerchantPolicy.merchant_id == merchant_id).first()
    if not pol:
        raise HTTPException(status_code=404, detail="Merchant policy not found")

    pol.max_transaction_amount = req.max_transaction_amount
    pol.max_discount_percentage = req.max_discount_percentage
    pol.allow_create_cart = req.allow_create_cart
    pol.allow_apply_discount = req.allow_apply_discount
    pol.allow_reserve_inventory = req.allow_reserve_inventory
    pol.allow_refund = req.allow_refund
    pol.allow_shipping_change = req.allow_shipping_change
    pol.require_payment_approval = req.require_payment_approval

    db.commit()
    return get_merchant_policy(db, merchant_id)
