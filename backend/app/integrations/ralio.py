"""Ralio payment adapters.

TrustMe never exposes Ralio execution as an LLM tool. Services call this adapter
only after deterministic validation succeeds.
"""

from __future__ import annotations

import re
from decimal import Decimal
from typing import Any, Protocol

import httpx

from backend.app.models import MoneyOutRequest, PaymentExecution, PaymentStatus, utc_now
from backend.app.tools.csv_data_tools import payment_fingerprint


PAYMENT_ID_RE = re.compile(r"\b(?:pmt|pay|payment|txn|intent)_[A-Za-z0-9_-]+\b")
APPROVAL_URL_RE = re.compile(r"https://console\.ralio\.co/approve/[A-Za-z0-9_-]+")


class RalioAdapter(Protocol):
    def execute_payment(
        self,
        request: MoneyOutRequest,
        *,
        ralio_recipient_id: str | None = None,
    ) -> PaymentExecution:
        """Execute a validated payment request through Ralio."""


class MockRalioAdapter:
    def execute_payment(
        self,
        request: MoneyOutRequest,
        *,
        ralio_recipient_id: str | None = None,
    ) -> PaymentExecution:
        idempotency_key = build_idempotency_key(request)
        reference = f"mock_ralio_pay_{idempotency_key[:12]}"
        return PaymentExecution(
            request_id=request.id,
            idempotency_key=idempotency_key,
            status=PaymentStatus.COMPLETED,
            ralio_reference_id=reference,
            ralio_conversation_id=request.id,
            ralio_reply=(
                f"Mock Ralio completed {request.currency} {request.amount} "
                f"to {request.payee}."
            ),
            raw_response_summary={
                "mode": "mock",
                "recipient_id": ralio_recipient_id,
                "reference": reference,
            },
        )


class RalioRestChatAdapter:
    """Live Ralio REST Chat adapter using registered local credentials."""

    def __init__(self, *, api_url: str, agent_id: str) -> None:
        self.api_url = api_url.rstrip("/")
        self.agent_id = agent_id

    def execute_payment(
        self,
        request: MoneyOutRequest,
        *,
        ralio_recipient_id: str | None = None,
    ) -> PaymentExecution:
        if not self.agent_id:
            raise RuntimeError("RALIO_AGENT_ID is required for RALIO_MODE=live.")
        try:
            from ralio_sdk import RalioAuth  # type: ignore[import-not-found]  # noqa: PLC0415
        except ImportError as exc:
            raise RuntimeError(
                "Install the Ralio Python SDK (`pip install ralio`) for live mode."
            ) from exc

        url = f"{self.api_url}/api/chat"
        auth = RalioAuth.from_local()
        message = canonical_ralio_instruction(request, ralio_recipient_id)
        payload = {
            "agent_id": self.agent_id,
            "message": message,
            "conversation_id": request.id,
        }
        with httpx.Client(timeout=120) as client:
            response = client.post(
                url,
                headers=auth.dpop_headers("POST", url),
                json=payload,
            )
            response.raise_for_status()
            body = response.json()

        reply = str(body.get("reply") or "")
        approval_url = _first_match(APPROVAL_URL_RE, reply)
        reference = _first_match(PAYMENT_ID_RE, reply)
        status = (
            PaymentStatus.REQUIRES_APPROVAL
            if approval_url
            else PaymentStatus.SUBMITTED
        )
        return PaymentExecution(
            request_id=request.id,
            idempotency_key=build_idempotency_key(request),
            status=status,
            ralio_reference_id=reference,
            ralio_conversation_id=body.get("conversation_id") or request.id,
            ralio_payment_intent_id=_extract_intent_id(body),
            ralio_reply=reply,
            approval_url=approval_url,
            raw_response_summary={
                "reply": reply,
                "conversation_id": body.get("conversation_id"),
                "new_messages": body.get("new_messages", []),
            },
            updated_at=utc_now(),
        )


def build_idempotency_key(request: MoneyOutRequest) -> str:
    return payment_fingerprint(
        payee=f"{request.id}:{request.payee or ''}",
        amount=str(request.amount or ""),
        currency=request.currency,
        source_reference=request.source_reference,
    )


def canonical_ralio_instruction(
    request: MoneyOutRequest,
    ralio_recipient_id: str | None,
) -> str:
    amount = _require(request.amount, "amount")
    payee = _require(request.payee, "payee")
    reference = _require(request.source_reference, "source_reference")
    recipient = ralio_recipient_id or payee
    return (
        "Create a payment intent and execute the payment if it is within your "
        "Ralio guardrails. Use these validated TrustMe fields only: "
        f"amount={Decimal(str(amount))}, currency={request.currency}, "
        f"recipient={recipient}, payee_name={payee}, "
        f"reference={reference}, trustme_request_id={request.id}. "
        "If any value is ambiguous, do not execute and explain what is missing."
    )


def _require(value: Any, name: str) -> Any:
    if value is None or value == "":
        raise RuntimeError(f"Cannot execute payment without {name}.")
    return value


def _first_match(pattern: re.Pattern[str], text: str) -> str | None:
    match = pattern.search(text)
    return match.group(0) if match else None


def _extract_intent_id(body: dict[str, Any]) -> str | None:
    for message in body.get("new_messages", []) or []:
        content = str(message.get("content") or "")
        found = _first_match(PAYMENT_ID_RE, content)
        if found and found.startswith("intent_"):
            return found
    return None

