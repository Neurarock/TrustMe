"""FastAPI entrypoint for TrustMe."""

from __future__ import annotations

from fastapi import FastAPI

from backend.app.api.routes_requests import router as requests_router
from backend.app.settings import get_settings


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title=settings.app_name,
        description="TrustMe multi-agent finance operations backend.",
        version="0.1.0",
    )
    app.include_router(requests_router)

    @app.get("/health")
    def health() -> dict[str, str]:
        return {"status": "ok"}

    return app


app = create_app()

