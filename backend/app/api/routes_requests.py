"""Money-out request REST API."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from backend.app.container import get_service
from backend.app.models import CreateMoneyOutRequest
from backend.app.services import TrustMeService, TrustMeServiceError


router = APIRouter(prefix="/api/requests", tags=["requests"])


class ApprovalPayload(BaseModel):
    actor: str = "trustme-demo-approver"
    note: str | None = None


@router.post("")
def create_request(
    payload: CreateMoneyOutRequest,
    service: TrustMeService = Depends(get_service),
) -> dict[str, Any]:
    return service.create_request(payload).model_dump(mode="json")


@router.get("")
def list_requests(service: TrustMeService = Depends(get_service)) -> list[dict[str, Any]]:
    return [request.model_dump(mode="json") for request in service.list_requests()]


@router.get("/{request_id}")
def get_request(
    request_id: str,
    service: TrustMeService = Depends(get_service),
) -> dict[str, Any]:
    try:
        return service.get_request(request_id).model_dump(mode="json")
    except TrustMeServiceError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.post("/{request_id}/investigate")
def investigate_request(
    request_id: str,
    service: TrustMeService = Depends(get_service),
) -> dict[str, Any]:
    try:
        return service.investigate_request(request_id).model_dump(mode="json")
    except TrustMeServiceError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/{request_id}/approve")
def approve_request(
    request_id: str,
    payload: ApprovalPayload = ApprovalPayload(),
    service: TrustMeService = Depends(get_service),
) -> dict[str, Any]:
    try:
        return service.approve_request(
            request_id,
            approved_by=payload.actor,
            note=payload.note,
        ).model_dump(mode="json")
    except TrustMeServiceError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/{request_id}/reject")
def reject_request(
    request_id: str,
    payload: ApprovalPayload = ApprovalPayload(),
    service: TrustMeService = Depends(get_service),
) -> dict[str, Any]:
    try:
        return service.reject_request(
            request_id,
            rejected_by=payload.actor,
            note=payload.note,
        ).model_dump(mode="json")
    except TrustMeServiceError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/{request_id}/execute")
def execute_request(
    request_id: str,
    service: TrustMeService = Depends(get_service),
) -> dict[str, Any]:
    try:
        return service.execute_approved_payment(request_id).model_dump(mode="json")
    except TrustMeServiceError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/{request_id}/audit")
def get_audit(
    request_id: str,
    service: TrustMeService = Depends(get_service),
) -> list[dict[str, Any]]:
    try:
        return [event.model_dump(mode="json") for event in service.get_audit_trail(request_id)]
    except TrustMeServiceError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get("/{request_id}/ralio-status")
def get_ralio_status(
    request_id: str,
    service: TrustMeService = Depends(get_service),
) -> dict[str, Any] | None:
    try:
        service.get_request(request_id)
        payment = service.get_payment_status(request_id)
        return payment.model_dump(mode="json") if payment else None
    except TrustMeServiceError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

