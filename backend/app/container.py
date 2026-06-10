"""Application wiring for TrustMe."""

from __future__ import annotations

import os
from functools import lru_cache

from backend.app.agents import build_trustme_agents
from backend.app.integrations.ralio import MockRalioAdapter, RalioRestChatAdapter
from backend.app.repositories.sqlite_repository import SQLiteRepository
from backend.app.services import TrustMeService
from backend.app.settings import Settings, get_settings
from backend.app.tools.csv_data_tools import BusinessTools, CsvDataStore


def build_service(settings: Settings | None = None) -> TrustMeService:
    resolved = settings or get_settings()
    if resolved.openai_api_key:
        os.environ.setdefault("OPENAI_API_KEY", resolved.openai_api_key)
    repository = SQLiteRepository(resolved.sqlite_path)
    data = CsvDataStore(resolved.data_dir)
    tools = BusinessTools(data, repository)
    ralio_adapter = (
        MockRalioAdapter()
        if resolved.ralio_mode == "mock"
        else RalioRestChatAdapter(
            api_url=resolved.ralio_api_url,
            agent_id=resolved.ralio_agent_id or "",
        )
    )
    if (
        resolved.trustme_openai_model.startswith(
            ("openai:", "openai-chat:", "openai-responses:")
        )
        and not resolved.openai_api_key
        and not os.getenv("OPENAI_API_KEY")
    ):
        def agents_factory():
            from backend.app.services import TrustMeServiceError

            raise TrustMeServiceError(
                "OPENAI_API_KEY is required to run PydanticAI investigations "
                f"with {resolved.trustme_openai_model}."
            )
    else:
        def agents_factory():
            return build_trustme_agents(resolved.trustme_openai_model)
    service = TrustMeService(
        repository=repository,
        tools=tools,
        agents_factory=agents_factory,
        ralio_adapter=ralio_adapter,
    )
    if resolved.seed_demo_data:
        service.seed_demo_requests()
    return service


@lru_cache(maxsize=1)
def get_service() -> TrustMeService:
    return build_service()
