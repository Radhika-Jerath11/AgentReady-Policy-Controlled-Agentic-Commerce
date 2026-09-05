from typing import Dict, Any, Tuple
from sqlalchemy.orm import Session
from app.models.product import Product
from app.policy.policy_engine import PolicyEngine

def check_inventory(db: Session, product_id: str, quantity: int = 1) -> Dict[str, Any]:
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p:
        return {"available": False, "stock": 0, "message": "Product not found"}
    
    is_available = p.stock >= quantity
    return {
        "product_id": p.id,
        "name": p.name,
        "requested_quantity": quantity,
        "current_stock": p.stock,
        "available": is_available,
        "message": f"Stock is sufficient ({p.stock} available)" if is_available else f"Out of stock. Only {p.stock} units left."
    }

def reserve_inventory(
    db: Session,
    policy_engine: PolicyEngine,
    session_id: str,
    merchant_id: str,
    product_id: str,
    quantity: int = 1
) -> Dict[str, Any]:
    allowed, reason = policy_engine.check_and_authorize(
        session_id=session_id,
        agent_name="InventoryAgent",
        merchant_id=merchant_id,
        action="reserve_inventory",
        input_data={"product_id": product_id, "quantity": quantity}
    )
    if not allowed:
        return {"success": False, "reserved": False, "reason": reason}

    p = db.query(Product).filter(Product.id == product_id).first()
    if not p or p.stock < quantity:
        return {
            "success": False,
            "reserved": False,
            "reason": f"Insufficient stock for {p.name if p else 'product'}. Stock: {p.stock if p else 0}"
        }

    p.stock -= quantity
    db.commit()

    return {
        "success": True,
        "reserved": True,
        "product_id": p.id,
        "reserved_quantity": quantity,
        "remaining_stock": p.stock,
        "reason": "Inventory reserved successfully."
    }
