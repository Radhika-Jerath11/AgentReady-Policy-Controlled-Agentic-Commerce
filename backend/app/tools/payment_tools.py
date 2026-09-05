import uuid
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.order import Order
from app.models.payment import Payment
from app.policy.policy_engine import PolicyEngine

def create_payment(
    db: Session,
    policy_engine: PolicyEngine,
    session_id: str,
    order_id: str,
    human_approved: bool = False,
    simulate_failure: bool = False
) -> Dict[str, Any]:
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        return {"success": False, "reason": "Order not found"}

    # Policy Engine evaluation for human payment approval gate
    allowed, reason = policy_engine.check_and_authorize(
        session_id=session_id,
        agent_name="PaymentAgent",
        merchant_id=order.merchant_id,
        action="create_payment",
        input_data={"order_id": order_id, "amount": order.amount, "human_approved": human_approved}
    )
    if not allowed:
        return {"success": False, "payment": None, "reason": reason}

    payment_id = f"pay_{uuid.uuid4().hex[:10]}"
    rzp_order_id = f"order_rzp_demo_{uuid.uuid4().hex[:8]}"

    if simulate_failure:
        payment = Payment(
            id=payment_id,
            order_id=order.id,
            razorpay_order_id=rzp_order_id,
            razorpay_payment_id=None,
            amount=order.amount,
            status="FAILED"
        )
        order.status = "FAILED"
        db.add(payment)
        db.commit()

        policy_engine.log_execution(
            session_id=session_id,
            agent_name="PaymentAgent",
            action="process_payment",
            input_data={"order_id": order_id, "simulate_failure": True},
            decision="FAILED",
            reason="Payment gateway declined transaction (Simulated Failure)."
        )

        return {
            "success": False,
            "payment_id": payment_id,
            "razorpay_order_id": rzp_order_id,
            "order_id": order.id,
            "status": "FAILED",
            "reason": "Payment declined by issuing bank (Simulated Failure)."
        }

    rzp_payment_id = f"pay_rzp_demo_{uuid.uuid4().hex[:8]}"
    payment = Payment(
        id=payment_id,
        order_id=order.id,
        razorpay_order_id=rzp_order_id,
        razorpay_payment_id=rzp_payment_id,
        amount=order.amount,
        status="AUTHORIZED"
    )
    db.add(payment)
    db.commit()

    return {
        "success": True,
        "payment_id": payment_id,
        "razorpay_order_id": rzp_order_id,
        "razorpay_payment_id": rzp_payment_id,
        "amount": order.amount,
        "status": "AUTHORIZED",
        "reason": "Payment initiated and authorized via Razorpay Test Mode."
    }

def get_payment_status(db: Session, payment_id: str) -> Optional[Dict[str, Any]]:
    p = db.query(Payment).filter(Payment.id == payment_id).first()
    if not p:
        return None
    return {
        "id": p.id,
        "order_id": p.order_id,
        "razorpay_order_id": p.razorpay_order_id,
        "razorpay_payment_id": p.razorpay_payment_id,
        "amount": p.amount,
        "status": p.status,
        "created_at": p.created_at.isoformat()
    }
