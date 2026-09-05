# AgentReady — Policy-Controlled Agentic Commerce Platform

**Razorpay AI Buildathon 2026 MVP**

> *"Let AI decide what should happen. Let deterministic systems decide what is allowed to happen."*

AgentReady is a policy-controlled agentic commerce platform designed to enable AI buyer agents to autonomously parse shopping requests, search merchant catalogs, compare products, evaluate inventory, and prepare orders—while strictly enforcing merchant policy constraints and zero-trust human payment approval gates.

---

## 1. Problem Statement

Generative AI chatbots can engage users in open conversation, but giving LLMs direct access to financial transactions or order processing introduces severe risks:
- **Hallucinated Discounts**: AI applying unauthorized 20%-50% price cuts.
- **Uncontrolled Spending**: AI initiating transactions exceeding transaction caps.
- **Accidental Charges**: Autonomous agents triggering payments without human consent.
- **Opaque Actions**: Lack of audit trails for compliance and debugging.

## 2. Solution

AgentReady decouples decision-making (AI Agent) from policy enforcement (Deterministic Policy Engine) and financial execution (Razorpay Payment Gateway with mandatory Human Approval Gate).

```mermaid
flowchart TD
    User([User Prompt]) --> BuyerAgent[Buyer Agent]
    BuyerAgent --> ProductTools[Search & Compare Catalog]
    ProductTools --> PolicyEngine{Deterministic Policy Engine}
    
    subgraph Policy Validation
        PolicyEngine -->|Max TX / Max Discount Check| AuditLog[(AgentAction Audit Log)]
        PolicyEngine -->|Violation (e.g. 20% Discount)| PolicyBlock[BLOCKED + Auto-Cap to 10%]
    end
    
    PolicyBlock --> CheckoutAgent[Checkout Agent]
    PolicyEngine -->|Allowed| CheckoutAgent
    
    CheckoutAgent --> CartOrder[Create Cart & PAYMENT_PENDING Order]
    CartOrder --> HumanApproval{Human Payment Approval Gate}
    
    HumanApproval -->|User Clicks Approve| Razorpay[Razorpay Test Mode Order]
    HumanApproval -->|User Cancels| Cancelled[Order FAILED / Cancelled]
    
    Razorpay --> Webhook[Razorpay Webhook Callback]
    Webhook --> BackendVerify[Backend Signature Verification]
    BackendVerify --> Confirmed[Order Status: CONFIRMED]
```

## 3. Why AgentReady?

1. **Deterministic Business Rules**: Hard constraints in Python code that no prompt injection or model hallucination can bypass.
2. **Human Payment Gate**: AI prepares the cart and order, but financial execution requires explicit user authorization.
3. **Immutable Audit Trail**: Every tool call, prompt parsing step, policy block, and verification event is recorded in the `agent_actions` database table.
4. **Resilient Failure Recovery**: Auto-recovers from out-of-stock inventory and policy violations by selecting next-best compliant alternatives.
5. **Zero-Dependency Demo Mode**: Works out of the box with zero external API keys required, while supporting real OpenAI and Razorpay Test Mode keys when configured in `.env`.

---

## 4. Architecture & Component Breakdown

### Core Modules:
- `backend/app/policy/`: PolicyEngine & rules evaluating max transaction amount (₹25,000), max discount percentage (10%), allowed/restricted actions, and mandatory payment approval.
- `backend/app/agents/`:
  - `BuyerAgent`: Intent extraction, product search, candidate ranking.
  - `CheckoutAgent`: Cart creation, discount enforcement, inventory reservation, order creation (`PAYMENT_PENDING`).
  - `Orchestrator`: Trajectory manager feeding real-time status steps to the Agent Activity Timeline.
- `backend/app/payments/`: Razorpay Test Mode order creation, webhook handling, and backend signature verification.
- `frontend/src/`: Next.js 14 App Router UI featuring Buyer Console, Product Results, Real-Time Timeline, Payment Approval Modal, Policy Dashboard, and Audit Log.

---

## 5. Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Lucide React icons
- **Backend**: Python 3.14 / 3.11+, FastAPI, SQLAlchemy 2.0, Pydantic v2
- **Database**: SQLite (default zero-config) / PostgreSQL
- **Payments**: Razorpay Test Mode SDK & Webhook verification with simulated Demo Mode fallback

---

## 6. Setup & Running Instructions

### Backend Setup:
```bash
cd backend
py -m pip install -r requirements.txt
py -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
*Backend runs at http://127.0.0.1:8000 (API docs at http://127.0.0.1:8000/docs).*

### Frontend Setup:
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs at http://localhost:3000.*

---

## 7. Environment Variables (`.env`)

```ini
# Database (Defaults to SQLite for local dev)
DATABASE_URL=sqlite:///./agentready.db

# Razorpay Credentials (Optional; fallback to Demo Mode if omitted)
RAZORPAY_KEY_ID=rzp_test_demo123456
RAZORPAY_KEY_SECRET=demosecret123456
RAZORPAY_WEBHOOK_SECRET=demowebhooksecret

# AI Model Configuration (Optional; deterministic agent fallback when omitted)
AI_API_KEY=
AI_MODEL_PROVIDER=openai
AI_MODEL_NAME=gpt-4o-mini

# Mode
DEMO_MODE=true
```

---

## 8. Interactive Demo Scenarios

1. **Main Shopping Request**:
   - Query: *"I need running shoes under ₹5,000 for daily running and delivery within 3 days."*
   - Agent extracts intent, searches catalog, selects **Puma Velocity Nitro 2** / **Nike Pegasus 40**, checks inventory, applies 10% discount, creates cart & order, and opens the Payment Approval Gate.

2. **Safety Demo (Policy Violation)**:
   - Click **"🛡️ Safety Demo (20% Discount Policy Violation)"**.
   - Agent attempts to apply a 20% discount. The Policy Engine returns `BLOCKED` ("Requested discount 20.0% exceeds merchant limit of 10.0%"). The Orchestrator automatically recovers by capping the discount at 10%.

3. **Failure Demo (Out-of-Stock Recovery)**:
   - Click **"📦 Failure Demo (Out of Stock Recovery)"**.
   - Forces top match to stock=0. Agent detects inventory failure, searches alternative candidate products, and auto-selects an available alternative.

4. **Failure Demo (Payment Failure)**:
   - Click **"💳 Failure Demo (Simulate Payment Failure)"**.
   - Simulates a declined transaction. Order state transitions to `FAILED` without duplicate payment attempts or broken cart state.

---

## 9. Evaluation Methodology

Run the included automated benchmark evaluation script:
```bash
cd backend
py test_agentready.py
```
**Measured Benchmarks**:
- Seed Catalog Check: 9 Products Verified
- Intent & Search Accuracy: 100%
- Policy Violation Enforcement Speed: < 2ms (Deterministic Python evaluation)
- Payment Signature Verification: Verified
- Audit Trail Integrity: 100% actions logged

---

## 10. Future Roadmap

- [ ] Multi-merchant catalog aggregation & agent comparison matrix
- [ ] Multi-currency conversion & international shipping policy rules
- [ ] OAuth2 User Delegated Spending Limits & Card-linked policy tokens
