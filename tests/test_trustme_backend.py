from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import pytest
from fastapi.testclient import TestClient
from pydantic_ai.messages import ModelMessage, ModelResponse, TextPart, ToolCallPart
from pydantic_ai.models.function import AgentInfo, FunctionModel

from backend.app.agents import TrustMeAgentDeps, build_trustme_agents, run_orchestrator
from backend.app.container import get_service
from backend.app import mcp_server
from backend.app.integrations.ralio import MockRalioAdapter
from backend.app.main import create_app
from backend.app.models import (
    Decision,
    MoneyOutRequest,
)
from backend.app.repositories.sqlite_repository import SQLiteRepository
from backend.app.services import TrustMeService, TrustMeServiceError
from backend.app.tools.csv_data_tools import BusinessTools, CsvDataStore


def make_service(tmp_path: Path) -> TrustMeService:
    repository = SQLiteRepository(tmp_path / "trustme.sqlite3")
    tools = BusinessTools(CsvDataStore(Path("backend/app/data")), repository)
    agents = build_trustme_agents(FunctionModel(trustme_function_model))
    service = TrustMeService(
        repository=repository,
        tools=tools,
        agents=agents,
        ralio_adapter=MockRalioAdapter(),
    )
    service.seed_demo_requests()
    return service


def trustme_function_model(
    messages: list[ModelMessage],
    info: AgentInfo,
) -> ModelResponse:
    tool_names = {tool.name for tool in info.function_tools}
    returns = _tool_returns(messages)
    request = _request_from_messages(messages)

    if "classify_request" in tool_names:
        if "classify_request" not in returns:
            return ModelResponse(parts=[ToolCallPart("classify_request", {})])
        result = returns["classify_request"]
        return _json_response(
            {
                "request_type": result["request_type"],
                "selected_agent": result["selected_agent"],
                "confidence": result["confidence"],
                "missing_information": result["missing_information"],
                "evidence_summary": f"Classified as {result['request_type']}.",
            }
        )

    if tool_names == {"lookup_previous_payments"}:
        if "lookup_previous_payments" not in returns:
            return ModelResponse(
                parts=[
                    ToolCallPart(
                        "lookup_previous_payments",
                        {
                            "payee": request.get("payee"),
                            "amount": str(request.get("amount")),
                            "currency": request.get("currency", "GBP"),
                            "reference": request.get("source_reference"),
                            "entity": None,
                        },
                    )
                ]
            )
        duplicate = returns["lookup_previous_payments"]["duplicate_found"]
        return _json_response(
            {
                "decision": "blocked" if duplicate else "approved",
                "confidence": 0.94,
                "risk_level": "high" if duplicate else "low",
                "reason_summary": "Duplicate found." if duplicate else "No duplicate found.",
                "duplicate_found": duplicate,
                "requires_human_approval": False,
                "ralio_ready": False,
                "policy_checks": [
                    {
                        "name": "duplicate_check",
                        "status": "failed" if duplicate else "passed",
                        "evidence": "Duplicate found." if duplicate else "No duplicate.",
                        "severity": "high" if duplicate else "low",
                    }
                ],
            }
        )

    if "infer_request_fields" in tool_names:
        if "infer_request_fields" not in returns:
            return ModelResponse(parts=[ToolCallPart("infer_request_fields", {})])
        fields = returns["infer_request_fields"]
        if "check_policy" not in returns:
            return ModelResponse(parts=_specialist_tool_calls(tool_names, fields))
        return _json_response(_specialist_output(request, fields, returns))

    raise AssertionError(f"Unexpected tool set: {tool_names}")


def _specialist_tool_calls(
    tool_names: set[str],
    fields: dict[str, Any],
) -> list[ToolCallPart]:
    calls: list[ToolCallPart] = []
    if "lookup_employee" in tool_names:
        calls.append(ToolCallPart("lookup_employee", {"employee_name": fields["payee"]}))
        calls.append(ToolCallPart("lookup_receipt", {"receipt_id": fields["receipt_id"]}))
    if "lookup_supplier" in tool_names:
        calls.append(ToolCallPart("lookup_supplier", {"supplier_name": fields["payee"]}))
        calls.append(ToolCallPart("lookup_invoice", {"invoice_number": fields["source_reference"]}))
        calls.append(ToolCallPart("lookup_purchase_order", {"po_number": fields["po_number"]}))
    if "lookup_customer" in tool_names:
        calls.append(ToolCallPart("lookup_customer", {"customer_name": fields["payee"]}))
        calls.append(ToolCallPart("lookup_invoice", {"invoice_number": fields["source_reference"]}))
        calls.append(ToolCallPart("lookup_support_ticket", {"ticket_id": fields["support_ticket_id"]}))
        calls.append(
            ToolCallPart(
                "calculate_customer_refund",
                {
                    "customer_id": fields["customer_id"],
                    "invoice_id": fields["invoice_id"],
                    "reason": "overbilling",
                },
            )
        )
    if "lookup_partner" in tool_names:
        calls.append(ToolCallPart("lookup_partner", {"partner_name": fields["payee"]}))
        calls.append(ToolCallPart("lookup_deal", {"deal_id": fields["source_reference"]}))
        calls.append(
            ToolCallPart(
                "calculate_partner_commission",
                {"partner_id": fields["partner_id"], "deal_id": fields["source_reference"]},
            )
        )
    calls.append(
        ToolCallPart(
            "check_policy",
            {
                "request_type": request_type_from_tools(tool_names),
                "amount": fields["amount"],
                "category": fields.get("category", "*"),
            },
        )
    )
    calls.append(
        ToolCallPart(
            "lookup_previous_payments",
            {
                "payee": fields["payee"],
                "amount": fields["amount"],
                "currency": fields["currency"],
                "reference": fields["source_reference"],
                "entity": fields.get("employee_id")
                or fields.get("supplier_id")
                or fields.get("customer_id")
                or fields.get("partner_id"),
            },
        )
    )
    return calls


def _specialist_output(
    request: dict[str, Any],
    fields: dict[str, Any],
    returns: dict[str, Any],
) -> dict[str, Any]:
    policy = returns["check_policy"]
    if policy["blocked"]:
        decision = "blocked"
    elif policy["requires_approval"]:
        decision = "needs_approval"
    else:
        decision = "approved"
    request_type = request["request_type"]
    return {
        "decision": decision,
        "confidence": 0.93,
        "request_type": request_type,
        "amount": fields["amount"],
        "currency": fields["currency"],
        "payee": fields["payee"],
        "source_reference": fields["source_reference"],
        "reason_summary": f"{request_type} investigation complete.",
        "risk_level": "medium" if decision == "needs_approval" else "low",
        "requires_human_approval": decision == "needs_approval",
        "ralio_ready": decision == "approved",
        "missing_information": [],
        "policy_checks": [
            {
                "name": "policy_threshold",
                "status": policy["status"],
                "evidence": policy["evidence"],
                "severity": "medium" if policy["requires_approval"] else "low",
            }
        ],
    }


def request_type_from_tools(tool_names: set[str]) -> str:
    if "lookup_employee" in tool_names:
        return "employee_reimbursement"
    if "lookup_supplier" in tool_names:
        return "supplier_invoice"
    if "lookup_customer" in tool_names:
        return "customer_refund"
    return "partner_commission"


def _json_response(payload: dict[str, Any]) -> ModelResponse:
    return ModelResponse(parts=[TextPart(json.dumps(payload, default=str))])


def _tool_returns(messages: list[ModelMessage]) -> dict[str, Any]:
    returns: dict[str, Any] = {}
    for message in messages:
        for part in getattr(message, "parts", []):
            if getattr(part, "part_kind", "") == "tool-return":
                returns[part.tool_name] = part.content
    return returns


def _request_from_messages(messages: list[ModelMessage]) -> dict[str, Any]:
    for message in messages:
        for part in getattr(message, "parts", []):
            content = getattr(part, "content", None)
            if isinstance(content, str) and "Request JSON:" in content:
                raw = content.split("Request JSON:\n", 1)[1].split("\n\n", 1)[0]
                return json.loads(raw)
    raise AssertionError("Request JSON not found in model prompt.")


def test_demo_acceptance_flow(tmp_path: Path) -> None:
    service = make_service(tmp_path)
    requests = service.list_requests()
    assert len(requests) == 4

    sarah = requests[0]
    sarah_decision = service.investigate_request(sarah.id)
    assert sarah_decision.decision == Decision.APPROVED
    sarah_payment = service.execute_approved_payment(sarah.id)
    assert sarah_payment.status == "completed"

    supplier = requests[1]
    supplier_decision = service.investigate_request(supplier.id)
    assert supplier_decision.decision == Decision.NEEDS_APPROVAL
    with pytest.raises(TrustMeServiceError):
        service.execute_approved_payment(supplier.id)
    service.approve_request(supplier.id, approved_by="finance")
    supplier_payment = service.execute_approved_payment(supplier.id)
    assert supplier_payment.status == "completed"

    refund = requests[2]
    refund_decision = service.investigate_request(refund.id)
    assert refund_decision.decision == Decision.APPROVED
    refund_payment = service.execute_approved_payment(refund.id)
    assert refund_payment.status == "completed"

    duplicate = requests[3]
    duplicate_decision = service.investigate_request(duplicate.id)
    assert duplicate_decision.decision == Decision.BLOCKED
    with pytest.raises(TrustMeServiceError):
        service.execute_approved_payment(duplicate.id)
    assert service.get_payment_status(duplicate.id) is None


def test_fastapi_lifecycle_uses_shared_service(tmp_path: Path) -> None:
    service = make_service(tmp_path)
    app = create_app()
    app.dependency_overrides[get_service] = lambda: service
    client = TestClient(app)

    created = client.post(
        "/api/requests",
        json={
            "title": "Test request",
            "type": "unknown",
            "payee": "Test Payee",
            "amount": 0,
            "currency": "GBP",
            "description": "Refund BrightPath £260 because we overbilled them."
        },
    )
    assert created.status_code == 200
    request_id = created.json()["id"]

    investigated = client.post(f"/api/requests/{request_id}/investigate")
    assert investigated.status_code == 200
    assert investigated.json()["decision"] == "approved"

    executed = client.post(f"/api/requests/{request_id}/execute")
    assert executed.status_code == 200
    assert executed.json()["ralioStatus"] == "paid"

    audit = client.get(f"/api/requests/{request_id}/audit")
    assert audit.status_code == 200
    assert any("Ralio adapter returned" in event["message"] for event in audit.json())


@pytest.mark.anyio
async def test_mcp_tools_use_shared_service(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    service = make_service(tmp_path)
    monkeypatch.setattr(mcp_server, "get_service", lambda: service)
    mcp = mcp_server.create_mcp_server()

    tools = await mcp.list_tools()
    assert {tool.name for tool in tools} >= {
        "create_money_out_request",
        "list_money_out_requests",
        "get_money_out_request",
        "investigate_money_out_request",
        "approve_money_out_request",
        "reject_money_out_request",
        "execute_approved_payment",
        "get_payment_audit_trail",
        "get_ralio_payment_status",
    }

    created = await mcp.call_tool(
        "create_money_out_request",
        {"description": "Refund BrightPath £260 because we overbilled them."},
    )
    created = _mcp_payload(created)
    request_id = created["id"]

    decision = _mcp_payload(
        await mcp.call_tool("investigate_money_out_request", {"request_id": request_id})
    )
    assert decision["decision"] == "approved"

    payment = _mcp_payload(
        await mcp.call_tool("execute_approved_payment", {"request_id": request_id})
    )
    assert payment["status"] == "completed"

    audit = _mcp_payload(
        await mcp.call_tool("get_payment_audit_trail", {"request_id": request_id})
    )
    assert any("Ralio adapter returned" in event["summary"] for event in audit)


def _mcp_payload(result: Any) -> Any:
    if isinstance(result, tuple) and len(result) == 2:
        payload = result[1]
        if isinstance(payload, dict) and set(payload) == {"result"}:
            return payload["result"]
        return payload
    return result


def test_output_validator_retries_invalid_route(tmp_path: Path) -> None:
    repository = SQLiteRepository(tmp_path / "trustme.sqlite3")
    tools = BusinessTools(CsvDataStore(Path("backend/app/data")), repository)
    request = MoneyOutRequest(
        description="Pay Northstar Design £420 for invoice INV-2042."
    )
    repository.add_request(request)
    calls = {"count": 0}

    def invalid_then_valid(
        messages: list[ModelMessage],
        info: AgentInfo,
    ) -> ModelResponse:
        returns = _tool_returns(messages)
        if "classify_request" not in returns:
            return ModelResponse(parts=[ToolCallPart("classify_request", {})])
        calls["count"] += 1
        if calls["count"] == 1:
            return _json_response(
                {
                    "request_type": "supplier_invoice",
                    "selected_agent": None,
                    "confidence": 0.9,
                    "missing_information": [],
                    "evidence_summary": "Invalid missing selected agent.",
                }
            )
        return _json_response(
            {
                "request_type": "supplier_invoice",
                "selected_agent": "supplier_invoice_agent",
                "confidence": 0.9,
                "missing_information": [],
                "evidence_summary": "Valid route.",
            }
        )

    agents = build_trustme_agents(FunctionModel(invalid_then_valid))
    deps = TrustMeAgentDeps(request=request, tools=tools, repository=repository)
    route, _calls = run_orchestrator(agents, deps)

    assert route.selected_agent == "supplier_invoice_agent"
    assert calls["count"] == 2
