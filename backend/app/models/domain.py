"""Shared TrustMe domain models.

These models are intentionally serializable and transport-friendly because the
REST API, MCP tools, SQLite repository, and tests all use the same shapes.
"""

from __future__ import annotations

from datetime import datetime, timezone
from decimal import Decimal
from enum import Enum
from typing import Any
from uuid import uuid4

from pydantic import BaseModel, ConfigDict, Field


def utc_now() -> datetime:
    """Return a timezone-aware UTC timestamp."""
    return datetime.now(timezone.utc)


def new_id(prefix: str) -> str:
    """Create a compact, prefixed ID suitable for demos and logs."""
    return f"{prefix}_{uuid4().hex[:12]}"


class RequestType(str, Enum):
    EMPLOYEE_REIMBURSEMENT = "employee_reimbursement"
    SUPPLIER_INVOICE = "supplier_invoice"
    CUSTOMER_REFUND = "customer_refund"
    PARTNER_COMMISSION = "partner_commission"
    UNKNOWN = "unknown"


class RequestStatus(str, Enum):
    SUBMITTED = "submitted"
    INVESTIGATING = "investigating"
    APPROVED = "approved"
    NEEDS_APPROVAL = "needs_approval"
    NEEDS_MORE_INFORMATION = "needs_more_information"
    BLOCKED = "blocked"
    REJECTED = "rejected"
    PAYMENT_PENDING = "payment_pending"
    PAID = "paid"
    PAYMENT_FAILED = "payment_failed"
    AWAITING_RALIO_APPROVAL = "awaiting_ralio_approval"


class Decision(str, Enum):
    APPROVED = "approved"
    BLOCKED = "blocked"
    NEEDS_APPROVAL = "needs_approval"
    NEEDS_MORE_INFORMATION = "needs_more_information"
    REJECTED = "rejected"


class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class CheckStatus(str, Enum):
    PASSED = "passed"
    FAILED = "failed"
    WARNING = "warning"
    MISSING = "missing"


class PaymentStatus(str, Enum):
    NOT_STARTED = "not_started"
    SUBMITTED = "submitted"
    COMPLETED = "completed"
    REQUIRES_APPROVAL = "requires_approval"
    FAILED = "failed"


class TrustMeModel(BaseModel):
    """Base model with JSON-friendly enum and decimal behavior."""

    model_config = ConfigDict(use_enum_values=True)


class CreateMoneyOutRequest(TrustMeModel):
    description: str = Field(min_length=1)
    amount: Decimal | None = None
    currency: str = "GBP"
    payee: str | None = None
    source_reference: str | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)


class MoneyOutRequest(TrustMeModel):
    id: str = Field(default_factory=lambda: new_id("req"))
    description: str
    request_type: RequestType = RequestType.UNKNOWN
    assigned_agent: str | None = None
    amount: Decimal | None = None
    currency: str = "GBP"
    payee: str | None = None
    source_reference: str | None = None
    status: RequestStatus = RequestStatus.SUBMITTED
    risk_level: RiskLevel = RiskLevel.LOW
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)
    metadata: dict[str, Any] = Field(default_factory=dict)


class PolicyCheck(TrustMeModel):
    name: str
    status: CheckStatus
    evidence: str
    severity: RiskLevel = RiskLevel.LOW


class ToolCallRecord(TrustMeModel):
    tool_name: str
    arguments: dict[str, Any] = Field(default_factory=dict)
    result_summary: str
    result: dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=utc_now)


class AgentDecision(TrustMeModel):
    request_id: str
    agent_name: str
    decision: Decision
    confidence: float = Field(ge=0, le=1)
    request_type: RequestType
    amount: Decimal | None = None
    currency: str = "GBP"
    payee: str | None = None
    source_reference: str | None = None
    reason: str
    risk_level: RiskLevel = RiskLevel.LOW
    policy_checks: list[PolicyCheck] = Field(default_factory=list)
    tool_calls: list[ToolCallRecord] = Field(default_factory=list)
    requires_human_approval: bool = False
    ralio_ready: bool = False
    missing_information: list[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=utc_now)


class AuditEvent(TrustMeModel):
    id: str = Field(default_factory=lambda: new_id("audit"))
    request_id: str
    actor: str
    action: str
    summary: str
    metadata: dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=utc_now)


class PaymentExecution(TrustMeModel):
    request_id: str
    idempotency_key: str
    status: PaymentStatus
    ralio_reference_id: str | None = None
    ralio_conversation_id: str | None = None
    ralio_payment_intent_id: str | None = None
    ralio_reply: str | None = None
    approval_url: str | None = None
    raw_response_summary: dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)
