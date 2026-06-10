"""API Schemas matching the Frontend contracts."""
from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from enum import Enum
from typing import Any, List, Optional

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel

from backend.app.models.domain import (
    CheckStatus,
    Decision,
    PaymentStatus,
    RequestStatus,
    RequestType,
    RiskLevel,
)


class FrontendModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        use_enum_values=True,
    )


class ReActStepKind(str, Enum):
    THOUGHT = "thought"
    TOOL_CALL = "tool_call"
    OBSERVATION = "observation"
    POLICY = "policy"
    RISK = "risk"
    DECISION = "decision"
    PAYMENT = "payment"


class ReActStep(FrontendModel):
    id: str
    index: int
    kind: ReActStepKind
    agent: str
    title: str
    detail: Optional[str] = None
    tool: Optional[str] = None
    timestamp: str


class PolicyCheck(FrontendModel):
    id: str
    label: str
    status: str


class RiskAssessment(FrontendModel):
    level: str
    score: int
    duplicate_detected: bool
    existing_payment: Optional[str] = None
    recipient_mismatch: bool
    approval_required: bool
    payment_retry_risk: bool
    notes: Optional[str] = None


class DecisionDetail(FrontendModel):
    decision: str
    confidence: int
    reason: str


class RalioStatus(str, Enum):
    NOT_SENT = "not_sent"
    PENDING = "pending"
    REQUIRES_APPROVAL = "requires_approval"
    PROCESSING = "processing"
    PAID = "paid"
    FAILED = "failed"


class RalioExecution(FrontendModel):
    mode: str
    status: str
    reference: Optional[str] = None
    amount: float
    currency: str
    payee: str
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    blocked_reason: Optional[str] = None


class AuditEntry(FrontendModel):
    id: str
    timestamp: str
    message: str
    agent: Optional[str] = None


class MoneyOutRequest(FrontendModel):
    id: str
    title: str
    type: str
    source: str
    requester_name: Optional[str] = None
    payee: str
    amount: float
    currency: str
    description: Optional[str] = None
    reference: Optional[str] = None
    counterparty_ref: Optional[str] = None
    attachment_name: Optional[str] = None
    assigned_agent: str
    risk_level: str
    decision: str
    ralio_status: str
    ralio_ready: bool
    created_at: str

    steps: List[ReActStep] = Field(default_factory=list)
    policy_checks: List[PolicyCheck] = Field(default_factory=list)
    risk: RiskAssessment
    decision_detail: DecisionDetail
    ralio: RalioExecution
    audit: List[AuditEntry] = Field(default_factory=list)


class CreateRequestInput(FrontendModel):
    title: str
    type: str
    payee: str
    amount: float
    currency: str
    description: Optional[str] = None
    reference: Optional[str] = None
    counterparty_ref: Optional[str] = None
    attachment_name: Optional[str] = None
    source: Optional[str] = "client"
    requester_name: Optional[str] = None


class AgentInfo(FrontendModel):
    type: str
    name: str
    description: str
    status: str
    cases_handled: int
    last_activity: str


class PolicyConfig(FrontendModel):
    auto_approval_thresholds: dict[str, int]
    allowed_categories: List[str]
    block_duplicates: bool
    receipt_required_over: int
    currency: str
    notes: Optional[str] = None
    updated_at: str


class ParsePolicyInput(FrontendModel):
    text: Optional[str] = None
    file_name: Optional[str] = None
