"""SQLModel definitions for the ReachEngine data model (BRD §9).

Every table from the BRD is represented here. Columns holding structured
blobs (transcripts, scene lists, JSON payloads) use SQLModel's JSON column
type so they round-trip Python dicts/lists transparently.

Conventions:
* All timestamps are stored in **UTC** (NFR-05); display conversion to IST
  happens at the presentation layer, never in storage.
* String enums keep status/state columns constrained and self-documenting.
* Foreign keys wire the pipeline together: source_video -> analysis / clip
  -> render / caption -> post -> metric.
"""

from __future__ import annotations

import datetime as _dt
import enum
from typing import Any, Optional

from sqlalchemy import Column
from sqlalchemy import JSON as SA_JSON
from sqlmodel import Field, SQLModel


def utcnow() -> _dt.datetime:
    """Timezone-aware current UTC timestamp (NFR-05)."""
    return _dt.datetime.now(_dt.timezone.utc)


# --------------------------------------------------------------------------- #
# Enums
# --------------------------------------------------------------------------- #


class Platform(str, enum.Enum):
    YOUTUBE = "youtube"
    YOUTUBE_SHORTS = "youtube_shorts"
    INSTAGRAM = "instagram"
    FACEBOOK = "facebook"


class JobState(str, enum.Enum):
    """State machine persisted in SQLite; resumable after crash (SYS-03)."""

    PENDING = "pending"
    RUNNING = "running"
    WAITING = "waiting"        # blocked on quota / schedule
    SUCCEEDED = "succeeded"
    FAILED = "failed"
    CANCELLED = "cancelled"


class PostStatus(str, enum.Enum):
    DRAFT = "draft"
    SCHEDULED = "scheduled"
    PUBLISHING = "publishing"
    PUBLISHED = "published"
    FAILED = "failed"
    ROLLED_BACK = "rolled_back"


class SelectedBy(str, enum.Enum):
    LLM = "llm"
    MUSIC = "music"           # librosa hook detection (CLP-06)
    MANUAL = "manual"         # user-supplied start/end (CLP-09)
    AUTO = "auto"             # --auto rank-1 (CLP-08)


class MetricHorizon(str, enum.Enum):
    """Collection horizons per post (ANA-01)."""

    H1 = "1h"
    H24 = "24h"
    D7 = "7d"
    D30 = "30d"


# --------------------------------------------------------------------------- #
# Tables (BRD §9)
# --------------------------------------------------------------------------- #


class SourceVideo(SQLModel, table=True):
    __tablename__ = "source_video"

    id: Optional[int] = Field(default=None, primary_key=True)
    path: str
    hash: str = Field(index=True, description="Content hash for dedupe (ING-05).")
    duration: Optional[float] = None
    fps: Optional[float] = None
    resolution: Optional[str] = None
    lang: Optional[str] = None
    ingested_at: _dt.datetime = Field(default_factory=utcnow)


class Analysis(SQLModel, table=True):
    __tablename__ = "analysis"

    id: Optional[int] = Field(default=None, primary_key=True)
    video_id: int = Field(foreign_key="source_video.id", index=True)
    transcript_json: Optional[Any] = Field(default=None, sa_column=Column(SA_JSON))
    scenes_json: Optional[Any] = Field(default=None, sa_column=Column(SA_JSON))
    loudness_json: Optional[Any] = Field(default=None, sa_column=Column(SA_JSON))
    faces_json: Optional[Any] = Field(default=None, sa_column=Column(SA_JSON))
    hook_segments_json: Optional[Any] = Field(default=None, sa_column=Column(SA_JSON))
    created_at: _dt.datetime = Field(default_factory=utcnow)


class Clip(SQLModel, table=True):
    __tablename__ = "clip"

    id: Optional[int] = Field(default=None, primary_key=True)
    video_id: int = Field(foreign_key="source_video.id", index=True)
    start_s: float
    end_s: float
    hook_score: Optional[float] = None       # 0-100 (CLP-07)
    reason: Optional[str] = None
    selected_by: Optional[SelectedBy] = None


class Render(SQLModel, table=True):
    __tablename__ = "render"

    id: Optional[int] = Field(default=None, primary_key=True)
    clip_id: int = Field(foreign_key="clip.id", index=True)
    platform: Platform
    aspect: str
    path: str
    filesize: Optional[int] = None
    duration: Optional[float] = None
    preset: Optional[str] = None


class Caption(SQLModel, table=True):
    __tablename__ = "caption"

    id: Optional[int] = Field(default=None, primary_key=True)
    clip_id: int = Field(foreign_key="clip.id", index=True)
    platform: Platform
    variant: int = Field(default=0, description="A/B variant index (CAP-08).")
    language: Optional[str] = None
    title: Optional[str] = None
    body: Optional[str] = None
    hashtags: Optional[Any] = Field(default=None, sa_column=Column(SA_JSON))


class Post(SQLModel, table=True):
    __tablename__ = "post"

    id: Optional[int] = Field(default=None, primary_key=True)
    render_id: int = Field(foreign_key="render.id", index=True)
    caption_id: Optional[int] = Field(default=None, foreign_key="caption.id")
    platform: Platform = Field(index=True)
    remote_id: Optional[str] = None          # platform-side post id
    permalink: Optional[str] = None
    scheduled_at: Optional[_dt.datetime] = None
    published_at: Optional[_dt.datetime] = None
    status: PostStatus = Field(default=PostStatus.DRAFT, index=True)
    attempt_count: int = Field(default=0)     # retry accounting (PUB-07)
    error: Optional[str] = None


class Metric(SQLModel, table=True):
    __tablename__ = "metric"

    id: Optional[int] = Field(default=None, primary_key=True)
    post_id: int = Field(foreign_key="post.id", index=True)
    collected_at: _dt.datetime = Field(default_factory=utcnow)
    horizon: MetricHorizon
    views: Optional[int] = None
    watch_seconds: Optional[float] = None
    avg_view_duration: Optional[float] = None
    reach: Optional[int] = None
    likes: Optional[int] = None
    comments: Optional[int] = None
    shares: Optional[int] = None
    saves: Optional[int] = None
    retention_3s_pct: Optional[float] = None


class Account(SQLModel, table=True):
    __tablename__ = "account"

    id: Optional[int] = Field(default=None, primary_key=True)
    platform: Platform = Field(index=True)
    handle: str
    #: Reference (path/keyring name) to the encrypted token — never the token
    #: itself (SYS-06). The vault lives under paths.tokens_dir.
    token_ref: Optional[str] = None
    quota_used_today: int = Field(default=0)   # YouTube unit accounting (PUB-06)
    quota_reset_at: Optional[_dt.datetime] = None


class Job(SQLModel, table=True):
    __tablename__ = "job"

    id: Optional[int] = Field(default=None, primary_key=True)
    type: str = Field(index=True)
    state: JobState = Field(default=JobState.PENDING, index=True)
    payload_json: Optional[Any] = Field(default=None, sa_column=Column(SA_JSON))
    created_at: _dt.datetime = Field(default_factory=utcnow)
    updated_at: _dt.datetime = Field(default_factory=utcnow)
    error: Optional[str] = None


class Insight(SQLModel, table=True):
    __tablename__ = "insight"

    id: Optional[int] = Field(default=None, primary_key=True)
    kind: str = Field(index=True)             # e.g. "best_time", "hook_pattern"
    platform: Optional[Platform] = None
    payload_json: Optional[Any] = Field(default=None, sa_column=Column(SA_JSON))
    sample_size: int = Field(default=0)       # always shown with insight (LRN-05)
    computed_at: _dt.datetime = Field(default_factory=utcnow)


#: Every table, in dependency order (handy for tests and migrations).
ALL_TABLES = (
    SourceVideo, Analysis, Clip, Render, Caption, Post, Metric, Account, Job, Insight,
)
