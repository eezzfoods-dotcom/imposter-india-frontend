"""Configuration schema and loader for ReachEngine.

A single ``config.yaml`` drives every setting (SYS-01). Values are validated
against typed pydantic models so a bad config fails fast with a clear error
instead of surfacing deep inside the pipeline.

Design rules baked in here:

* **No secrets in config (SYS-06).** This file only ever references *paths*
  to encrypted token vaults or *names* of environment variables / keyring
  entries. Tokens and API keys never live in ``config.yaml``.
* **Defaults are the documented contract.** Every field has a sensible
  default so ``load_config()`` works even with an empty (or missing) file;
  ``config.example.yaml`` mirrors these defaults with comments.
* **Paths are normalised** — ``~`` and ``$ENV`` are expanded so the same
  config works across machines and shells (C1: Windows PowerShell primary).
"""

from __future__ import annotations

import os
from pathlib import Path
from typing import Any, List, Optional

import yaml
from pydantic import BaseModel, Field, field_validator

# --------------------------------------------------------------------------- #
# Constants
# --------------------------------------------------------------------------- #

#: Environment variable that may point at a config file.
CONFIG_ENV_VAR = "REACHENGINE_CONFIG"

#: Filenames searched (in order) in the current working directory when no
#: explicit path is supplied.
DEFAULT_CONFIG_FILENAMES = ("config.yaml", "config.yml")

#: Languages the analysis stage is expected to support (ANL-02).
SUPPORTED_LANGUAGES = ("en", "ta", "te", "ml", "hi")

#: Platforms in scope for v1 (see BRD §4.1 / §4.3).
SUPPORTED_PLATFORMS = ("youtube", "youtube_shorts", "instagram", "facebook")


def _expand(value: Any) -> Any:
    """Expand ``~`` and ``$VAR`` in a path-like value, leave others as-is."""
    if isinstance(value, (str, os.PathLike)):
        return os.path.expanduser(os.path.expandvars(str(value)))
    return value


# --------------------------------------------------------------------------- #
# Sub-schemas
# --------------------------------------------------------------------------- #


class PathsConfig(BaseModel):
    """Filesystem locations. All are created by ``reachengine init`` / doctor."""

    inbox: Path = Field(
        default=Path("./inbox"),
        description="Watched folder for new source videos (ING-01).",
    )
    media_root: Path = Field(
        default=Path("./media"),
        description="Root for renders and derived media (git-ignored).",
    )
    cache_dir: Path = Field(
        default=Path("./.cache"),
        description="Analysis artifact cache keyed by content hash (ANL-08).",
    )
    logs_dir: Path = Field(
        default=Path("./logs"),
        description="Structured JSON log output (SYS-02).",
    )
    tokens_dir: Path = Field(
        default=Path("./tokens"),
        description="Encrypted OAuth token vault (git-ignored, SYS-06/07).",
    )
    db_path: Path = Field(
        default=Path("./reachengine.db"),
        description="SQLite metadata database (§9).",
    )

    @field_validator("*", mode="before")
    @classmethod
    def _expand_paths(cls, v: Any) -> Any:
        return _expand(v)

    def all_dirs(self) -> List[Path]:
        """Directories that must exist and be writable (used by doctor)."""
        return [self.inbox, self.media_root, self.cache_dir, self.logs_dir, self.tokens_dir]


class IngestConfig(BaseModel):
    """Ingest stage (ING-*)."""

    allowed_extensions: List[str] = Field(
        default=[".mp4", ".mov", ".mkv", ".webm"],
        description="Container formats accepted for ingest (ING-02).",
    )
    max_duration_hours: float = Field(
        default=4.0, gt=0, description="Reject/flag sources longer than this (ING-04)."
    )
    watch_interval_seconds: int = Field(
        default=30, gt=0, description="Poll interval for the inbox watcher (ING-01)."
    )

    @field_validator("allowed_extensions")
    @classmethod
    def _normalise_ext(cls, v: List[str]) -> List[str]:
        out = []
        for ext in v:
            ext = ext.strip().lower()
            if not ext.startswith("."):
                ext = "." + ext
            out.append(ext)
        return out


class AnalysisConfig(BaseModel):
    """Analysis stage (ANL-*)."""

    whisper_model: str = Field(
        default="base",
        description="faster-whisper model size ('base' or 'small'). Open decision #2.",
    )
    default_language: Optional[str] = Field(
        default=None,
        description="Force a language, or null to auto-detect (ANL-02).",
    )
    scene_threshold: float = Field(
        default=27.0, gt=0, description="PySceneDetect content threshold (ANL-03)."
    )

    @field_validator("default_language")
    @classmethod
    def _known_language(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in SUPPORTED_LANGUAGES:
            raise ValueError(
                f"default_language {v!r} not supported; choose one of {SUPPORTED_LANGUAGES}"
            )
        return v


class ClipConfig(BaseModel):
    """Clip selection (CLP-*)."""

    candidate_count: int = Field(
        default=3, ge=1, description="Ranked candidates to produce (CLP-01)."
    )
    min_seconds: float = Field(default=15.0, gt=0, description="Min clip length (CLP-04).")
    max_seconds: float = Field(default=60.0, gt=0, description="Max clip length (CLP-04).")

    @field_validator("max_seconds")
    @classmethod
    def _max_gt_min(cls, v: float, info) -> float:
        mn = info.data.get("min_seconds")
        if mn is not None and v < mn:
            raise ValueError("clip.max_seconds must be >= clip.min_seconds")
        return v


class RenderConfig(BaseModel):
    """Render stage (RND-*)."""

    aspects: List[str] = Field(
        default=["9:16", "1:1", "4:5", "16:9"],
        description="Aspect variants to render (RND-01).",
    )
    #: Captions must sit inside the middle 60% vertical band (RND-03).
    safe_zone_top_pct: float = Field(default=0.15, ge=0, lt=1)
    safe_zone_bottom_pct: float = Field(default=0.20, ge=0, lt=1)
    loudness_target_lufs: float = Field(
        default=-14.0, description="Normalisation target (RND-06)."
    )
    tamil_font: str = Field(
        default="Noto Sans Tamil",
        description="Unicode-complete Tamil font for burned captions (RND-05).",
    )

    @field_validator("safe_zone_bottom_pct")
    @classmethod
    def _zone_leaves_room(cls, v: float, info) -> float:
        top = info.data.get("safe_zone_top_pct", 0.0)
        if top + v >= 1.0:
            raise ValueError("safe zone top+bottom reserved margins must leave a middle band")
        return v


class PublishConfig(BaseModel):
    """Publishing (PUB-*)."""

    #: YouTube Data API daily quota (C3). Upload ~1,600 units => ~6/day.
    youtube_daily_quota_units: int = Field(default=10_000, gt=0)
    youtube_upload_cost_units: int = Field(default=1_600, gt=0)
    stagger_minutes: int = Field(
        default=15, ge=0, description="Gap between platforms (PUB-10)."
    )
    max_retry_attempts: int = Field(
        default=5, ge=1, description="Retry queue ceiling (PUB-07)."
    )
    dry_run: bool = Field(
        default=True, description="Default to render-only; publish nothing (RND-11)."
    )


class SchedulingConfig(BaseModel):
    """Scheduling & timing (SCH-*)."""

    timezone: str = Field(default="Asia/Kolkata", description="Display timezone (NFR-05).")
    cold_start_min_posts: int = Field(
        default=25, ge=1, description="Posts required before own model (SCH-03/04)."
    )


class AIConfig(BaseModel):
    """LLM provider selection (open decision #1). Keys come from env/keyring."""

    provider: str = Field(default="claude", description="'claude' or 'gemini'.")
    #: Name of the env var / keyring entry holding the API key — NOT the key.
    api_key_env: str = Field(default="ANTHROPIC_API_KEY")

    @field_validator("provider")
    @classmethod
    def _known_provider(cls, v: str) -> str:
        if v not in ("claude", "gemini"):
            raise ValueError("ai.provider must be 'claude' or 'gemini'")
        return v


class LoggingConfig(BaseModel):
    """Structured logging (SYS-02)."""

    level: str = Field(default="INFO")
    json_to_file: bool = Field(default=True)
    console: bool = Field(default=True)

    @field_validator("level")
    @classmethod
    def _valid_level(cls, v: str) -> str:
        v = v.upper()
        if v not in ("DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"):
            raise ValueError(f"invalid log level {v!r}")
        return v


class SystemConfig(BaseModel):
    """System & ops (SYS-*)."""

    min_free_disk_gb: float = Field(
        default=5.0, ge=0, description="Doctor warns below this (SYS-04)."
    )
    render_retention_days: int = Field(
        default=14, ge=0, description="Purge intermediate renders older than this (SYS-09)."
    )
    backup_db_before_migration: bool = Field(default=True)  # SYS-08


# --------------------------------------------------------------------------- #
# Root schema
# --------------------------------------------------------------------------- #


class AppConfig(BaseModel):
    """Top-level ReachEngine configuration."""

    model_config = {"extra": "forbid"}  # reject typo'd/unknown keys early

    paths: PathsConfig = Field(default_factory=PathsConfig)
    ingest: IngestConfig = Field(default_factory=IngestConfig)
    analysis: AnalysisConfig = Field(default_factory=AnalysisConfig)
    clip: ClipConfig = Field(default_factory=ClipConfig)
    render: RenderConfig = Field(default_factory=RenderConfig)
    publish: PublishConfig = Field(default_factory=PublishConfig)
    scheduling: SchedulingConfig = Field(default_factory=SchedulingConfig)
    ai: AIConfig = Field(default_factory=AIConfig)
    logging: LoggingConfig = Field(default_factory=LoggingConfig)
    system: SystemConfig = Field(default_factory=SystemConfig)


class ConfigError(Exception):
    """Raised when a config file cannot be found, parsed, or validated."""


# --------------------------------------------------------------------------- #
# Loader
# --------------------------------------------------------------------------- #


def find_config_path(explicit: Optional[str | os.PathLike] = None) -> Optional[Path]:
    """Resolve which config file to load.

    Order of precedence:
      1. ``explicit`` argument (if given).
      2. ``$REACHENGINE_CONFIG`` environment variable.
      3. ``config.yaml`` / ``config.yml`` in the current working directory.

    Returns ``None`` if nothing is found (callers fall back to defaults).
    """
    if explicit is not None:
        return Path(_expand(explicit))

    env = os.environ.get(CONFIG_ENV_VAR)
    if env:
        return Path(_expand(env))

    for name in DEFAULT_CONFIG_FILENAMES:
        candidate = Path.cwd() / name
        if candidate.exists():
            return candidate
    return None


def load_config(path: Optional[str | os.PathLike] = None) -> AppConfig:
    """Load and validate configuration.

    A missing file is *not* an error — defaults are used, which keeps
    ``reachengine doctor`` and first-run flows working before ``init``.
    A file that exists but is malformed or invalid raises :class:`ConfigError`.
    """
    resolved = find_config_path(path)

    if resolved is None:
        return AppConfig()

    if not resolved.exists():
        raise ConfigError(f"config file not found: {resolved}")

    try:
        raw = resolved.read_text(encoding="utf-8")
        data = yaml.safe_load(raw)
    except (OSError, yaml.YAMLError) as exc:
        raise ConfigError(f"could not read/parse {resolved}: {exc}") from exc

    if data is None:  # empty file
        data = {}
    if not isinstance(data, dict):
        raise ConfigError(f"config root must be a mapping, got {type(data).__name__}")

    try:
        return AppConfig.model_validate(data)
    except Exception as exc:  # pydantic ValidationError -> friendly wrapper
        raise ConfigError(f"invalid configuration in {resolved}:\n{exc}") from exc
