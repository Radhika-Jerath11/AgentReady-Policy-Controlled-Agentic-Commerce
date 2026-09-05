from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.agents.orchestrator import Orchestrator
from app.models.agent_action import AgentAction

router = APIRouter(prefix="/agent", tags=["Agent"])

class ChatRequest(BaseModel):
    prompt: str
    session_id: Optional[str] = None
    merchant_id: Optional[str] = "merch_runpro_1"
    requested_discount_pct: Optional[float] = 10.0

class PolicyTestRequest(BaseModel):
    session_id: Optional[str] = None
    discount_percentage: float = 20.0  # Default test value exceeding 10% limit

@router.post("/chat")
def process_agent_chat(req: ChatRequest, db: Session = Depends(get_db)):
    orchestrator = Orchestrator(db)
    res = orchestrator.process_shopping_request(
        prompt=req.prompt,
        session_id=req.session_id,
        merchant_id=req.merchant_id,
        requested_discount_pct=req.requested_discount_pct
    )
    return res

@router.post("/test-policy-violation")
def test_policy_violation(req: PolicyTestRequest, db: Session = Depends(get_db)):
    """
    Safety Demo Endpoint:
    Triggers an agent attempt to apply a discount exceeding the merchant limit (e.g. 20% vs 10%).
    Returns the BLOCKED policy engine response and demonstrates recovery.
    """
    orchestrator = Orchestrator(db)
    prompt = "I need running shoes under ₹5,000 with maximum discount."
    res = orchestrator.process_shopping_request(
        prompt=prompt,
        session_id=req.session_id,
        requested_discount_pct=req.discount_percentage
    )
    res["is_safety_demo"] = True
    res["policy_violation_tested"] = f"Requested {req.discount_percentage}% discount (Merchant Max: 10%)"
    return res

@router.post("/test-out-of-stock")
def test_out_of_stock(db: Session = Depends(get_db)):
    """
    Failure Demo Endpoint:
    Forces the top recommended product (e.g., Nike Pegasus) to stock=0 and triggers out-of-stock recovery flow.
    """
    from app.models.product import Product
    # Temporarily set Nike Pegasus stock to 0
    nike = db.query(Product).filter(Product.name.ilike("%Nike Pegasus%")).first()
    target_id = nike.id if nike else "prod_nike_1"
    
    orchestrator = Orchestrator(db)
    res = orchestrator.process_shopping_request(
        prompt="I need running shoes under ₹5,000 for daily running and delivery within 3 days.",
        force_out_of_stock_product_id=target_id
    )
    res["is_failure_demo"] = True
    res["out_of_stock_product_tested"] = nike.name if nike else "Nike Pegasus"
    return res

@router.get("/actions/{session_id}")
def get_session_actions(session_id: str, db: Session = Depends(get_db)):
    actions = db.query(AgentAction).filter(AgentAction.session_id == session_id).order_by(AgentAction.timestamp.asc()).all()
    results = []
    for a in actions:
        results.append({
            "id": a.id,
            "session_id": a.session_id,
            "agent": a.agent,
            "action": a.action,
            "input_data": a.input_data,
            "decision": a.decision,
            "reason": a.reason,
            "timestamp": a.timestamp.isoformat()
        })
    return results

@router.get("/audit-logs")
def get_all_audit_logs(limit: int = 100, db: Session = Depends(get_db)):
    actions = db.query(AgentAction).order_by(AgentAction.timestamp.desc()).limit(limit).all()
    results = []
    for a in actions:
        results.append({
            "id": a.id,
            "session_id": a.session_id,
            "agent": a.agent,
            "action": a.action,
            "input_data": a.input_data,
            "decision": a.decision,
            "reason": a.reason,
            "timestamp": a.timestamp.isoformat()
        })
    return results
