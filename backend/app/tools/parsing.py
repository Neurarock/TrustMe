"""Request parsing helpers used before and during agent investigation."""

from __future__ import annotations

import re
from decimal import Decimal

from backend.app.models import RequestType


AMOUNT_RE = re.compile(
    r"(?P<symbol>[£$€])?\s*(?P<amount>\d+(?:\.\d{1,2})?)\s*(?P<code>GBP|USD|EUR)?",
    re.IGNORECASE,
)
INVOICE_RE = re.compile(r"\b[A-Z]{2,4}-\d+\b", re.IGNORECASE)
DEAL_RE = re.compile(r"\bD-\d+\b", re.IGNORECASE)

SYMBOL_TO_CURRENCY = {"£": "GBP", "$": "USD", "€": "EUR"}


def classify_text(description: str) -> RequestType:
    text = description.casefold()
    if any(word in text for word in ("reimburse", "receipt", "expense")):
        return RequestType.EMPLOYEE_REIMBURSEMENT
    if any(word in text for word in ("invoice", "supplier", "vendor", "pay northstar")):
        return RequestType.SUPPLIER_INVOICE
    if any(word in text for word in ("refund", "overbilled", "overbilling", "credit")):
        return RequestType.CUSTOMER_REFUND
    if any(word in text for word in ("commission", "referral", "partner")):
        return RequestType.PARTNER_COMMISSION
    return RequestType.UNKNOWN


def extract_amount_currency(description: str) -> tuple[Decimal | None, str]:
    match = AMOUNT_RE.search(description)
    if match is None:
        return None, "GBP"
    currency = match.group("code")
    symbol = match.group("symbol")
    resolved_currency = (currency or SYMBOL_TO_CURRENCY.get(symbol or "", "GBP")).upper()
    return Decimal(match.group("amount")), resolved_currency


def extract_invoice_number(description: str) -> str | None:
    match = INVOICE_RE.search(description)
    return match.group(0).upper() if match else None


def extract_deal_id(description: str) -> str | None:
    match = DEAL_RE.search(description)
    return match.group(0).upper() if match else None


def infer_category(description: str) -> str:
    text = description.casefold()
    if "lunch" in text or "meal" in text:
        return "client_lunch"
    if "design" in text:
        return "design"
    if "commission" in text or "referral" in text:
        return "commission"
    if "refund" in text or "overbill" in text:
        return "refund"
    return "general"


def normalize_name(value: str | None) -> str:
    return " ".join((value or "").casefold().strip().split())

