"""Structured JSON logging with job-ID context (SYS-02, SYS-06).

Every log record is emitted as a single-line JSON object carrying a
``job_id`` so events from a single pipeline run can be traced end to end.
A redaction filter guarantees that anything looking like a secret is never
written to a log file or the console (SYS-06).

Usage::

    from reachengine.logging_setup import configure_logging, get_logger, job_context

    configure_logging(config)
    log = get_logger(__name__)

    with job_context("job_abc123"):
        log.info("ingest.started", extra={"path": "x.mp4"})
"""

from __future__ import annotations

import contextvars
import datetime as _dt
import json
import logging
import re
from contextlib import contextmanager
from pathlib import Path
from typing import Any, Iterator, Optional

# --------------------------------------------------------------------------- #
# Job-ID context
# --------------------------------------------------------------------------- #

_job_id_var: contextvars.ContextVar[Optional[str]] = contextvars.ContextVar(
    "reachengine_job_id", default=None
)


@contextmanager
def job_context(job_id: str) -> Iterator[str]:
    """Bind ``job_id`` to all log records emitted inside the block."""
    token = _job_id_var.set(job_id)
    try:
        yield job_id
    finally:
        _job_id_var.reset(token)


def current_job_id() -> Optional[str]:
    """Return the job id bound to the current context, if any."""
    return _job_id_var.get()


# --------------------------------------------------------------------------- #
# Secret redaction (SYS-06)
# --------------------------------------------------------------------------- #

#: Substrings that, when present in a key name, mark the value as sensitive.
_SECRET_KEY_HINTS = (
    "token",
    "secret",
    "password",
    "passwd",
    "api_key",
    "apikey",
    "access_key",
    "refresh",
    "authorization",
    "client_secret",
    "private_key",
)

#: Bearer-token / long-opaque-string pattern scrubbed from free-text messages.
_BEARER_RE = re.compile(r"(?i)\b(bearer\s+)[A-Za-z0-9._\-]{12,}")
_REDACTED = "***REDACTED***"


def _looks_secret(key: str) -> bool:
    k = key.lower()
    return any(hint in k for hint in _SECRET_KEY_HINTS)


def redact(value: Any) -> Any:
    """Recursively redact secret-looking keys/values from a structure."""
    if isinstance(value, dict):
        return {
            k: (_REDACTED if _looks_secret(str(k)) else redact(v)) for k, v in value.items()
        }
    if isinstance(value, (list, tuple)):
        return type(value)(redact(v) for v in value)
    if isinstance(value, str):
        return _BEARER_RE.sub(lambda m: m.group(1) + _REDACTED, value)
    return value


class RedactionFilter(logging.Filter):
    """Scrub secrets from the message and any structured ``extra`` fields."""

    def filter(self, record: logging.LogRecord) -> bool:
        if isinstance(record.msg, str):
            record.msg = _BEARER_RE.sub(lambda m: m.group(1) + _REDACTED, record.msg)
        for key, val in list(record.__dict__.items()):
            if key in _RESERVED_RECORD_KEYS:
                continue
            if _looks_secret(key):
                record.__dict__[key] = _REDACTED
            else:
                record.__dict__[key] = redact(val)
        return True


# --------------------------------------------------------------------------- #
# JSON formatter
# --------------------------------------------------------------------------- #

# Standard LogRecord attributes we do NOT want to duplicate into the JSON blob;
# everything else attached via ``extra=`` is treated as structured context.
_RESERVED_RECORD_KEYS = {
    "name", "msg", "args", "levelname", "levelno", "pathname", "filename",
    "module", "exc_info", "exc_text", "stack_info", "lineno", "funcName",
    "created", "msecs", "relativeCreated", "thread", "threadName",
    "processName", "process", "taskName",
}


class JsonFormatter(logging.Formatter):
    """Render a :class:`logging.LogRecord` as one line of JSON."""

    def format(self, record: logging.LogRecord) -> str:
        payload: dict[str, Any] = {
            "ts": _dt.datetime.fromtimestamp(
                record.created, tz=_dt.timezone.utc
            ).isoformat(),  # NFR-05: store/emit UTC
            "level": record.levelname,
            "logger": record.name,
            "event": record.getMessage(),
            "job_id": current_job_id(),
        }

        for key, val in record.__dict__.items():
            if key in _RESERVED_RECORD_KEYS or key in payload:
                continue
            payload[key] = _json_safe(val)

        if record.exc_info:
            payload["exc"] = self.formatException(record.exc_info)

        return json.dumps(payload, ensure_ascii=False, default=str)


def _json_safe(value: Any) -> Any:
    try:
        json.dumps(value, default=str)
        return value
    except (TypeError, ValueError):
        return str(value)


# --------------------------------------------------------------------------- #
# Configuration entry point
# --------------------------------------------------------------------------- #

_CONFIGURED = False


def configure_logging(
    config: Any = None,
    *,
    logs_dir: Optional[Path] = None,
    level: Optional[str] = None,
    json_to_file: Optional[bool] = None,
    console: Optional[bool] = None,
    force: bool = False,
) -> None:
    """Install JSON handlers on the root ``reachengine`` logger.

    Accepts an :class:`~reachengine.config.AppConfig` (preferred) or explicit
    overrides. Idempotent unless ``force=True``.
    """
    global _CONFIGURED
    if _CONFIGURED and not force:
        return

    # Pull settings from an AppConfig if provided.
    if config is not None:
        logs_dir = logs_dir or Path(config.paths.logs_dir)
        level = level or config.logging.level
        json_to_file = config.logging.json_to_file if json_to_file is None else json_to_file
        console = config.logging.console if console is None else console

    level = (level or "INFO").upper()
    json_to_file = True if json_to_file is None else json_to_file
    console = True if console is None else console

    root = logging.getLogger("reachengine")
    root.setLevel(level)
    root.propagate = False
    for h in list(root.handlers):
        root.removeHandler(h)

    formatter = JsonFormatter()
    redactor = RedactionFilter()

    if console:
        sh = logging.StreamHandler()
        sh.setFormatter(formatter)
        sh.addFilter(redactor)
        root.addHandler(sh)

    if json_to_file and logs_dir is not None:
        logs_dir = Path(logs_dir)
        logs_dir.mkdir(parents=True, exist_ok=True)
        fh = logging.FileHandler(logs_dir / "reachengine.jsonl", encoding="utf-8")
        fh.setFormatter(formatter)
        fh.addFilter(redactor)
        root.addHandler(fh)

    _CONFIGURED = True


def get_logger(name: str = "reachengine") -> logging.Logger:
    """Return a namespaced logger under the ``reachengine`` root."""
    if name == "reachengine" or name.startswith("reachengine."):
        return logging.getLogger(name)
    return logging.getLogger(f"reachengine.{name}")
