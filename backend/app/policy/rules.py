from typing import Dict, Any, Tuple
from app.models.policy import MerchantPolicy

def evaluate_action_policy(
    policy: MerchantPolicy,
    action: str,
    kwargs: Dict[str, Any]
) -> Tuple[bool, str]:
    """
    Evaluates whether an action proposed by an AI agent is permitted by the MerchantPolicy.
    Returns (allowed: bool, reason: str).
    """

    # Check action permissions
    if action == "create_cart":
        if not policy.allow_create_cart:
            return False, "Merchant policy restricts AI cart creation."
        
    elif action == "apply_discount":
        if not policy.allow_apply_discount:
            return False, "Merchant policy disallows discount application by AI agent."
        
        discount_percentage = kwargs.get("discount_percentage", 0.0)
        if discount_percentage > policy.max_discount_percentage:
            return (
                False,
                f"Requested discount of {discount_percentage:.1f}% exceeds merchant limit of {policy.max_discount_percentage:.1f}%"
            )

    elif action == "reserve_inventory":
        if not policy.allow_reserve_inventory:
            return False, "Merchant policy does not allow automated inventory reservation."

    elif action == "create_order":
        amount = kwargs.get("amount", 0.0)
        if amount > policy.max_transaction_amount:
            return (
                False,
                f"Order amount ₹{amount:,.2f} exceeds merchant maximum transaction limit of ₹{policy.max_transaction_amount:,.2f}"
            )

    elif action == "refund" or action == "process_refund":
        if not policy.allow_refund:
            return False, "Merchant policy strictly forbids AI agents from processing refunds."

    elif action == "change_shipping" or action == "update_shipping_address":
        if not policy.allow_shipping_change:
            return False, "Merchant policy strictly forbids AI agents from modifying shipping options."

    elif action == "create_payment" or action == "initiate_payment":
        if policy.require_payment_approval and not kwargs.get("human_approved", False):
            return (
                False,
                "Merchant policy requires explicit human approval before payment initiation."
            )

    return True, "Action compliant with merchant policy rules."
