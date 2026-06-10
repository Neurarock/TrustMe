"""TrustMe MCP server.

This is TrustMe's MCP surface. It is intentionally separate from Ralio's MCP
Gateway; tools here call TrustMe services and safety gates.
"""

from __future__ import annotations

from collections.abc import Callable
from functools import partial
from typing import Any

import anyio
from mcp.server.fastmcp import FastMCP

from backend.app.container import get_service
from backend.app.models import CreateMoneyOutRequest
from backend.app.services import TrustMeService


def create_mcp_server() -> FastMCP:
    mcp = FastMCP("TrustMe", json_response=True)

    @mcp.tool()
    async def create_money_out_request(description: str) -> dict[str, Any]:
        """Create a TrustMe money-out request."""

        return await _service_call(
            lambda service: service.create_request(
                CreateMoneyOutRequest(description=description)
            ).model_dump(mode="json")
        )

    @mcp.tool()
    async def list_money_out_requests() -> list[dict[str, Any]]:
        """List TrustMe money-out requests."""

        return await _service_call(
            lambda service: [
                request.model_dump(mode="json") for request in service.list_requests()
            ]
        )

    @mcp.tool()
    async def get_money_out_request(request_id: str) -> dict[str, Any]:
        """Get one TrustMe money-out request."""

        return await _service_call(
            lambda service: service.get_request(request_id).model_dump(mode="json")
        )

    @mcp.tool()
    async def investigate_money_out_request(request_id: str) -> dict[str, Any]:
        """Investigate a TrustMe money-out request."""

        return await _service_call(
            lambda service: service.investigate_request(request_id).model_dump(mode="json")
        )

    @mcp.tool()
    async def approve_money_out_request(
        request_id: str,
        approved_by: str = "trustme-mcp-approver",
        note: str | None = None,
    ) -> dict[str, Any]:
        """Approve a TrustMe request that is awaiting local approval."""

        return await _service_call(
            lambda service: service.approve_request(
                request_id,
                approved_by=approved_by,
                note=note,
            ).model_dump(mode="json")
        )

    @mcp.tool()
    async def reject_money_out_request(
        request_id: str,
        rejected_by: str = "trustme-mcp-approver",
        note: str | None = None,
    ) -> dict[str, Any]:
        """Reject a TrustMe money-out request."""

        return await _service_call(
            lambda service: service.reject_request(
                request_id,
                rejected_by=rejected_by,
                note=note,
            ).model_dump(mode="json")
        )

    @mcp.tool()
    async def execute_approved_payment(request_id: str) -> dict[str, Any]:
        """Execute a TrustMe-approved payment through the Ralio adapter."""

        return await _service_call(
            lambda service: service.execute_approved_payment(request_id).model_dump(
                mode="json"
            )
        )

    @mcp.tool()
    async def get_payment_audit_trail(request_id: str) -> list[dict[str, Any]]:
        """Get TrustMe audit events for a request."""

        return await _service_call(
            lambda service: [
                event.model_dump(mode="json")
                for event in service.get_audit_trail(request_id)
            ]
        )

    @mcp.tool()
    async def get_ralio_payment_status(request_id: str) -> dict[str, Any] | None:
        """Get the Ralio adapter payment status for a TrustMe request."""

        return await _service_call(
            lambda service: (
                payment.model_dump(mode="json")
                if (payment := service.get_payment_status(request_id))
                else None
            )
        )

    return mcp


mcp = create_mcp_server()


async def _service_call(fn: Callable[[TrustMeService], Any]) -> Any:
    return await anyio.to_thread.run_sync(partial(_call_service, fn))


def _call_service(fn: Callable[[TrustMeService], Any]) -> Any:
    return fn(get_service())


def main() -> None:
    mcp.run(transport="stdio")


if __name__ == "__main__":
    main()
