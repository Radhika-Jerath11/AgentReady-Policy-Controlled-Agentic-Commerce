import uuid
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.policy.policy_engine import PolicyEngine
from app.agents.buyer_agent import BuyerAgent
from app.agents.checkout_agent import CheckoutAgent
from app.models.merchant import Merchant
from app.models.user import User

class Orchestrator:
    """
    Main Agent Orchestrator: Manages session trajectory, executes steps,
    formats real-time timeline actions, handles policy violations and out-of-stock fallbacks.
    """
    def __init__(self, db: Session):
        self.db = db
        self.policy_engine = PolicyEngine(db)
        self.buyer_agent = BuyerAgent(db)
        self.checkout_agent = CheckoutAgent(db, self.policy_engine)

    def process_shopping_request(
        self,
        prompt: str,
        session_id: Optional[str] = None,
        user_id: Optional[str] = "demo_user_1",
        merchant_id: Optional[str] = "merch_runpro_1",
        requested_discount_pct: float = 10.0,
        force_out_of_stock_product_id: Optional[str] = None
    ) -> Dict[str, Any]:
        if not session_id:
            session_id = f"sess_{uuid.uuid4().hex[:8]}"

        # Ensure demo user & merchant exist
        merchant = self.db.query(Merchant).filter(Merchant.id == merchant_id).first()
        if not merchant:
            merchant = Merchant(id=merchant_id, name="RunPro Sports", business_type="Sports & Fitness")
            self.db.add(merchant)
            self.db.commit()

        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            user = User(id=user_id, name="Demo Buyer", email="buyer@example.com")
            self.db.add(user)
            self.db.commit()

        timeline: List[Dict[str, Any]] = []

        def add_step(icon: str, title: str, status: str, detail: str):
            timeline.append({
                "icon": icon,
                "title": title,
                "status": status, # pending, running, success, blocked, failed
                "detail": detail
            })

        # Step 1: 🧠 Understanding request
        add_step("🧠", "Understanding request", "success", "Extracted intent: Category, budget, delivery & purpose constraints.")
        self.policy_engine.log_execution(
            session_id=session_id,
            agent_name="BuyerAgent",
            action="understand_request",
            input_data={"prompt": prompt},
            decision="EXECUTED",
            reason="Natural language request parsed successfully."
        )

        intent = self.buyer_agent.extract_intent(prompt)

        # Step 2: 🔎 Searching products
        add_step("🔎", "Searching products", "success", f"Querying catalogue for '{intent['category']}' under ₹{intent['max_price']:,.0f}.")
        self.policy_engine.log_execution(
            session_id=session_id,
            agent_name="BuyerAgent",
            action="search_products",
            input_data=intent,
            decision="EXECUTED",
            reason=f"Catalog searched with category '{intent['category']}'."
        )

        res = self.buyer_agent.search_and_compare(intent)
        matching = res["matching_products"]
        selected_product = res["selected_product"]

        # Step 3: 📊 Comparing products
        if matching:
            names = ", ".join([p["name"] for p in matching[:3]])
            add_step("📊", "Comparing products", "success", f"Evaluated top candidates: {names}.")
            self.policy_engine.log_execution(
                session_id=session_id,
                agent_name="BuyerAgent",
                action="compare_products",
                input_data={"product_ids": [p["id"] for p in matching]},
                decision="EXECUTED",
                reason=f"Compared {len(matching)} candidates by price, rating, and stock."
            )
        else:
            add_step("📊", "Comparing products", "failed", "No products matched the exact filters.")

        if not selected_product:
            return {
                "session_id": session_id,
                "timeline": timeline,
                "message": "No matching products found in catalog.",
                "selected_product": None
            }

        target_product_id = force_out_of_stock_product_id if force_out_of_stock_product_id else selected_product["id"]

        # Step 4: 📦 Checking inventory
        from app.models.product import Product
        prod_obj = self.db.query(Product).filter(Product.id == target_product_id).first()
        
        if not prod_obj or prod_obj.stock <= 0:
            add_step("📦", "Checking inventory", "failed", f"Product '{selected_product['name']}' is OUT OF STOCK.")
            self.policy_engine.log_execution(
                session_id=session_id,
                agent_name="InventoryAgent",
                action="check_inventory",
                input_data={"product_id": target_product_id},
                decision="FAILED",
                reason="Stock count is 0."
            )

            # Recovery logic: Select alternative product
            alternatives = [p for p in matching if p["id"] != target_product_id and p["stock"] > 0]
            if alternatives:
                recovered_product = alternatives[0]
                add_step("📦", "Inventory Recovery", "success", f"Auto-recovering: Switching to available alternative '{recovered_product['name']}' (Stock: {recovered_product['stock']}).")
                selected_product = recovered_product
                target_product_id = recovered_product["id"]
                self.policy_engine.log_execution(
                    session_id=session_id,
                    agent_name="Orchestrator",
                    action="recover_out_of_stock",
                    input_data={"original": force_out_of_stock_product_id, "replacement": target_product_id},
                    decision="EXECUTED",
                    reason=f"Recovered out-of-stock scenario by selecting {selected_product['name']}."
                )
            else:
                return {
                    "session_id": session_id,
                    "timeline": timeline,
                    "message": "Selected product and alternatives are out of stock.",
                    "out_of_stock_recovery": False
                }
        else:
            add_step("📦", "Checking inventory", "success", f"Stock verified for {selected_product['name']} ({prod_obj.stock} units available).")
            self.policy_engine.log_execution(
                session_id=session_id,
                agent_name="InventoryAgent",
                action="check_inventory",
                input_data={"product_id": target_product_id},
                decision="ALLOWED",
                reason=f"{prod_obj.stock} units available in stock."
            )

        # Step 5: 🛡️ Checking merchant policy
        add_step("🛡️", "Checking merchant policy", "success", f"Evaluating RunPro Sports limits (Max TX ₹25,000, Max Discount 10%).")

        # Step 6: 💰 Calculating discount & testing Policy Engine
        discount_policy_allowed, discount_reason = self.policy_engine.check_and_authorize(
            session_id=session_id,
            agent_name="CheckoutAgent",
            merchant_id=merchant_id,
            action="apply_discount",
            input_data={"discount_percentage": requested_discount_pct, "amount": selected_product["price"]}
        )

        if not discount_policy_allowed:
            add_step("💰", "Calculating discount", "blocked", f"BLOCKED: {discount_reason}")
            # Recovery: Auto-adjust to merchant maximum (10%)
            applicable_discount_pct = 10.0
            add_step("💰", "Policy Violation Recovery", "success", f"Policy Recovery: Automatically capping discount at maximum allowed limit of {applicable_discount_pct}%.")
            self.policy_engine.log_execution(
                session_id=session_id,
                agent_name="Orchestrator",
                action="recover_policy_violation",
                input_data={"requested_discount": requested_discount_pct, "capped_discount": applicable_discount_pct},
                decision="EXECUTED",
                reason=f"Capped requested discount from {requested_discount_pct}% down to merchant maximum of {applicable_discount_pct}%."
            )
        else:
            applicable_discount_pct = requested_discount_pct
            add_step("💰", "Calculating discount", "success", f"Applied compliant {applicable_discount_pct}% discount.")

        # Execute full checkout flow
        checkout_res = self.checkout_agent.execute_checkout_flow(
            session_id=session_id,
            user_id=user_id,
            merchant_id=merchant_id,
            product_id=target_product_id,
            requested_discount_pct=applicable_discount_pct,
            quantity=1
        )

        if not checkout_res["success"]:
            add_step("🛒", "Creating cart", "failed", checkout_res.get("error", "Cart creation failed"))
            return {
                "session_id": session_id,
                "timeline": timeline,
                "error": checkout_res.get("error")
            }

        # Step 7: 🛒 Creating cart
        add_step("🛒", "Creating cart", "success", f"Cart #{checkout_res['cart_id']} created. Items added.")

        # Step 8: 📋 Creating order
        add_step("📋", "Creating order", "success", f"Order #{checkout_res['order_id']} created in PAYMENT_PENDING state.")

        # Step 9: ⏸️ Waiting for payment approval
        add_step("⏸️", "Waiting for payment approval", "pending", "Order ready for human payment approval gate.")

        # Step 10: 💳 Payment (Pending human action)
        add_step("💳", "Payment", "pending", "Awaiting human approval before Razorpay payment initiation.")

        # Step 11: 🔔 Webhook received
        add_step("🔔", "Webhook received", "pending", "Awaiting Razorpay payment callback.")

        # Step 12: ✅ Payment verified
        add_step("✅", "Payment verified", "pending", "Awaiting payment verification.")

        original_price = selected_product["price"]
        discount_amt = round(original_price * (applicable_discount_pct / 100.0), 2)
        final_price = round(original_price - discount_amt, 2)

        return {
            "session_id": session_id,
            "timeline": timeline,
            "selected_product": selected_product,
            "matching_products": matching,
            "order_summary": {
                "order_id": checkout_res["order_id"],
                "cart_id": checkout_res["cart_id"],
                "product_name": selected_product["name"],
                "original_price": original_price,
                "discount_percentage": applicable_discount_pct,
                "discount_amount": discount_amt,
                "final_amount": final_price,
                "delivery_days": selected_product["delivery_days"],
                "status": "PAYMENT_PENDING",
                "requires_human_approval": True
            }
        }
