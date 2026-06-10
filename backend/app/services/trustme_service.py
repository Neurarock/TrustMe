"""TrustMe application service layer."""

from __future__ import annotations

from collections.abc import Callable
from typing import Any

from backend.app.agents import (
    TrustMeAgentDeps,
    TrustMeAgents,
    agent_decision_from_investigation,
    merge_risk_decision,
    run_orchestrator,
    run_risk_agent,
    run_specialist,
)
from backend.app.integrations.ralio import RalioAdapter, build_idempotency_key
from backend.app.models import (
    AgentDecision,
    AuditEvent,
    CreateMoneyOutRequest,
    Decision,
    MoneyOutRequest,
    PaymentExecution,
    PaymentStatus,
    RequestStatus,
    RequestType,
)
from backend.app.repositories.sqlite_repository import SQLiteRepository
from backend.app.tools.csv_data_tools import BusinessTools
from backend.app.tools.parsing import extract_amount_currency


class TrustMeServiceError(RuntimeError):
    """Raised for expected service-level validation failures."""


class TrustMeService:
    def __init__(
        self,
        *,
        repository: SQLiteRepository,
        tools: BusinessTools,
        agents: TrustMeAgents | None = None,
        agents_factory: Callable[[], TrustMeAgents] | None = None,
        ralio_adapter: RalioAdapter,
    ) -> None:
        self.repository = repository
        self.tools = tools
        self._agents = agents
        self._agents_factory = agents_factory
        self.ralio_adapter = ralio_adapter

    def create_request(self, payload: CreateMoneyOutRequest) -> MoneyOutRequest:
        amount = payload.amount
        currency = payload.currency
        if amount is None:
            inferred_amount, inferred_currency = extract_amount_currency(payload.description)
            amount = inferred_amount
            currency = inferred_currency or currency
        request = MoneyOutRequest(
            description=payload.description,
            amount=amount,
            currency=currency,
            payee=payload.payee,
            source_reference=payload.source_reference,
            metadata=payload.metadata,
        )
        self.repository.add_request(request)
        self._audit(
            request.id,
            actor="api",
            action="request.created",
            summary="Money-out request created.",
            metadata=request.model_dump(mode="json"),
        )
        return request

    def list_requests(self) -> list[MoneyOutRequest]:
        return self.repository.list_requests()

    def get_request(self, request_id: str) -> MoneyOutRequest:
        request = self.repository.get_request(request_id)
        if request is None:
            raise TrustMeServiceError(f"Request not found: {request_id}")
        return request

    def investigate_request(self, request_id: str) -> AgentDecision:
        request = self.get_request(request_id)
        agents = self.agents
        request.status = RequestStatus.INVESTIGATING
        self.repository.update_request(request)
        self._audit(
            request.id,
            actor="orchestrator_agent",
            action="request.investigation_started",
            summary="Investigation started.",
        )

        route_deps = self._deps(request)
        route, route_calls = run_orchestrator(agents, route_deps)
        request.request_type = route.request_type
        request.assigned_agent = route.selected_agent
        self.repository.update_request(request)
        self._audit(
            request.id,
            actor="orchestrator_agent",
            action="request.routed",
            summary=route.evidence_summary,
            metadata={
                "route": route.model_dump(mode="json"),
                "tool_calls": [call.model_dump(mode="json") for call in route_calls],
            },
        )

        if route.request_type == RequestType.UNKNOWN:
            decision = AgentDecision(
                request_id=request.id,
                agent_name="orchestrator_agent",
                decision=Decision.NEEDS_MORE_INFORMATION,
                confidence=route.confidence,
                request_type=RequestType.UNKNOWN,
                amount=request.amount,
                currency=request.currency,
                payee=request.payee,
                source_reference=request.source_reference,
                reason=route.evidence_summary,
                tool_calls=route_calls,
                missing_information=route.missing_information,
            )
            return self._persist_decision_and_status(request, decision)

        specialist_deps = self._deps(request)
        specialist_output, specialist_calls = run_specialist(
            agents,
            route.request_type,
            specialist_deps,
        )
        decision = agent_decision_from_investigation(
            request_id=request.id,
            agent_name=route.selected_agent or f"{route.request_type.value}_agent",
            output=specialist_output,
            tool_calls=specialist_calls,
        )

        risk_deps = self._deps(
            request.model_copy(
                update={
                    "amount": decision.amount,
                    "currency": decision.currency,
                    "payee": decision.payee,
                    "source_reference": decision.source_reference,
                }
            )
        )
        risk_output, risk_calls = run_risk_agent(
            agents,
            risk_deps,
            specialist_output,
        )
        final_decision = merge_risk_decision(decision, risk_output, risk_calls)
        return self._persist_decision_and_status(request, final_decision)

    def approve_request(
        self,
        request_id: str,
        *,
        approved_by: str = "trustme-demo-approver",
        note: str | None = None,
    ) -> MoneyOutRequest:
        request = self.get_request(request_id)
        if request.status != RequestStatus.NEEDS_APPROVAL:
            raise TrustMeServiceError("Only needs_approval requests can be approved.")
        self.repository.approve_request(request_id, approved_by=approved_by, note=note)
        request.status = RequestStatus.APPROVED
        self.repository.update_request(request)
        self._audit(
            request.id,
            actor=approved_by,
            action="request.approved",
            summary="TrustMe approval granted.",
            metadata={"note": note},
        )
        return request

    def reject_request(
        self,
        request_id: str,
        *,
        rejected_by: str = "trustme-demo-approver",
        note: str | None = None,
    ) -> MoneyOutRequest:
        request = self.get_request(request_id)
        if request.status in {RequestStatus.PAID, RequestStatus.PAYMENT_PENDING}:
            raise TrustMeServiceError("Paid or pending-payment requests cannot be rejected.")
        request.status = RequestStatus.REJECTED
        self.repository.update_request(request)
        self._audit(
            request.id,
            actor=rejected_by,
            action="request.rejected",
            summary="TrustMe request rejected.",
            metadata={"note": note},
        )
        return request

    def execute_approved_payment(self, request_id: str) -> PaymentExecution:
        request = self.get_request(request_id)
        decision = self.repository.get_decision(request_id)
        if decision is None:
            raise TrustMeServiceError("Request must be investigated before execution.")
        self._validate_payment_execution(request, decision)
        idempotency_key = build_idempotency_key(request)
        existing = self.repository.get_payment(request_id)
        if existing is not None:
            return existing
        if self.repository.payment_exists_for_idempotency_key(idempotency_key):
            raise TrustMeServiceError("Payment idempotency key already exists.")

        request.status = RequestStatus.PAYMENT_PENDING
        self.repository.update_request(request)
        self._audit(
            request.id,
            actor="payment_service",
            action="payment.execution_requested",
            summary="Validated request sent to Ralio adapter.",
            metadata={"idempotency_key": idempotency_key},
        )

        try:
            payment = self.ralio_adapter.execute_payment(
                request,
                ralio_recipient_id=request.metadata.get("ralio_recipient_id"),
            )
        except Exception as exc:
            payment = PaymentExecution(
                request_id=request.id,
                idempotency_key=idempotency_key,
                status=PaymentStatus.FAILED,
                ralio_reply=str(exc),
                raw_response_summary={"error": str(exc)},
            )
            request.status = RequestStatus.PAYMENT_FAILED
        else:
            request.status = {
                PaymentStatus.COMPLETED: RequestStatus.PAID,
                PaymentStatus.REQUIRES_APPROVAL: RequestStatus.AWAITING_RALIO_APPROVAL,
                PaymentStatus.SUBMITTED: RequestStatus.PAYMENT_PENDING,
                PaymentStatus.FAILED: RequestStatus.PAYMENT_FAILED,
                PaymentStatus.NOT_STARTED: RequestStatus.PAYMENT_FAILED,
            }[payment.status]
        self.repository.save_payment(payment)
        self.repository.update_request(request)
        self._audit(
            request.id,
            actor="ralio_payment_agent",
            action="payment.ralio_response",
            summary=f"Ralio adapter returned {payment.status}.",
            metadata=payment.model_dump(mode="json"),
        )
        return payment

    def get_payment_status(self, request_id: str) -> PaymentExecution | None:
        return self.repository.get_payment(request_id)

    def get_audit_trail(self, request_id: str) -> list[AuditEvent]:
        self.get_request(request_id)
        return self.repository.list_audit_events(request_id)

    def seed_demo_requests(self) -> None:
        if self.repository.request_count() > 0:
            return
        cases = [
            {"title": "Alex reimbursement", "desc": "Reimburse Alex £45.50 for client lunch with GlobalTech.", "payee": "Alex Patel", "amount": 45.50},
            {"title": "Northstar invoice", "desc": "Pay Northstar Design £420 for invoice INV-2042.", "payee": "Northstar Design", "amount": 420.00},
            {"title": "BrightPath refund", "desc": "Refund BrightPath £260 because we overbilled them.", "payee": "BrightPath", "amount": 260.00},
            {"title": "Duplicate Alex reimbursement", "desc": "Reimburse Alex £45.50 again for the same lunch.", "payee": "Alex Patel", "amount": 45.50},
        ]
        from decimal import Decimal
        for case in cases:
            self.create_request(
                CreateMoneyOutRequest(
                    description=case["desc"],
                    amount=Decimal(str(case["amount"])),
                    currency="GBP",
                    payee=case["payee"],
                    metadata={"title": case["title"], "source": "client"}
                )
            )

    def _deps(self, request: MoneyOutRequest) -> TrustMeAgentDeps:
        return TrustMeAgentDeps(
            request=request,
            tools=self.tools,
            repository=self.repository,
        )

    @property
    def agents(self) -> TrustMeAgents:
        if self._agents is None:
            if self._agents_factory is None:
                raise TrustMeServiceError("TrustMe agents are not configured.")
            self._agents = self._agents_factory()
        return self._agents

    def _persist_decision_and_status(
        self,
        request: MoneyOutRequest,
        decision: AgentDecision,
    ) -> AgentDecision:
        request.amount = decision.amount
        request.currency = decision.currency
        request.payee = decision.payee
        request.source_reference = decision.source_reference
        request.risk_level = decision.risk_level
        request.status = _status_for_decision(decision)
        if "ralio_recipient_id" not in request.metadata:
            request.metadata["ralio_recipient_id"] = _recipient_from_tool_calls(decision)
        self.repository.update_request(request)
        self.repository.save_decision(decision)
        self._audit(
            request.id,
            actor=decision.agent_name,
            action="request.decision_recorded",
            summary=decision.reason,
            metadata=decision.model_dump(mode="json"),
        )
        return decision

    def _validate_payment_execution(
        self,
        request: MoneyOutRequest,
        decision: AgentDecision,
    ) -> None:
        resolved_decision = Decision(decision.decision)
        if resolved_decision == Decision.BLOCKED:
            raise TrustMeServiceError("Blocked requests cannot execute.")
        if resolved_decision in {Decision.REJECTED, Decision.NEEDS_MORE_INFORMATION}:
            raise TrustMeServiceError(f"{decision.decision} requests cannot execute.")
        if resolved_decision == Decision.NEEDS_APPROVAL and not self.repository.has_approval(
            request.id
        ):
            raise TrustMeServiceError("TrustMe approval is required before execution.")
        if decision.requires_human_approval and not self.repository.has_approval(request.id):
            raise TrustMeServiceError("TrustMe approval is required before execution.")
        if request.status not in {RequestStatus.APPROVED, RequestStatus.PAID} and (
            resolved_decision == Decision.APPROVED
        ):
            if request.status != RequestStatus.APPROVED:
                raise TrustMeServiceError("Request status must be approved before execution.")
        missing = [
            name
            for name, value in {
                "amount": request.amount,
                "currency": request.currency,
                "payee": request.payee,
                "source_reference": request.source_reference,
            }.items()
            if value is None or value == ""
        ]
        if missing:
            raise TrustMeServiceError("Missing payment fields: " + ", ".join(missing))

    def _audit(
        self,
        request_id: str,
        *,
        actor: str,
        action: str,
        summary: str,
        metadata: dict[str, Any] | None = None,
    ) -> AuditEvent:
        return self.repository.add_audit_event(
            AuditEvent(
                request_id=request_id,
                actor=actor,
                action=action,
                summary=summary,
                metadata=metadata or {},
            )
        )


def _status_for_decision(decision: AgentDecision) -> RequestStatus:
    return {
        Decision.APPROVED: RequestStatus.APPROVED,
        Decision.BLOCKED: RequestStatus.BLOCKED,
        Decision.NEEDS_APPROVAL: RequestStatus.NEEDS_APPROVAL,
        Decision.NEEDS_MORE_INFORMATION: RequestStatus.NEEDS_MORE_INFORMATION,
        Decision.REJECTED: RequestStatus.REJECTED,
    }[Decision(decision.decision)]


def _recipient_from_tool_calls(decision: AgentDecision) -> str | None:
    for call in decision.tool_calls:
        for key in ("supplier", "customer", "partner"):
            row = call.result.get(key)
            if isinstance(row, dict) and row.get("ralio_recipient_id"):
                return str(row["ralio_recipient_id"])
    return None
