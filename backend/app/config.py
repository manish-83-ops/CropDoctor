"""CropDoctor AI — Configuration via environment variables.

Uses pydantic-settings for validated, typed configuration.
All secrets come from .env, never hardcoded.
"""

from pathlib import Path
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = True

    # API Keys
    groq_api_key: str = ""
    sarvam_api_key: str = ""
    openweather_api_key: str = ""

    # Model paths
    model_dir: str = "./models"
    model_name: str = "efficientnet_b0"

    # Database
    database_url: str = "sqlite+aiosqlite:///./data/cropdoctor.db"

    # Upload limits
    max_upload_size_mb: int = 10
    allowed_extensions: str = ".jpg,.jpeg,.png,.webp"

    # Inference thresholds
    ood_confidence_threshold: float = 0.4
    ood_entropy_threshold: float = 2.5
    blur_threshold: float = 100.0
    brightness_low_threshold: int = 40
    brightness_high_threshold: int = 220

    @property
    def max_upload_size_bytes(self) -> int:
        return self.max_upload_size_mb * 1024 * 1024

    @property
    def allowed_extensions_list(self) -> list[str]:
        return [ext.strip() for ext in self.allowed_extensions.split(",")]

    @property
    def model_path(self) -> Path:
        return Path(self.model_dir) / self.model_name

    @property
    def tflite_model_path(self) -> Path:
        return Path(self.model_dir) / f"{self.model_name}.tflite"

    @property
    def calibration_path(self) -> Path:
        return Path(self.model_dir) / "calibration.json"


@lru_cache
def get_settings() -> Settings:
    """Cached settings singleton — loaded once, reused everywhere."""
    return Settings()
