import uuid
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.cart import Cart, CartItem
from app.models.product import Product
from app.models.policy import MerchantPolicy
from app.policy.policy_engine import PolicyEngine

def get_merchant_policy(db: Session, merchant_id: str) -> Dict[str, Any]:
    pol = db.query(MerchantPolicy).filter(MerchantPolicy.merchant_id == merchant_id).first()
    if not pol:
        return {}
    return {
        "merchant_id": pol.merchant_id,
        "max_transaction_amount": pol.max_transaction_amount,
        "max_discount_percentage": pol.max_discount_percentage,
        "allow_create_cart": pol.allow_create_cart,
        "allow_apply_discount": pol.allow_apply_discount,
        "allow_reserve_inventory": pol.allow_reserve_inventory,
        "allow_refund": pol.allow_refund,
        "allow_shipping_change": pol.allow_shipping_change,
        "require_payment_approval": pol.require_payment_approval
    }

def calculate_allowed_discount(
    db: Session,
    policy_engine: PolicyEngine,
    session_id: str,
    merchant_id: str,
    total_amount: float,
    requested_discount_pct: float
) -> Dict[str, Any]:
    """
    Checks requested discount against Policy Engine.
    If requested discount exceeds policy max, returns decision BLOCKED with reason,
    and also calculates the maximum allowed discount amount.
    """
    input_data = {
        "merchant_id": merchant_id,
        "total_amount": total_amount,
        "discount_percentage": requested_discount_pct
    }
    
    allowed, reason = policy_engine.check_and_authorize(
        session_id=session_id,
        agent_name="CheckoutAgent",
        merchant_id=merchant_id,
        action="apply_discount",
        input_data=input_data
    )

    pol = db.query(MerchantPolicy).filter(MerchantPolicy.merchant_id == merchant_id).first()
    max_pct = pol.max_discount_percentage if pol else 10.0
    
    applicable_pct = min(requested_discount_pct, max_pct) if allowed else max_pct
    discount_amount = round(total_amount * (applicable_pct / 100.0), 2)
    final_amount = round(total_amount - discount_amount, 2)

    return {
        "allowed": allowed,
        "requested_pct": requested_discount_pct,
        "approved_pct": applicable_pct if allowed else max_pct,
        "reason": reason,
        "discount_amount": discount_amount,
        "final_amount": final_amount
    }

def create_cart(
    db: Session,
    policy_engine: PolicyEngine,
    session_id: str,
    user_id: str,
    merchant_id: str
) -> Dict[str, Any]:
    allowed, reason = policy_engine.check_and_authorize(
        session_id=session_id,
        agent_name="CartAgent",
        merchant_id=merchant_id,
        action="create_cart",
        input_data={"user_id": user_id, "merchant_id": merchant_id}
    )
    if not allowed:
        return {"success": False, "cart": None, "reason": reason}

    cart_id = f"cart_{uuid.uuid4().hex[:8]}"
    cart = Cart(
        id=cart_id,
        user_id=user_id,
        merchant_id=merchant_id,
        total_amount=0.0,
        discount_amount=0.0,
        final_amount=0.0,
        status="ACTIVE"
    )
    db.add(cart)
    db.commit()

    return {
        "success": True,
        "cart_id": cart.id,
        "user_id": user_id,
        "merchant_id": merchant_id,
        "status": "ACTIVE"
    }

def add_to_cart(
    db: Session,
    cart_id: str,
    product_id: str,
    quantity: int = 1
) -> Dict[str, Any]:
    cart = db.query(Cart).filter(Cart.id == cart_id).first()
    if not cart:
        return {"success": False, "reason": "Cart not found"}
    
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        return {"success": False, "reason": "Product not found"}

    item_id = f"item_{uuid.uuid4().hex[:8]}"
    cart_item = CartItem(
        id=item_id,
        cart_id=cart.id,
        product_id=product.id,
        quantity=quantity,
        price=product.price
    )
    db.add(cart_item)
    
    cart.total_amount += (product.price * quantity)
    cart.final_amount = cart.total_amount - cart.discount_amount
    db.commit()

    return {
        "success": True,
        "cart_id": cart.id,
        "item_id": item_id,
        "product_name": product.name,
        "quantity": quantity,
        "unit_price": product.price,
        "total_amount": cart.total_amount,
        "final_amount": cart.final_amount
    }
