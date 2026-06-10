"""FastAPI entrypoint for TrustMe."""

from __future__ import annotations

from fastapi import FastAPI

from backend.app.api.routes_requests import router as requests_router
from backend.app.api.routes_agents import router as agents_router
from backend.app.api.routes_policy import router as policy_router
from backend.app.settings import get_settings


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title=settings.app_name,
        description="TrustMe multi-agent finance operations backend.",
        version="0.1.0",
    )
    app.include_router(requests_router)
    app.include_router(agents_router)
    app.include_router(policy_router)

    import traceback
    from fastapi import Request
    from fastapi.responses import JSONResponse
    
    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        traceback.print_exc()
        return JSONResponse(
            status_code=500,
            content={"message": "Internal Server Error", "detail": str(exc)},
        )

    @app.get("/health")
    def health() -> dict[str, str]:
        return {"status": "ok"}

    return app


app = create_app()

