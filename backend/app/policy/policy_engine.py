import json
import uuid
from datetime import datetime
from typing import Dict, Any, Tuple, Optional
from sqlalchemy.orm import Session

from app.models.policy import MerchantPolicy
from app.models.agent_action import AgentAction
from app.policy.rules import evaluate_action_policy

class PolicyEngine:
    """
    Deterministic Policy Engine.
    Enforces merchant policies before any sensitive agent operation executes.
    Logs every policy evaluation to the AgentAction audit log table.
    """

    def __init__(self, db: Session):
        self.db = db

    def check_and_authorize(
        self,
        session_id: str,
        agent_name: str,
        merchant_id: str,
        action: str,
        input_data: Dict[str, Any]
    ) -> Tuple[bool, str]:
        policy = self.db.query(MerchantPolicy).filter(MerchantPolicy.merchant_id == merchant_id).first()
        
        if not policy:
            # Default fallback policy if none configured
            policy = MerchantPolicy(
                id=str(uuid.uuid4()),
                merchant_id=merchant_id,
                max_transaction_amount=25000.0,
                max_discount_percentage=10.0,
                allow_create_cart=True,
                allow_apply_discount=True,
                allow_reserve_inventory=True,
                allow_refund=False,
                allow_shipping_change=False,
                require_payment_approval=True
            )

        allowed, reason = evaluate_action_policy(policy, action, input_data)

        # Record in AgentAction audit log
        audit_entry = AgentAction(
            id=str(uuid.uuid4()),
            session_id=session_id,
            agent=agent_name,
            action=action,
            input_data=json.dumps(input_data),
            decision="ALLOWED" if allowed else "BLOCKED",
            reason=reason,
            timestamp=datetime.utcnow()
        )
        self.db.add(audit_entry)
        self.db.commit()

        return allowed, reason

    def log_execution(
        self,
        session_id: str,
        agent_name: str,
        action: str,
        input_data: Dict[str, Any],
        decision: str,
        reason: str
    ):
        """Helper to log non-policy system actions to audit trail (e.g. search, intent extraction)."""
        audit_entry = AgentAction(
            id=str(uuid.uuid4()),
            session_id=session_id,
            agent=agent_name,
            action=action,
            input_data=json.dumps(input_data),
            decision=decision,
            reason=reason,
            timestamp=datetime.utcnow()
        )
        self.db.add(audit_entry)
        self.db.commit()
