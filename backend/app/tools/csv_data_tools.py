"""CSV-backed mock business data tools."""

from __future__ import annotations

import csv
import hashlib
from collections.abc import Callable
from decimal import Decimal
from pathlib import Path
from typing import Any

from backend.app.models import RequestType
from backend.app.repositories.sqlite_repository import SQLiteRepository
from backend.app.tools.parsing import (
    extract_deal_id,
    extract_invoice_number,
    infer_category,
    normalize_name,
)


class CsvDataStore:
    """Load small CSV tables and provide lookup helpers."""

    def __init__(self, data_dir: Path | str) -> None:
        self.data_dir = Path(data_dir)
        self.tables: dict[str, list[dict[str, str]]] = {}

    def rows(self, table: str) -> list[dict[str, str]]:
        if table not in self.tables:
            path = self.data_dir / f"{table}.csv"
            with path.open(newline="", encoding="utf-8") as handle:
                self.tables[table] = list(csv.DictReader(handle))
        return self.tables[table]

    def find_by(
        self,
        table: str,
        predicate: Callable[[dict[str, str]], bool],
    ) -> dict[str, str] | None:
        return next((row for row in self.rows(table) if predicate(row)), None)

    def find_by_name(self, table: str, name_field: str, name: str) -> dict[str, str] | None:
        wanted = normalize_name(name)
        return self.find_by(
            table,
            lambda row: normalize_name(row.get(name_field)) == wanted
            or wanted in normalize_name(row.get(name_field)),
        )


class BusinessTools:
    """Structured tools available to TrustMe agents."""

    def __init__(
        self,
        data: CsvDataStore,
        repository: SQLiteRepository | None = None,
    ) -> None:
        self.data = data
        self.repository = repository

    def classify_request(self, description: str) -> dict[str, Any]:
        from backend.app.tools.parsing import classify_text

        request_type = classify_text(description)
        selected_agent = {
            RequestType.EMPLOYEE_REIMBURSEMENT: "employee_reimbursement_agent",
            RequestType.SUPPLIER_INVOICE: "supplier_invoice_agent",
            RequestType.CUSTOMER_REFUND: "customer_refund_agent",
            RequestType.PARTNER_COMMISSION: "partner_commission_agent",
            RequestType.UNKNOWN: None,
        }[request_type]
        return {
            "request_type": request_type.value,
            "selected_agent": selected_agent,
            "confidence": 0.95 if request_type != RequestType.UNKNOWN else 0.35,
            "missing_information": [] if selected_agent else ["request_type"],
        }

    def lookup_employee(self, employee_name: str) -> dict[str, Any]:
        row = self._find_person("employees", "name", employee_name)
        return {"found": row is not None, "employee": row}

    def lookup_supplier(self, supplier_name: str) -> dict[str, Any]:
        row = self._find_person("suppliers", "name", supplier_name)
        return {"found": row is not None, "supplier": row}

    def lookup_customer(self, customer_name: str) -> dict[str, Any]:
        row = self._find_person("customers", "name", customer_name)
        return {"found": row is not None, "customer": row}

    def lookup_partner(self, partner_name: str) -> dict[str, Any]:
        row = self._find_person("partner_contracts", "partner_name", partner_name)
        return {"found": row is not None, "partner": row}

    def lookup_invoice(self, invoice_number: str) -> dict[str, Any]:
        row = self.data.find_by(
            "invoices",
            lambda item: item.get("invoice_number", "").casefold()
            == invoice_number.casefold(),
        )
        return {"found": row is not None, "invoice": row}

    def lookup_purchase_order(self, po_number: str) -> dict[str, Any]:
        row = self.data.find_by(
            "purchase_orders",
            lambda item: item.get("po_number", "").casefold() == po_number.casefold(),
        )
        return {"found": row is not None, "purchase_order": row}

    def lookup_receipt(self, receipt_id: str) -> dict[str, Any]:
        row = self.data.find_by(
            "receipts",
            lambda item: item.get("receipt_id", "").casefold() == receipt_id.casefold(),
        )
        return {"found": row is not None, "receipt": row}

    def lookup_deal(self, deal_id: str) -> dict[str, Any]:
        row = self.data.find_by(
            "deals",
            lambda item: item.get("deal_id", "").casefold() == deal_id.casefold(),
        )
        return {"found": row is not None, "deal": row}

    def lookup_support_ticket(self, ticket_id: str) -> dict[str, Any]:
        row = self.data.find_by(
            "support_tickets",
            lambda item: item.get("ticket_id", "").casefold() == ticket_id.casefold(),
        )
        return {"found": row is not None, "support_ticket": row}

    def check_policy(
        self,
        request_type: str,
        amount: str | Decimal | None,
        category: str = "*",
    ) -> dict[str, Any]:
        resolved_amount = Decimal(str(amount or "0"))
        canonical_category = canonical_policy_category(category)
        row = self.data.find_by(
            "policies",
            lambda item: item["request_type"] == request_type
            and item["category"] in {canonical_category, "*"},
        )
        if row is None:
            return {
                "found": False,
                "status": "missing",
                "requires_approval": True,
                "blocked": False,
                "evidence": "No policy row matched this request type.",
            }
        auto_threshold = Decimal(row["auto_approval_threshold"])
        approval_threshold = Decimal(row["approval_threshold"])
        hard_limit = Decimal(row["hard_limit"])
        if resolved_amount > hard_limit:
            status = "failed"
            blocked = True
            requires_approval = False
        elif resolved_amount > auto_threshold:
            status = "warning"
            blocked = False
            requires_approval = True
        else:
            status = "passed"
            blocked = False
            requires_approval = False
        return {
            "found": True,
            "status": status,
            "requires_approval": requires_approval,
            "blocked": blocked,
            "auto_approval_threshold": str(auto_threshold),
            "approval_threshold": str(approval_threshold),
            "hard_limit": str(hard_limit),
            "requires_receipt": row["requires_receipt"] == "true",
            "evidence": (
                f"{resolved_amount} against auto {auto_threshold}, "
                f"approval {approval_threshold}, hard {hard_limit}."
            ),
        }

    def calculate_customer_refund(
        self,
        customer_id: str,
        invoice_id: str,
        reason: str,
    ) -> dict[str, Any]:
        invoice = self.data.find_by(
            "invoices",
            lambda item: item.get("invoice_id") == invoice_id
            and item.get("entity_type") == "customer"
            and item.get("entity_id") == customer_id,
        )
        if invoice is None:
            return {"valid": False, "evidence": "Customer invoice not found."}
        amount = invoice.get("overbilled_amount") or "0"
        return {
            "valid": Decimal(amount) > 0 and "overbill" in reason.casefold(),
            "amount": amount,
            "currency": invoice["currency"],
            "evidence": f"Invoice {invoice['invoice_number']} overbilled by {amount}.",
        }

    def calculate_partner_commission(
        self,
        partner_id: str,
        deal_id: str,
    ) -> dict[str, Any]:
        contract = self.data.find_by(
            "partner_contracts",
            lambda item: item.get("partner_id") == partner_id,
        )
        deal = self.data.find_by("deals", lambda item: item.get("deal_id") == deal_id)
        if contract is None or deal is None:
            return {"valid": False, "evidence": "Partner contract or deal missing."}
        amount = Decimal(contract["commission_amount"])
        return {
            "valid": contract["active"] == "true" and deal["status"] == "closed_won",
            "amount": str(amount),
            "currency": deal["currency"],
            "evidence": f"Contract fixed commission is {amount} for deal {deal_id}.",
        }

    def lookup_previous_payments(
        self,
        *,
        request_id: str,
        entity: str | None,
        payee: str | None,
        amount: str | Decimal | None,
        currency: str,
        reference: str | None,
    ) -> dict[str, Any]:
        fingerprint = payment_fingerprint(payee, amount, currency, reference)
        csv_matches = [
            row
            for row in self.data.rows("previous_payments")
            if row.get("fingerprint") == fingerprint
            or (
                normalize_name(row.get("payee")) == normalize_name(payee)
                and row.get("amount") == str(amount)
                and row.get("currency") == currency
                and row.get("source_reference") == (reference or "")
            )
        ]
        request_matches = []
        if self.repository is not None:
            request_matches = self.repository.previous_matching_requests(
                request_id=request_id,
                payee=payee,
                amount=str(amount) if amount is not None else None,
                currency=currency,
                source_reference=reference,
            )
        return {
            "duplicate_found": bool(csv_matches or request_matches),
            "fingerprint": fingerprint,
            "entity": entity,
            "csv_matches": csv_matches,
            "request_matches": [
                {"request_id": request.id, "status": request.status}
                for request in request_matches
            ],
        }

    def infer_request_fields(self, description: str, request_type: str) -> dict[str, Any]:
        """Resolve demo fields from text plus CSV data."""
        from backend.app.tools.parsing import extract_amount_currency

        request_type_value = (
            request_type.value if isinstance(request_type, RequestType) else request_type
        )
        amount, currency = extract_amount_currency(description)
        category = infer_category(description)
        fields: dict[str, Any] = {
            "amount": str(amount) if amount is not None else None,
            "currency": currency,
            "category": category,
            "invoice_number": extract_invoice_number(description),
            "deal_id": extract_deal_id(description),
        }
        text = description.casefold()
        if request_type_value == RequestType.EMPLOYEE_REIMBURSEMENT.value:
            employee = self._match_named_row("employees", "name", text)
            receipt = self.data.find_by("receipts", lambda row: category == row["category"])
            fields.update(
                {
                    "payee": employee["name"] if employee else None,
                    "employee_id": employee["employee_id"] if employee else None,
                    "receipt_id": receipt["receipt_id"] if receipt else None,
                    "source_reference": receipt["receipt_id"] if receipt else None,
                }
            )
        elif request_type_value == RequestType.SUPPLIER_INVOICE.value:
            supplier = self._match_named_row("suppliers", "name", text)
            invoice = (
                self.lookup_invoice(fields["invoice_number"])["invoice"]
                if fields["invoice_number"]
                else None
            )
            fields.update(
                {
                    "payee": supplier["name"] if supplier else None,
                    "supplier_id": supplier["supplier_id"] if supplier else None,
                    "source_reference": fields["invoice_number"],
                    "invoice_id": invoice["invoice_id"] if invoice else None,
                    "po_number": invoice["po_number"] if invoice else None,
                    "ralio_recipient_id": supplier["ralio_recipient_id"]
                    if supplier
                    else None,
                }
            )
        elif request_type_value == RequestType.CUSTOMER_REFUND.value:
            customer = self._match_named_row("customers", "name", text)
            invoice = self.data.find_by(
                "invoices",
                lambda row: row["entity_type"] == "customer"
                and (customer is None or row["entity_id"] == customer["customer_id"]),
            )
            fields.update(
                {
                    "payee": customer["name"] if customer else None,
                    "customer_id": customer["customer_id"] if customer else None,
                    "source_reference": invoice["invoice_number"] if invoice else None,
                    "invoice_id": invoice["invoice_id"] if invoice else None,
                    "support_ticket_id": invoice["support_ticket_id"] if invoice else None,
                    "ralio_recipient_id": customer["ralio_recipient_id"]
                    if customer
                    else None,
                }
            )
        elif request_type_value == RequestType.PARTNER_COMMISSION.value:
            partner = self._match_named_row("partner_contracts", "partner_name", text)
            fields.update(
                {
                    "payee": partner["partner_name"] if partner else None,
                    "partner_id": partner["partner_id"] if partner else None,
                    "source_reference": fields["deal_id"],
                    "ralio_recipient_id": partner["ralio_recipient_id"]
                    if partner
                    else None,
                }
            )
        return fields

    def _find_person(self, table: str, name_field: str, name: str) -> dict[str, str] | None:
        return self.data.find_by_name(table, name_field, name)

    def _match_named_row(
        self,
        table: str,
        name_field: str,
        normalized_text: str,
    ) -> dict[str, str] | None:
        for row in self.data.rows(table):
            full_name = normalize_name(row[name_field])
            first_name = full_name.split(" ")[0]
            if full_name in normalized_text or first_name in normalized_text:
                return row
        return None


def payment_fingerprint(
    payee: str | None,
    amount: str | Decimal | None,
    currency: str,
    source_reference: str | None,
) -> str:
    parts = [
        normalize_name(payee),
        str(amount or ""),
        currency.upper(),
        (source_reference or "").casefold(),
    ]
    return hashlib.sha256("|".join(parts).encode("utf-8")).hexdigest()


def canonical_policy_category(category: str | None) -> str:
    """Map model-friendly category wording onto fixture policy categories."""
    if not category or category == "*":
        return "*"
    normalized = normalize_name(category).replace("/", " ").replace("-", " ")
    if any(word in normalized for word in ("lunch", "meal", "entertainment")):
        return "client_lunch"
    if "commission" in normalized or "referral" in normalized:
        return "commission"
    if "refund" in normalized or "overbill" in normalized:
        return "refund"
    if "design" in normalized:
        return "design"
    return "_".join(normalized.split())
