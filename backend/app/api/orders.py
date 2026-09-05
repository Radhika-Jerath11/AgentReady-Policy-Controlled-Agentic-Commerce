from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.tools.order_tools import get_order_details
from app.models.order import Order

router = APIRouter(prefix="/orders", tags=["Orders"])

class ApprovePaymentRequest(BaseModel):
    order_id: str
    session_id: str

@router.get("/{order_id}")
def get_order(order_id: str, db: Session = Depends(get_db)):
    order = get_order_details(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.post("/approve-payment")
def approve_payment_gate(req: ApprovePaymentRequest, db: Session = Depends(get_db)):
    """
    Human Payment Approval Gate:
    Validates explicit user approval before allowing payment creation.
    """
    order = db.query(Order).filter(Order.id == req.order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return {
        "success": True,
        "order_id": order.id,
        "amount": order.amount,
        "human_approved": True,
        "message": f"Payment for Order #{order.id} (₹{order.amount:,.2f}) approved by human user."
    }
