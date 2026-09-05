import uuid
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.cart import Cart
from app.models.order import Order
from app.policy.policy_engine import PolicyEngine

def create_order(
    db: Session,
    policy_engine: PolicyEngine,
    session_id: str,
    cart_id: str
) -> Dict[str, Any]:
    cart = db.query(Cart).filter(Cart.id == cart_id).first()
    if not cart:
        return {"success": False, "reason": "Cart not found"}

    allowed, reason = policy_engine.check_and_authorize(
        session_id=session_id,
        agent_name="OrderAgent",
        merchant_id=cart.merchant_id,
        action="create_order",
        input_data={"cart_id": cart_id, "amount": cart.final_amount}
    )
    if not allowed:
        return {"success": False, "order": None, "reason": reason}

    order_id = f"ord_{uuid.uuid4().hex[:10]}"
    order = Order(
        id=order_id,
        user_id=cart.user_id,
        merchant_id=cart.merchant_id,
        cart_id=cart.id,
        amount=cart.final_amount,
        status="PAYMENT_PENDING"
    )
    cart.status = "CONVERTED"
    db.add(order)
    db.commit()

    return {
        "success": True,
        "order_id": order.id,
        "user_id": order.user_id,
        "merchant_id": order.merchant_id,
        "cart_id": order.cart_id,
        "amount": order.amount,
        "status": order.status,
        "requires_human_approval": True,
        "reason": "Order created in PAYMENT_PENDING state, awaiting human approval before payment."
    }

def get_order_details(db: Session, order_id: str) -> Optional[Dict[str, Any]]:
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        return None
    return {
        "id": order.id,
        "user_id": order.user_id,
        "merchant_id": order.merchant_id,
        "cart_id": order.cart_id,
        "amount": order.amount,
        "status": order.status,
        "created_at": order.created_at.isoformat()
    }
