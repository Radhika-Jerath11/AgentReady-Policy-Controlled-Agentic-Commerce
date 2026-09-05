from typing import Dict, Any, Tuple
from sqlalchemy.orm import Session
from app.models.payment import Payment
from app.models.order import Order
from app.policy.policy_engine import PolicyEngine

def process_razorpay_webhook(
    db: Session,
    policy_engine: PolicyEngine,
    payload: Dict[str, Any],
    session_id: str = "webhook_session"
) -> Tuple[bool, str]:
    event = payload.get("event", "")
    payment_entity = payload.get("payload", {}).get("payment", {}).get("entity", {})
    
    rzp_order_id = payment_entity.get("order_id") or payload.get("razorpay_order_id")
    rzp_payment_id = payment_entity.get("id") or payload.get("razorpay_payment_id")
    
    if not rzp_order_id:
        return False, "Missing razorpay_order_id in webhook payload"

    payment = db.query(Payment).filter(Payment.razorpay_order_id == rzp_order_id).first()
    if not payment:
        return False, f"Payment record not found for razorpay_order_id: {rzp_order_id}"

    order = db.query(Order).filter(Order.id == payment.order_id).first()
    if not order:
        return False, f"Order not found for ID: {payment.order_id}"

    if event == "payment.captured" or payload.get("status") == "captured" or payload.get("status") == "success":
        payment.status = "CAPTURED"
        payment.razorpay_payment_id = rzp_payment_id
        order.status = "CONFIRMED"
        db.commit()

        policy_engine.log_execution(
            session_id=session_id,
            agent_name="WebhookHandler",
            action="verify_payment",
            input_data={"event": event, "rzp_order_id": rzp_order_id, "rzp_payment_id": rzp_payment_id},
            decision="ALLOWED",
            reason=f"Payment verified successfully. Order {order.id} status updated to CONFIRMED."
        )
        return True, f"Order {order.id} confirmed successfully via webhook."

    elif event == "payment.failed" or payload.get("status") == "failed":
        payment.status = "FAILED"
        order.status = "FAILED"
        db.commit()

        policy_engine.log_execution(
            session_id=session_id,
            agent_name="WebhookHandler",
            action="process_failed_webhook",
            input_data={"event": event, "rzp_order_id": rzp_order_id},
            decision="FAILED",
            reason=f"Payment failure event received. Order {order.id} marked as FAILED."
        )
        return False, f"Payment failed for Order {order.id}."

    return True, f"Webhook event '{event}' processed."
