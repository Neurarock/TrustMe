"""PydanticAI-powered TrustMe agents."""

from __future__ import annotations

from dataclasses import dataclass, field
from decimal import Decimal
from typing import Any

from pydantic import Field
from pydantic_ai import Agent, ModelRetry, RunContext
from pydantic_ai.usage import UsageLimits

from backend.app.models import (
    AgentDecision,
    Decision,
    MoneyOutRequest,
    PolicyCheck,
    RequestType,
    RiskLevel,
    ToolCallRecord,
    TrustMeModel,
)
from backend.app.repositories.sqlite_repository import SQLiteRepository
from backend.app.tools.csv_data_tools import BusinessTools


ROUTE_USAGE_LIMITS = UsageLimits(request_limit=4, tool_calls_limit=6)
INVESTIGATION_USAGE_LIMITS = UsageLimits(request_limit=8, tool_calls_limit=16)
RISK_USAGE_LIMITS = UsageLimits(request_limit=4, tool_calls_limit=8)


@dataclass
class TrustMeAgentDeps:
    """Dependencies passed to every PydanticAI agent run."""

    request: MoneyOutRequest
    tools: BusinessTools
    repository: SQLiteRepository
    tool_calls: list[ToolCallRecord] = field(default_factory=list)

    def record_tool_call(
        self,
        tool_name: str,
        arguments: dict[str, Any],
        result: dict[str, Any],
    ) -> dict[str, Any]:
        self.tool_calls.append(
            ToolCallRecord(
                tool_name=tool_name,
                arguments=arguments,
                result_summary=summarise_tool_result(result),
                result=result,
            )
        )
        return result


class RouteDecision(TrustMeModel):
    request_type: RequestType
    selected_agent: str | None = None
    confidence: float = Field(ge=0, le=1)
    missing_information: list[str] = Field(default_factory=list)
    evidence_summary: str


class InvestigationDecision(TrustMeModel):
    decision: Decision
    confidence: float = Field(ge=0, le=1)
    request_type: RequestType
    amount: Decimal | None = None
    currency: str = "GBP"
    payee: str | None = None
    source_reference: str | None = None
    reason_summary: str
    risk_level: RiskLevel = RiskLevel.LOW
    policy_checks: list[PolicyCheck] = Field(default_factory=list)
    requires_human_approval: bool = False
    ralio_ready: bool = False
    missing_information: list[str] = Field(default_factory=list)


class RiskDecision(TrustMeModel):
    decision: Decision
    confidence: float = Field(ge=0, le=1)
    risk_level: RiskLevel
    reason_summary: str
    policy_checks: list[PolicyCheck] = Field(default_factory=list)
    duplicate_found: bool = False
    requires_human_approval: bool = False
    ralio_ready: bool = False


@dataclass(frozen=True)
class TrustMeAgents:
    orchestrator: Agent[TrustMeAgentDeps, RouteDecision]
    employee_reimbursement: Agent[TrustMeAgentDeps, InvestigationDecision]
    supplier_invoice: Agent[TrustMeAgentDeps, InvestigationDecision]
    customer_refund: Agent[TrustMeAgentDeps, InvestigationDecision]
    partner_commission: Agent[TrustMeAgentDeps, InvestigationDecision]
    risk_duplicate: Agent[TrustMeAgentDeps, RiskDecision]


def build_trustme_agents(model: Any) -> TrustMeAgents:
    """Build the PydanticAI agents and register their local tools."""
    orchestrator = Agent[TrustMeAgentDeps, RouteDecision](
        model,
        deps_type=TrustMeAgentDeps,
        output_type=RouteDecision,
        instructions=(
            "You are TrustMe's Orchestrator Agent. Classify a money-out "
            "request into exactly one supported request_type. Use the "
            "classify_request tool before producing output. Return concise "
            "evidence summaries only; never expose hidden chain-of-thought."
        ),
    )
    _register_orchestrator_tools(orchestrator)
    _register_route_validator(orchestrator)

    employee = _build_specialist_agent(
        model,
        "employee_reimbursement_agent",
        RequestType.EMPLOYEE_REIMBURSEMENT,
        (
            "Investigate employee reimbursements. Verify employee, receipt, "
            "category policy, amount threshold, and duplicate history."
        ),
    )
    _register_employee_tools(employee)
    _register_investigation_validator(employee)

    supplier = _build_specialist_agent(
        model,
        "supplier_invoice_agent",
        RequestType.SUPPLIER_INVOICE,
        (
            "Investigate supplier invoices. Verify supplier approval, invoice, "
            "purchase order match, amount threshold, recipient, and duplicate "
            "history."
        ),
    )
    _register_supplier_tools(supplier)
    _register_investigation_validator(supplier)

    refund = _build_specialist_agent(
        model,
        "customer_refund_agent",
        RequestType.CUSTOMER_REFUND,
        (
            "Investigate customer refunds. Verify customer, invoice payment, "
            "support evidence, refund calculation, policy, and duplicate history."
        ),
    )
    _register_refund_tools(refund)
    _register_investigation_validator(refund)

    commission = _build_specialist_agent(
        model,
        "partner_commission_agent",
        RequestType.PARTNER_COMMISSION,
        (
            "Investigate partner commissions. Verify partner contract, deal "
            "status, commission calculation, policy, and duplicate history."
        ),
    )
    _register_commission_tools(commission)
    _register_investigation_validator(commission)

    risk = Agent[TrustMeAgentDeps, RiskDecision](
        model,
        deps_type=TrustMeAgentDeps,
        output_type=RiskDecision,
        instructions=(
            "You are TrustMe's Risk & Duplicate Agent. Review the current "
            "request fields and previous payment history. You may block a "
            "request even if a specialist approved it. Return concise evidence "
            "summaries only; never expose hidden chain-of-thought."
        ),
    )
    _register_risk_tools(risk)
    _register_risk_validator(risk)

    return TrustMeAgents(
        orchestrator=orchestrator,
        employee_reimbursement=employee,
        supplier_invoice=supplier,
        customer_refund=refund,
        partner_commission=commission,
        risk_duplicate=risk,
    )


def _build_specialist_agent(
    model: Any,
    agent_name: str,
    request_type: RequestType,
    extra_instructions: str,
) -> Agent[TrustMeAgentDeps, InvestigationDecision]:
    return Agent[TrustMeAgentDeps, InvestigationDecision](
        model,
        deps_type=TrustMeAgentDeps,
        output_type=InvestigationDecision,
        instructions=(
            f"You are TrustMe's {agent_name}. {extra_instructions} "
            f"The output request_type must be {request_type.value}. Use local "
            "business tools before producing the structured decision. Call "
            "infer_request_fields early, then reuse its canonical payee, amount, "
            "currency, category, and source_reference values in subsequent tool "
            "calls unless another tool proves they are wrong. Decisions must be "
            "one of approved, blocked, needs_approval, needs_more_information, "
            "or rejected. Store public evidence in "
            "reason_summary and policy_checks only; never expose hidden "
            "chain-of-thought."
        ),
    )


def run_orchestrator(
    agents: TrustMeAgents,
    deps: TrustMeAgentDeps,
) -> tuple[RouteDecision, list[ToolCallRecord]]:
    result = agents.orchestrator.run_sync(
        _request_prompt(deps.request),
        deps=deps,
        usage_limits=ROUTE_USAGE_LIMITS,
    )
    return result.output, list(deps.tool_calls)


def run_specialist(
    agents: TrustMeAgents,
    request_type: RequestType,
    deps: TrustMeAgentDeps,
) -> tuple[InvestigationDecision, list[ToolCallRecord]]:
    agent = {
        RequestType.EMPLOYEE_REIMBURSEMENT: agents.employee_reimbursement,
        RequestType.SUPPLIER_INVOICE: agents.supplier_invoice,
        RequestType.CUSTOMER_REFUND: agents.customer_refund,
        RequestType.PARTNER_COMMISSION: agents.partner_commission,
    }[request_type]
    result = agent.run_sync(
        _request_prompt(deps.request),
        deps=deps,
        usage_limits=INVESTIGATION_USAGE_LIMITS,
    )
    return result.output, list(deps.tool_calls)


def run_risk_agent(
    agents: TrustMeAgents,
    deps: TrustMeAgentDeps,
    specialist: InvestigationDecision,
) -> tuple[RiskDecision, list[ToolCallRecord]]:
    prompt = (
        f"{_request_prompt(deps.request)}\n\n"
        f"Specialist decision JSON:\n{specialist.model_dump_json()}"
    )
    result = agents.risk_duplicate.run_sync(
        prompt,
        deps=deps,
        usage_limits=RISK_USAGE_LIMITS,
    )
    return result.output, list(deps.tool_calls)


def agent_decision_from_investigation(
    *,
    request_id: str,
    agent_name: str,
    output: InvestigationDecision,
    tool_calls: list[ToolCallRecord],
) -> AgentDecision:
    return AgentDecision(
        request_id=request_id,
        agent_name=agent_name,
        decision=output.decision,
        confidence=output.confidence,
        request_type=output.request_type,
        amount=output.amount,
        currency=output.currency,
        payee=output.payee,
        source_reference=output.source_reference,
        reason=output.reason_summary,
        risk_level=output.risk_level,
        policy_checks=output.policy_checks,
        tool_calls=tool_calls,
        requires_human_approval=output.requires_human_approval,
        ralio_ready=output.ralio_ready,
        missing_information=output.missing_information,
    )


def merge_risk_decision(
    specialist: AgentDecision,
    risk: RiskDecision,
    risk_tool_calls: list[ToolCallRecord],
) -> AgentDecision:
    merged_checks = specialist.policy_checks + risk.policy_checks
    merged_calls = specialist.tool_calls + risk_tool_calls
    if risk.decision == Decision.BLOCKED:
        return specialist.model_copy(
            update={
                "agent_name": f"{specialist.agent_name}+risk_duplicate_agent",
                "decision": Decision.BLOCKED,
                "confidence": min(specialist.confidence, risk.confidence),
                "risk_level": RiskLevel.HIGH,
                "reason": risk.reason_summary,
                "policy_checks": merged_checks,
                "tool_calls": merged_calls,
                "requires_human_approval": False,
                "ralio_ready": False,
            }
        )
    if risk.decision == Decision.NEEDS_APPROVAL and specialist.decision == Decision.APPROVED:
        return specialist.model_copy(
            update={
                "decision": Decision.NEEDS_APPROVAL,
                "risk_level": max_risk(specialist.risk_level, risk.risk_level),
                "reason": risk.reason_summary,
                "policy_checks": merged_checks,
                "tool_calls": merged_calls,
                "requires_human_approval": True,
                "ralio_ready": False,
            }
        )
    return specialist.model_copy(
        update={
            "policy_checks": merged_checks,
            "tool_calls": merged_calls,
            "risk_level": max_risk(specialist.risk_level, risk.risk_level),
        }
    )


def _register_orchestrator_tools(
    agent: Agent[TrustMeAgentDeps, RouteDecision],
) -> None:
    @agent.tool
    def classify_request(ctx: RunContext[TrustMeAgentDeps]) -> dict[str, Any]:
        """Classify the current request into a TrustMe request type."""

        result = ctx.deps.tools.classify_request(ctx.deps.request.description)
        return ctx.deps.record_tool_call("classify_request", {}, result)


def _register_common_tools(
    agent: Agent[TrustMeAgentDeps, InvestigationDecision],
) -> None:
    @agent.tool
    def infer_request_fields(ctx: RunContext[TrustMeAgentDeps]) -> dict[str, Any]:
        """Infer structured request fields from text and mock business data."""

        result = ctx.deps.tools.infer_request_fields(
            ctx.deps.request.description,
            ctx.deps.request.request_type,
        )
        return ctx.deps.record_tool_call("infer_request_fields", {}, result)

    @agent.tool
    def check_policy(
        ctx: RunContext[TrustMeAgentDeps],
        request_type: str,
        amount: str | None,
        category: str = "*",
    ) -> dict[str, Any]:
        """Check amount/category against TrustMe policy thresholds."""

        result = ctx.deps.tools.check_policy(request_type, amount, category)
        return ctx.deps.record_tool_call(
            "check_policy",
            {"request_type": request_type, "amount": amount, "category": category},
            result,
        )

    @agent.tool
    def lookup_previous_payments(
        ctx: RunContext[TrustMeAgentDeps],
        payee: str | None,
        amount: str | None,
        currency: str,
        reference: str | None,
        entity: str | None = None,
    ) -> dict[str, Any]:
        """Look for duplicate historical requests or payments."""

        result = ctx.deps.tools.lookup_previous_payments(
            request_id=ctx.deps.request.id,
            entity=entity,
            payee=payee,
            amount=amount,
            currency=currency,
            reference=reference,
        )
        return ctx.deps.record_tool_call(
            "lookup_previous_payments",
            {
                "entity": entity,
                "payee": payee,
                "amount": amount,
                "currency": currency,
                "reference": reference,
            },
            result,
        )


def _register_employee_tools(
    agent: Agent[TrustMeAgentDeps, InvestigationDecision],
) -> None:
    _register_common_tools(agent)

    @agent.tool
    def lookup_employee(
        ctx: RunContext[TrustMeAgentDeps],
        employee_name: str,
    ) -> dict[str, Any]:
        """Look up an employee by name."""

        result = ctx.deps.tools.lookup_employee(employee_name)
        return ctx.deps.record_tool_call(
            "lookup_employee", {"employee_name": employee_name}, result
        )

    @agent.tool
    def lookup_receipt(
        ctx: RunContext[TrustMeAgentDeps],
        receipt_id: str,
    ) -> dict[str, Any]:
        """Look up an employee reimbursement receipt by ID."""

        result = ctx.deps.tools.lookup_receipt(receipt_id)
        return ctx.deps.record_tool_call(
            "lookup_receipt", {"receipt_id": receipt_id}, result
        )


def _register_supplier_tools(
    agent: Agent[TrustMeAgentDeps, InvestigationDecision],
) -> None:
    _register_common_tools(agent)

    @agent.tool
    def lookup_supplier(
        ctx: RunContext[TrustMeAgentDeps],
        supplier_name: str,
    ) -> dict[str, Any]:
        """Look up a supplier by name."""

        result = ctx.deps.tools.lookup_supplier(supplier_name)
        return ctx.deps.record_tool_call(
            "lookup_supplier", {"supplier_name": supplier_name}, result
        )

    @agent.tool
    def lookup_invoice(
        ctx: RunContext[TrustMeAgentDeps],
        invoice_number: str,
    ) -> dict[str, Any]:
        """Look up an invoice by invoice number."""

        result = ctx.deps.tools.lookup_invoice(invoice_number)
        return ctx.deps.record_tool_call(
            "lookup_invoice", {"invoice_number": invoice_number}, result
        )

    @agent.tool
    def lookup_purchase_order(
        ctx: RunContext[TrustMeAgentDeps],
        po_number: str,
    ) -> dict[str, Any]:
        """Look up a purchase order by number."""

        result = ctx.deps.tools.lookup_purchase_order(po_number)
        return ctx.deps.record_tool_call(
            "lookup_purchase_order", {"po_number": po_number}, result
        )


def _register_refund_tools(
    agent: Agent[TrustMeAgentDeps, InvestigationDecision],
) -> None:
    _register_common_tools(agent)

    @agent.tool
    def lookup_customer(
        ctx: RunContext[TrustMeAgentDeps],
        customer_name: str,
    ) -> dict[str, Any]:
        """Look up a customer by name."""

        result = ctx.deps.tools.lookup_customer(customer_name)
        return ctx.deps.record_tool_call(
            "lookup_customer", {"customer_name": customer_name}, result
        )

    @agent.tool
    def lookup_invoice(
        ctx: RunContext[TrustMeAgentDeps],
        invoice_number: str,
    ) -> dict[str, Any]:
        """Look up a customer invoice by invoice number."""

        result = ctx.deps.tools.lookup_invoice(invoice_number)
        return ctx.deps.record_tool_call(
            "lookup_invoice", {"invoice_number": invoice_number}, result
        )

    @agent.tool
    def lookup_support_ticket(
        ctx: RunContext[TrustMeAgentDeps],
        ticket_id: str,
    ) -> dict[str, Any]:
        """Look up support evidence for a refund."""

        result = ctx.deps.tools.lookup_support_ticket(ticket_id)
        return ctx.deps.record_tool_call(
            "lookup_support_ticket", {"ticket_id": ticket_id}, result
        )

    @agent.tool
    def calculate_customer_refund(
        ctx: RunContext[TrustMeAgentDeps],
        customer_id: str,
        invoice_id: str,
        reason: str,
    ) -> dict[str, Any]:
        """Calculate and validate a customer refund amount."""

        result = ctx.deps.tools.calculate_customer_refund(
            customer_id,
            invoice_id,
            reason,
        )
        return ctx.deps.record_tool_call(
            "calculate_customer_refund",
            {"customer_id": customer_id, "invoice_id": invoice_id, "reason": reason},
            result,
        )


def _register_commission_tools(
    agent: Agent[TrustMeAgentDeps, InvestigationDecision],
) -> None:
    _register_common_tools(agent)

    @agent.tool
    def lookup_partner(
        ctx: RunContext[TrustMeAgentDeps],
        partner_name: str,
    ) -> dict[str, Any]:
        """Look up a partner contract by partner name."""

        result = ctx.deps.tools.lookup_partner(partner_name)
        return ctx.deps.record_tool_call(
            "lookup_partner", {"partner_name": partner_name}, result
        )

    @agent.tool
    def lookup_deal(
        ctx: RunContext[TrustMeAgentDeps],
        deal_id: str,
    ) -> dict[str, Any]:
        """Look up a sales deal by ID."""

        result = ctx.deps.tools.lookup_deal(deal_id)
        return ctx.deps.record_tool_call("lookup_deal", {"deal_id": deal_id}, result)

    @agent.tool
    def calculate_partner_commission(
        ctx: RunContext[TrustMeAgentDeps],
        partner_id: str,
        deal_id: str,
    ) -> dict[str, Any]:
        """Calculate and validate a partner commission."""

        result = ctx.deps.tools.calculate_partner_commission(partner_id, deal_id)
        return ctx.deps.record_tool_call(
            "calculate_partner_commission",
            {"partner_id": partner_id, "deal_id": deal_id},
            result,
        )


def _register_risk_tools(agent: Agent[TrustMeAgentDeps, RiskDecision]) -> None:
    @agent.tool
    def lookup_previous_payments(
        ctx: RunContext[TrustMeAgentDeps],
        payee: str | None,
        amount: str | None,
        currency: str,
        reference: str | None,
        entity: str | None = None,
    ) -> dict[str, Any]:
        """Look for duplicate historical requests or payments."""

        result = ctx.deps.tools.lookup_previous_payments(
            request_id=ctx.deps.request.id,
            entity=entity,
            payee=payee,
            amount=amount,
            currency=currency,
            reference=reference,
        )
        return ctx.deps.record_tool_call(
            "lookup_previous_payments",
            {
                "entity": entity,
                "payee": payee,
                "amount": amount,
                "currency": currency,
                "reference": reference,
            },
            result,
        )


def _register_route_validator(
    agent: Agent[TrustMeAgentDeps, RouteDecision],
) -> None:
    @agent.output_validator
    def validate_route(
        ctx: RunContext[TrustMeAgentDeps],
        output: RouteDecision,
    ) -> RouteDecision:
        if output.request_type != RequestType.UNKNOWN and not output.selected_agent:
            raise ModelRetry("selected_agent is required for known request types.")
        if not output.evidence_summary.strip():
            raise ModelRetry("evidence_summary must be a concise public summary.")
        return output


def _register_investigation_validator(
    agent: Agent[TrustMeAgentDeps, InvestigationDecision],
) -> None:
    @agent.output_validator
    def validate_investigation(
        ctx: RunContext[TrustMeAgentDeps],
        output: InvestigationDecision,
    ) -> InvestigationDecision:
        if output.decision in {Decision.APPROVED, Decision.NEEDS_APPROVAL}:
            missing = [
                name
                for name in ("amount", "currency", "payee", "source_reference")
                if not getattr(output, name)
            ]
            if missing:
                raise ModelRetry(
                    "Approved or approval-needed decisions require: "
                    + ", ".join(missing)
                )
        if output.ralio_ready and output.decision != Decision.APPROVED:
            raise ModelRetry("ralio_ready may only be true for approved decisions.")
        if output.requires_human_approval and output.decision != Decision.NEEDS_APPROVAL:
            raise ModelRetry(
                "requires_human_approval must map to needs_approval decision."
            )
        if not output.policy_checks:
            raise ModelRetry("At least one public policy_check is required.")
        return output


def _register_risk_validator(agent: Agent[TrustMeAgentDeps, RiskDecision]) -> None:
    @agent.output_validator
    def validate_risk(
        ctx: RunContext[TrustMeAgentDeps],
        output: RiskDecision,
    ) -> RiskDecision:
        if output.duplicate_found and output.decision != Decision.BLOCKED:
            raise ModelRetry("duplicate_found must block the request.")
        if output.ralio_ready:
            raise ModelRetry("Risk agent cannot independently make a Ralio-ready call.")
        if not output.policy_checks:
            raise ModelRetry("Risk output must include at least one policy check.")
        return output


def summarise_tool_result(result: dict[str, Any]) -> str:
    if "error" in result:
        return str(result["error"])
    if "found" in result:
        return "found" if result["found"] else "not found"
    if "status" in result:
        return str(result["status"])
    if "valid" in result:
        return "valid" if result["valid"] else "invalid"
    if "duplicate_found" in result:
        return "duplicate found" if result["duplicate_found"] else "no duplicate"
    return "completed"


def _request_prompt(request: MoneyOutRequest) -> str:
    return (
        "Investigate this TrustMe money-out request using tools and return the "
        "typed output only.\n\n"
        f"Request JSON:\n{request.model_dump_json()}"
    )


def max_risk(left: RiskLevel, right: RiskLevel) -> RiskLevel:
    order = {
        RiskLevel.LOW: 0,
        RiskLevel.MEDIUM: 1,
        RiskLevel.HIGH: 2,
        "low": 0,
        "medium": 1,
        "high": 2,
    }
    return left if order[left] >= order[right] else right
