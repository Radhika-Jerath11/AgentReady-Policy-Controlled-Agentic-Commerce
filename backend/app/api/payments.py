from typing import Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.policy.policy_engine import PolicyEngine
from app.tools.payment_tools import create_payment, get_payment_status
from app.payments.razorpay import razorpay_client
from app.payments.webhook import process_razorpay_webhook
from app.models.payment import Payment
from app.models.order import Order

router = APIRouter(prefix="/payments", tags=["Payments"])

class PaymentCreateRequest(BaseModel):
    order_id: str
    session_id: str
    human_approved: bool = True
    simulate_failure: bool = False

class PaymentVerifyRequest(BaseModel):
    payment_id: str
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: Optional[str] = "demo_signature"
    session_id: str

@router.post("/create")
def initiate_payment(req: PaymentCreateRequest, db: Session = Depends(get_db)):
    policy_engine = PolicyEngine(db)
    res = create_payment(
        db=db,
        policy_engine=policy_engine,
        session_id=req.session_id,
        order_id=req.order_id,
        human_approved=req.human_approved,
        simulate_failure=req.simulate_failure
    )
    if not res["success"]:
        raise HTTPException(status_code=400, detail=res.get("reason", "Payment creation failed"))

    # Generate Razorpay order details
    rzp_order = razorpay_client.create_razorpay_order(
        amount_in_inr=res["amount"],
        receipt_id=req.order_id
    )
    res["razorpay_order"] = rzp_order
    return res

@router.get("/{payment_id}")
def fetch_payment(payment_id: str, db: Session = Depends(get_db)):
    pay = get_payment_status(db, payment_id)
    if not pay:
        raise HTTPException(status_code=404, detail="Payment not found")
    return pay

@router.post("/verify")
def verify_payment(req: PaymentVerifyRequest, db: Session = Depends(get_db)):
    """
    Backend payment verification endpoint.
    Verifies signature and transitions order status to CONFIRMED.
    """
    is_valid = razorpay_client.verify_payment_signature(
        razorpay_order_id=req.razorpay_order_id,
        razorpay_payment_id=req.razorpay_payment_id,
        razorpay_signature=req.razorpay_signature or "demo"
    )

    if not is_valid:
        raise HTTPException(status_code=400, detail="Invalid payment signature verification failed")

    policy_engine = PolicyEngine(db)
    
    # Process verification in DB
    payment = db.query(Payment).filter(Payment.id == req.payment_id).first()
    if not payment:
        payment = db.query(Payment).filter(Payment.razorpay_order_id == req.razorpay_order_id).first()
    
    if payment:
        payment.status = "CAPTURED"
        payment.razorpay_payment_id = req.razorpay_payment_id
        order = db.query(Order).filter(Order.id == payment.order_id).first()
        if order:
            order.status = "CONFIRMED"
        db.commit()

        policy_engine.log_execution(
            session_id=req.session_id,
            agent_name="BackendVerifier",
            action="verify_payment",
            input_data={"payment_id": req.payment_id, "razorpay_order_id": req.razorpay_order_id},
            decision="ALLOWED",
            reason=f"Payment verified on backend. Order #{order.id if order else ''} CONFIRMED."
        )

        return {
            "success": True,
            "order_status": "CONFIRMED",
            "payment_status": "CAPTURED",
            "message": "Payment verified and order confirmed successfully!"
        }
    
    raise HTTPException(status_code=404, detail="Payment record not found")

@router.post("/simulate-failure")
def simulate_payment_failure(req: PaymentCreateRequest, db: Session = Depends(get_db)):
    """
    Failure Demo Endpoint:
    Simulates a payment decline/failure from issuing bank.
    Keeps order in FAILED state without duplicate payment.
    """
    req.simulate_failure = True
    return initiate_payment(req, db)

@router.post("/webhooks/razorpay")
async def razorpay_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Razorpay Webhook Callback handler.
    Processes asynchronous payment status notifications from Razorpay gateway.
    """
    try:
        body = await request.json()
    except Exception:
        body = {}

    policy_engine = PolicyEngine(db)
    success, message = process_razorpay_webhook(
        db=db,
        policy_engine=policy_engine,
        payload=body,
        session_id=body.get("session_id", "webhook_session")
    )

    return {"status": "ok" if success else "failed", "detail": message}
