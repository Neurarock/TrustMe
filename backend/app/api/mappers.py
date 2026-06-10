"""Mapping between domain models and frontend schemas."""
from __future__ import annotations

from typing import Any, Dict

from backend.app.api import schemas
from backend.app.models import domain
from backend.app.services import TrustMeService


def _map_ralio_status(status: domain.PaymentStatus) -> str:
    if status == domain.PaymentStatus.NOT_STARTED:
        return schemas.RalioStatus.NOT_SENT
    if status == domain.PaymentStatus.SUBMITTED:
        return schemas.RalioStatus.PENDING
    if status == domain.PaymentStatus.REQUIRES_APPROVAL:
        return schemas.RalioStatus.REQUIRES_APPROVAL
    if status == domain.PaymentStatus.COMPLETED:
        return schemas.RalioStatus.PAID
    if status == domain.PaymentStatus.FAILED:
        return schemas.RalioStatus.FAILED
    return schemas.RalioStatus.NOT_SENT


def to_frontend_request(
    req: domain.MoneyOutRequest, service: TrustMeService
) -> schemas.MoneyOutRequest:
    # 1. Base mapping from domain.MoneyOutRequest
    title = req.metadata.get("title", req.description)
    source = req.metadata.get("source", "host")
    requester_name = req.metadata.get("requester_name")
    counterparty_ref = req.metadata.get("counterparty_ref")
    attachment_name = req.metadata.get("attachment_name")

    # 2. Audit Trail
    audits = service.get_audit_trail(req.id)
    frontend_audits = []
    for a in audits:
        frontend_audits.append(
            schemas.AuditEntry(
                id=a.id,
                timestamp=a.created_at.isoformat(),
                message=a.summary,
                agent=a.actor if "agent" in a.actor else None
            )
        )

    # 3. Ralio Execution Status
    payment = service.get_payment_status(req.id)
    ralio_exec = schemas.RalioExecution(
        mode="mock",
        status="not_sent",
        amount=float(req.amount) if req.amount else 0.0,
        currency=req.currency,
        payee=req.payee or "Unknown"
    )
    if payment:
        ralio_exec.status = _map_ralio_status(payment.status)
        ralio_exec.reference = payment.ralio_reference_id
        ralio_exec.created_at = payment.created_at.isoformat()
        ralio_exec.updated_at = payment.updated_at.isoformat()

    if req.status == domain.RequestStatus.BLOCKED:
        ralio_exec.status = "not_sent"
        ralio_exec.blocked_reason = "Blocked by agent"

    # 4. Investigation Decision & Steps
    decision_record = service.repository.get_decision(req.id)
    frontend_steps = []
    frontend_policy_checks = []
    
    if decision_record:
        # Steps
        idx = 0
        for tool_call in decision_record.tool_calls:
            frontend_steps.append(
                schemas.ReActStep(
                    id=f"step_{idx}",
                    index=idx,
                    kind=schemas.ReActStepKind.TOOL_CALL,
                    agent=decision_record.agent_name,
                    title=f"Call {tool_call.tool_name}",
                    detail=tool_call.result_summary,
                    tool=f"{tool_call.tool_name}(...)",
                    timestamp=tool_call.created_at.isoformat()
                )
            )
            idx += 1
            
        # Policy Checks
        for pc in decision_record.policy_checks:
            # Map domain.CheckStatus to frontend policy check status ("pass", "fail", "warn")
            pc_status = "pass"
            if pc.status == domain.CheckStatus.FAILED:
                pc_status = "fail"
            elif pc.status == domain.CheckStatus.WARNING:
                pc_status = "warn"
                
            frontend_policy_checks.append(
                schemas.PolicyCheck(
                    id=f"pc_{pc.name}",
                    label=f"{pc.name}: {pc.evidence}",
                    status=pc_status
                )
            )

        decision_detail = schemas.DecisionDetail(
            decision=decision_record.decision,
            confidence=int(decision_record.confidence * 100),
            reason=decision_record.reason
        )
        
        # Determine risk specifics from tool calls or policy checks
        duplicate_detected = any(
            pc.name == "duplicate_check" and pc.status == domain.CheckStatus.FAILED.value 
            for pc in decision_record.policy_checks
        )
        
        risk = schemas.RiskAssessment(
            level=decision_record.risk_level,
            score=100 if decision_record.risk_level == domain.RiskLevel.HIGH.value else (50 if decision_record.risk_level == domain.RiskLevel.MEDIUM.value else 10),
            duplicate_detected=duplicate_detected,
            recipient_mismatch=False,
            approval_required=decision_record.requires_human_approval,
            payment_retry_risk=False,
            notes=f"Risk assigned by {decision_record.agent_name}"
        )
    else:
        decision_detail = schemas.DecisionDetail(
            decision=req.status,
            confidence=100,
            reason="Pending investigation"
        )
        risk = schemas.RiskAssessment(
            level=req.risk_level,
            score=0,
            duplicate_detected=False,
            recipient_mismatch=False,
            approval_required=False,
            payment_retry_risk=False,
            notes="No investigation completed."
        )

    return schemas.MoneyOutRequest(
        id=req.id,
        title=title,
        type=req.request_type,
        source=source,
        requester_name=requester_name,
        payee=req.payee or "Unknown",
        amount=float(req.amount) if req.amount else 0.0,
        currency=req.currency,
        description=req.description,
        reference=req.source_reference,
        counterparty_ref=counterparty_ref,
        attachment_name=attachment_name,
        assigned_agent=req.assigned_agent or "orchestrator",
        risk_level=req.risk_level,
        decision=req.status,
        ralio_status=ralio_exec.status,
        ralio_ready=req.status == domain.RequestStatus.APPROVED.value,
        created_at=req.created_at.isoformat(),
        steps=frontend_steps,
        policy_checks=frontend_policy_checks,
        risk=risk,
        decision_detail=decision_detail,
        ralio=ralio_exec,
        audit=frontend_audits
    )


def from_create_input(input_data: schemas.CreateRequestInput) -> domain.CreateMoneyOutRequest:
    from decimal import Decimal
    return domain.CreateMoneyOutRequest(
        description=input_data.description or input_data.title,
        amount=Decimal(str(input_data.amount)),
        currency=input_data.currency,
        payee=input_data.payee,
        source_reference=input_data.reference,
        metadata={
            "title": input_data.title,
            "source": input_data.source,
            "requester_name": input_data.requester_name,
            "counterparty_ref": input_data.counterparty_ref,
            "attachment_name": input_data.attachment_name,
            "type": input_data.type,
        }
    )
