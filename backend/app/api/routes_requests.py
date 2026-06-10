"""Money-out request REST API."""

from __future__ import annotations

from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from backend.app.container import get_service
from backend.app.services import TrustMeService, TrustMeServiceError
from backend.app.api import schemas
from backend.app.api.mappers import to_frontend_request, from_create_input


router = APIRouter(prefix="/api/requests", tags=["requests"])


class ApprovalPayload(BaseModel):
    actor: str = "trustme-demo-approver"
    note: str | None = None


@router.post("")
def create_request(
    payload: schemas.CreateRequestInput,
    service: TrustMeService = Depends(get_service),
) -> dict[str, Any]:
    domain_req = from_create_input(payload)
    created = service.create_request(domain_req)
    return to_frontend_request(created, service).model_dump(mode="json", by_alias=True)


@router.get("")
def list_requests(service: TrustMeService = Depends(get_service)) -> List[dict[str, Any]]:
    return [
        to_frontend_request(request, service).model_dump(mode="json", by_alias=True)
        for request in service.list_requests()
    ]


@router.get("/{request_id}")
def get_request(
    request_id: str,
    service: TrustMeService = Depends(get_service),
) -> dict[str, Any]:
    try:
        request = service.get_request(request_id)
        return to_frontend_request(request, service).model_dump(mode="json", by_alias=True)
    except TrustMeServiceError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.post("/{request_id}/investigate")
def investigate_request(
    request_id: str,
    service: TrustMeService = Depends(get_service),
) -> dict[str, Any]:
    try:
        service.investigate_request(request_id)
        request = service.get_request(request_id)
        return to_frontend_request(request, service).model_dump(mode="json", by_alias=True)
    except TrustMeServiceError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/{request_id}/approve")
def approve_request(
    request_id: str,
    payload: ApprovalPayload = ApprovalPayload(),
    service: TrustMeService = Depends(get_service),
) -> dict[str, Any]:
    try:
        service.approve_request(
            request_id,
            approved_by=payload.actor,
            note=payload.note,
        )
        request = service.get_request(request_id)
        return to_frontend_request(request, service).model_dump(mode="json", by_alias=True)
    except TrustMeServiceError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/{request_id}/reject")
def reject_request(
    request_id: str,
    payload: ApprovalPayload = ApprovalPayload(),
    service: TrustMeService = Depends(get_service),
) -> dict[str, Any]:
    try:
        service.reject_request(
            request_id,
            rejected_by=payload.actor,
            note=payload.note,
        )
        request = service.get_request(request_id)
        return to_frontend_request(request, service).model_dump(mode="json", by_alias=True)
    except TrustMeServiceError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/{request_id}/execute")
def execute_request(
    request_id: str,
    service: TrustMeService = Depends(get_service),
) -> dict[str, Any]:
    try:
        service.execute_approved_payment(request_id)
        request = service.get_request(request_id)
        return to_frontend_request(request, service).model_dump(mode="json", by_alias=True)
    except TrustMeServiceError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/{request_id}/audit")
def get_audit(
    request_id: str,
    service: TrustMeService = Depends(get_service),
) -> list[dict[str, Any]]:
    try:
        request = service.get_request(request_id)
        frontend_req = to_frontend_request(request, service)
        return [a.model_dump(mode="json", by_alias=True) for a in frontend_req.audit]
    except TrustMeServiceError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get("/{request_id}/ralio-status")
def get_ralio_status(
    request_id: str,
    service: TrustMeService = Depends(get_service),
) -> dict[str, Any] | None:
    try:
        request = service.get_request(request_id)
        frontend_req = to_frontend_request(request, service)
        return frontend_req.ralio.model_dump(mode="json", by_alias=True)
    except TrustMeServiceError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
