from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.policy.policy_engine import PolicyEngine
from app.tools.inventory_tools import check_inventory, reserve_inventory
from app.tools.cart_tools import calculate_allowed_discount, create_cart, add_to_cart
from app.tools.order_tools import create_order

class CheckoutAgent:
    """
    Checkout Agent: Manages cart building, policy checks, discount application,
    inventory reservation, and order creation.
    """
    def __init__(self, db: Session, policy_engine: PolicyEngine):
        self.db = db
        self.policy_engine = policy_engine

    def execute_checkout_flow(
        self,
        session_id: str,
        user_id: str,
        merchant_id: str,
        product_id: str,
        requested_discount_pct: float = 10.0,
        quantity: int = 1
    ) -> Dict[str, Any]:
        # Step 1: Check Inventory
        inv_check = check_inventory(self.db, product_id, quantity)
        if not inv_check["available"]:
            self.policy_engine.log_execution(
                session_id=session_id,
                agent_name="CheckoutAgent",
                action="check_inventory",
                input_data={"product_id": product_id, "quantity": quantity},
                decision="FAILED",
                reason=inv_check["message"]
            )
            return {
                "success": False,
                "step": "check_inventory",
                "error": inv_check["message"],
                "out_of_stock": True
            }

        self.policy_engine.log_execution(
            session_id=session_id,
            agent_name="CheckoutAgent",
            action="check_inventory",
            input_data={"product_id": product_id, "quantity": quantity},
            decision="ALLOWED",
            reason=inv_check["message"]
        )

        # Step 2: Policy check & calculate discount
        # Note: If requested_discount_pct violates policy, PolicyEngine logs decision BLOCKED
        discount_res = calculate_allowed_discount(
            db=self.db,
            policy_engine=self.policy_engine,
            session_id=session_id,
            merchant_id=merchant_id,
            total_amount=inv_check.get("unit_price", 0.0) or 0.0,
            requested_discount_pct=requested_discount_pct
        )

        # Step 3: Create Cart
        cart_res = create_cart(
            db=self.db,
            policy_engine=self.policy_engine,
            session_id=session_id,
            user_id=user_id,
            merchant_id=merchant_id
        )
        if not cart_res["success"]:
            return {
                "success": False,
                "step": "create_cart",
                "error": cart_res["reason"]
            }

        cart_id = cart_res["cart_id"]

        # Step 4: Add to Cart
        add_res = add_to_cart(self.db, cart_id, product_id, quantity)
        if not add_res["success"]:
            return {
                "success": False,
                "step": "add_to_cart",
                "error": add_res["reason"]
            }

        # Step 5: Recalculate discount based on actual cart total
        total_amount = add_res["total_amount"]
        discount_res = calculate_allowed_discount(
            db=self.db,
            policy_engine=self.policy_engine,
            session_id=session_id,
            merchant_id=merchant_id,
            total_amount=total_amount,
            requested_discount_pct=requested_discount_pct
        )

        # Apply final discount to Cart DB record
        from app.models.cart import Cart
        cart = self.db.query(Cart).filter(Cart.id == cart_id).first()
        cart.discount_amount = discount_res["discount_amount"]
        cart.final_amount = discount_res["final_amount"]
        self.db.commit()

        # Step 6: Reserve Inventory
        res_inv = reserve_inventory(
            db=self.db,
            policy_engine=self.policy_engine,
            session_id=session_id,
            merchant_id=merchant_id,
            product_id=product_id,
            quantity=quantity
        )
        if not res_inv["success"]:
            return {
                "success": False,
                "step": "reserve_inventory",
                "error": res_inv["reason"]
            }

        # Step 7: Create Order
        order_res = create_order(
            db=self.db,
            policy_engine=self.policy_engine,
            session_id=session_id,
            cart_id=cart_id
        )

        return {
            "success": order_res["success"],
            "cart_id": cart_id,
            "order_id": order_res.get("order_id"),
            "total_amount": total_amount,
            "requested_discount_pct": requested_discount_pct,
            "applied_discount_amount": discount_res["discount_amount"],
            "final_amount": discount_res["final_amount"],
            "policy_decision": discount_res["reason"],
            "order_status": order_res.get("status", "PAYMENT_PENDING"),
            "requires_payment_approval": True
        }
