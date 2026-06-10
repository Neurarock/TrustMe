"""Runtime settings for TrustMe."""

from __future__ import annotations

from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "TrustMe"
    data_dir: Path = Field(
        default=Path("backend/app/data"),
        alias="TRUSTME_DATA_DIR",
    )
    sqlite_path: Path = Field(
        default=Path("backend/trustme.sqlite3"),
        alias="TRUSTME_SQLITE_PATH",
    )
    ralio_mode: str = Field(default="mock", alias="RALIO_MODE")
    ralio_agent_id: str | None = Field(default=None, alias="RALIO_AGENT_ID")
    ralio_api_url: str = Field(default="https://api.ralio.co", alias="RALIO_API_URL")
    openai_api_key: str | None = Field(default=None, alias="OPENAI_API_KEY")
    trustme_openai_model: str = Field(
        default="openai:gpt-5.2",
        alias="TRUSTME_OPENAI_MODEL",
    )
    seed_demo_data: bool = Field(default=True, alias="TRUSTME_SEED_DEMO_DATA")


def get_settings() -> Settings:
    return Settings()
