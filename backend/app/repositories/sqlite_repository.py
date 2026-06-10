"""SQLite persistence for mutable TrustMe state."""

from __future__ import annotations

import sqlite3
from collections.abc import Iterable
from pathlib import Path

from backend.app.models import (
    AgentDecision,
    AuditEvent,
    MoneyOutRequest,
    PaymentExecution,
    RequestStatus,
    utc_now,
)


class SQLiteRepository:
    """Small repository with JSON payload columns for stable demo velocity."""

    def __init__(self, path: Path | str) -> None:
        self.path = Path(path)
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self._init_schema()

    def _connect(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_schema(self) -> None:
        with self._connect() as conn:
            conn.executescript(
                """
                CREATE TABLE IF NOT EXISTS requests (
                    id TEXT PRIMARY KEY,
                    payload TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS decisions (
                    request_id TEXT PRIMARY KEY,
                    payload TEXT NOT NULL,
                    created_at TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS audit_events (
                    id TEXT PRIMARY KEY,
                    request_id TEXT NOT NULL,
                    payload TEXT NOT NULL,
                    created_at TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS payments (
                    request_id TEXT PRIMARY KEY,
                    idempotency_key TEXT NOT NULL UNIQUE,
                    payload TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS approvals (
                    request_id TEXT PRIMARY KEY,
                    approved_by TEXT NOT NULL,
                    approved_at TEXT NOT NULL,
                    note TEXT
                );
                """
            )

    def add_request(self, request: MoneyOutRequest) -> MoneyOutRequest:
        with self._connect() as conn:
            conn.execute(
                """
                INSERT INTO requests (id, payload, created_at, updated_at)
                VALUES (?, ?, ?, ?)
                """,
                (
                    request.id,
                    request.model_dump_json(),
                    request.created_at.isoformat(),
                    request.updated_at.isoformat(),
                ),
            )
        return request

    def update_request(self, request: MoneyOutRequest) -> MoneyOutRequest:
        request.updated_at = utc_now()
        with self._connect() as conn:
            conn.execute(
                "UPDATE requests SET payload = ?, updated_at = ? WHERE id = ?",
                (request.model_dump_json(), request.updated_at.isoformat(), request.id),
            )
        return request

    def get_request(self, request_id: str) -> MoneyOutRequest | None:
        with self._connect() as conn:
            row = conn.execute(
                "SELECT payload FROM requests WHERE id = ?", (request_id,)
            ).fetchone()
        if row is None:
            return None
        return MoneyOutRequest.model_validate_json(row["payload"])

    def list_requests(self) -> list[MoneyOutRequest]:
        with self._connect() as conn:
            rows = conn.execute(
                "SELECT payload FROM requests ORDER BY created_at ASC"
            ).fetchall()
        return [MoneyOutRequest.model_validate_json(row["payload"]) for row in rows]

    def request_count(self) -> int:
        with self._connect() as conn:
            row = conn.execute("SELECT COUNT(*) AS count FROM requests").fetchone()
        return int(row["count"])

    def save_decision(self, decision: AgentDecision) -> AgentDecision:
        with self._connect() as conn:
            conn.execute(
                """
                INSERT INTO decisions (request_id, payload, created_at)
                VALUES (?, ?, ?)
                ON CONFLICT(request_id) DO UPDATE SET
                    payload = excluded.payload,
                    created_at = excluded.created_at
                """,
                (
                    decision.request_id,
                    decision.model_dump_json(),
                    decision.created_at.isoformat(),
                ),
            )
        return decision

    def get_decision(self, request_id: str) -> AgentDecision | None:
        with self._connect() as conn:
            row = conn.execute(
                "SELECT payload FROM decisions WHERE request_id = ?", (request_id,)
            ).fetchone()
        if row is None:
            return None
        return AgentDecision.model_validate_json(row["payload"])

    def add_audit_event(self, event: AuditEvent) -> AuditEvent:
        with self._connect() as conn:
            conn.execute(
                """
                INSERT INTO audit_events (id, request_id, payload, created_at)
                VALUES (?, ?, ?, ?)
                """,
                (
                    event.id,
                    event.request_id,
                    event.model_dump_json(),
                    event.created_at.isoformat(),
                ),
            )
        return event

    def list_audit_events(self, request_id: str) -> list[AuditEvent]:
        with self._connect() as conn:
            rows = conn.execute(
                """
                SELECT payload FROM audit_events
                WHERE request_id = ?
                ORDER BY created_at ASC
                """,
                (request_id,),
            ).fetchall()
        return [AuditEvent.model_validate_json(row["payload"]) for row in rows]

    def save_payment(self, payment: PaymentExecution) -> PaymentExecution:
        with self._connect() as conn:
            conn.execute(
                """
                INSERT INTO payments (
                    request_id, idempotency_key, payload, created_at, updated_at
                )
                VALUES (?, ?, ?, ?, ?)
                ON CONFLICT(request_id) DO UPDATE SET
                    payload = excluded.payload,
                    updated_at = excluded.updated_at
                """,
                (
                    payment.request_id,
                    payment.idempotency_key,
                    payment.model_dump_json(),
                    payment.created_at.isoformat(),
                    payment.updated_at.isoformat(),
                ),
            )
        return payment

    def get_payment(self, request_id: str) -> PaymentExecution | None:
        with self._connect() as conn:
            row = conn.execute(
                "SELECT payload FROM payments WHERE request_id = ?", (request_id,)
            ).fetchone()
        if row is None:
            return None
        return PaymentExecution.model_validate_json(row["payload"])

    def payment_exists_for_idempotency_key(self, key: str) -> bool:
        with self._connect() as conn:
            row = conn.execute(
                "SELECT 1 FROM payments WHERE idempotency_key = ?", (key,)
            ).fetchone()
        return row is not None

    def approve_request(
        self,
        request_id: str,
        *,
        approved_by: str,
        note: str | None = None,
    ) -> None:
        approved_at = utc_now().isoformat()
        with self._connect() as conn:
            conn.execute(
                """
                INSERT INTO approvals (request_id, approved_by, approved_at, note)
                VALUES (?, ?, ?, ?)
                ON CONFLICT(request_id) DO UPDATE SET
                    approved_by = excluded.approved_by,
                    approved_at = excluded.approved_at,
                    note = excluded.note
                """,
                (request_id, approved_by, approved_at, note),
            )

    def has_approval(self, request_id: str) -> bool:
        with self._connect() as conn:
            row = conn.execute(
                "SELECT 1 FROM approvals WHERE request_id = ?", (request_id,)
            ).fetchone()
        return row is not None

    def previous_matching_requests(
        self,
        *,
        request_id: str,
        payee: str | None,
        amount: str | None,
        currency: str,
        source_reference: str | None,
    ) -> list[MoneyOutRequest]:
        current = self.get_request(request_id)
        if current is None:
            return []
        matches: list[MoneyOutRequest] = []
        ignored_statuses = {
            RequestStatus.BLOCKED.value,
            RequestStatus.REJECTED.value,
        }
        for candidate in self.list_requests():
            if candidate.id == request_id:
                continue
            if candidate.created_at >= current.created_at:
                continue
            if candidate.status in ignored_statuses:
                continue
            if not _same_normalized(candidate.payee, payee):
                continue
            if str(candidate.amount) != str(amount):
                continue
            if candidate.currency != currency:
                continue
            if (candidate.source_reference or "") != (source_reference or ""):
                continue
            matches.append(candidate)
        return matches

    def successful_payments(self) -> Iterable[PaymentExecution]:
        with self._connect() as conn:
            rows = conn.execute("SELECT payload FROM payments").fetchall()
        for row in rows:
            yield PaymentExecution.model_validate_json(row["payload"])


def _same_normalized(left: str | None, right: str | None) -> bool:
    return (left or "").casefold().strip() == (right or "").casefold().strip()

