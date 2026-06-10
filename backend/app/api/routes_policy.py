"""Policy parsing API."""

from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter

from backend.app.api.schemas import ParsePolicyInput, PolicyConfig

router = APIRouter(prefix="/api/policy", tags=["policy"])

# We mock the response to match frontend DEFAULT_POLICY for the demo
MOCK_POLICY = PolicyConfig(
    auto_approval_thresholds={
        "employee_reimbursement": 50,
        "supplier_invoice": 250,
        "customer_refund": 500,
        "partner_commission": 200,
    },
    allowed_categories=[
        "client_meal",
        "travel",
        "software",
        "office_supplies",
        "design_services",
    ],
    block_duplicates=True,
    receipt_required_over=25,
    currency="GBP",
    updated_at=datetime.now(timezone.utc).isoformat(),
)

@router.post("/parse")
def parse_policy(payload: ParsePolicyInput) -> dict[str, Any]:
    return MOCK_POLICY.model_dump(mode="json", by_alias=True)
