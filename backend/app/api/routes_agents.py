"""Agent listing API."""

from datetime import datetime, timezone
from typing import Any, List

from fastapi import APIRouter

from backend.app.api.schemas import AgentInfo

router = APIRouter(prefix="/api/agents", tags=["agents"])

MOCK_AGENTS = [
    AgentInfo(
        type="orchestrator",
        name="Orchestrator Agent",
        description="Routes requests to the correct specialist.",
        status="online",
        cases_handled=42,
        last_activity=datetime.now(timezone.utc).isoformat(),
    ),
    AgentInfo(
        type="reimbursement_agent",
        name="Employee Reimbursement",
        description="Processes employee expense reports and receipts.",
        status="online",
        cases_handled=120,
        last_activity=datetime.now(timezone.utc).isoformat(),
    ),
    AgentInfo(
        type="supplier_invoice_agent",
        name="Supplier Invoice",
        description="Validates B2B invoices and purchase orders.",
        status="online",
        cases_handled=85,
        last_activity=datetime.now(timezone.utc).isoformat(),
    ),
    AgentInfo(
        type="customer_refund_agent",
        name="Customer Refund",
        description="Processes refunds back to the original payment method.",
        status="online",
        cases_handled=15,
        last_activity=datetime.now(timezone.utc).isoformat(),
    ),
    AgentInfo(
        type="risk_duplicate_agent",
        name="Risk & Compliance",
        description="Checks for duplicates, sanctions, and anomalies.",
        status="online",
        cases_handled=260,
        last_activity=datetime.now(timezone.utc).isoformat(),
    ),
]

@router.get("")
def list_agents() -> List[dict[str, Any]]:
    return [agent.model_dump(mode="json", by_alias=True) for agent in MOCK_AGENTS]
