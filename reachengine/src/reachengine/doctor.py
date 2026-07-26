"""``reachengine doctor`` — environment health checks (SYS-04).

Verifies the things the pipeline needs before it can do useful work:
ffmpeg/ffprobe on PATH (C6), a supported Python, free disk space,
writable media/cache/log/token directories, and a reachable SQLite DB.

Each check returns a :class:`CheckResult`; the CLI renders them and exits
non-zero if any check FAILs. WARN does not fail the run.
"""

from __future__ import annotations

import shutil
import sys
from dataclasses import dataclass
from enum import Enum
from pathlib import Path
from typing import List

from .config import AppConfig

MIN_PYTHON = (3, 11)


class Status(str, Enum):
    OK = "OK"
    WARN = "WARN"
    FAIL = "FAIL"


@dataclass
class CheckResult:
    name: str
    status: Status
    detail: str = ""

    @property
    def ok(self) -> bool:
        return self.status is not Status.FAIL


# --------------------------------------------------------------------------- #
# Individual checks
# --------------------------------------------------------------------------- #


def check_python() -> CheckResult:
    v = sys.version_info
    got = f"{v.major}.{v.minor}.{v.micro}"
    if (v.major, v.minor) >= MIN_PYTHON:
        return CheckResult("python", Status.OK, f"{got}")
    return CheckResult(
        "python", Status.FAIL, f"{got} < required {MIN_PYTHON[0]}.{MIN_PYTHON[1]}"
    )


def check_binary(name: str) -> CheckResult:
    path = shutil.which(name)
    if path:
        return CheckResult(name, Status.OK, path)
    return CheckResult(name, Status.FAIL, "not found on PATH (see C6: install ffmpeg)")


def check_disk_space(path: Path, min_free_gb: float) -> CheckResult:
    target = path
    # Walk up to the first existing ancestor so we can stat a real mount point.
    while not target.exists() and target != target.parent:
        target = target.parent
    try:
        usage = shutil.disk_usage(target)
    except OSError as exc:
        return CheckResult("disk_space", Status.WARN, f"could not stat {target}: {exc}")
    free_gb = usage.free / (1024**3)
    detail = f"{free_gb:.1f} GB free at {target}"
    if free_gb >= min_free_gb:
        return CheckResult("disk_space", Status.OK, detail)
    return CheckResult(
        "disk_space", Status.WARN, f"{detail} (< {min_free_gb} GB threshold)"
    )


def check_writable_dir(label: str, path: Path) -> CheckResult:
    try:
        path.mkdir(parents=True, exist_ok=True)
        probe = path / ".reachengine_write_test"
        probe.write_text("ok", encoding="utf-8")
        probe.unlink()
    except OSError as exc:
        return CheckResult(f"dir:{label}", Status.FAIL, f"{path} not writable: {exc}")
    return CheckResult(f"dir:{label}", Status.OK, str(path))


def check_database(db_path: Path) -> CheckResult:
    """Verify the DB can be created/opened without committing to a migration."""
    try:
        from .db import init_db

        init_db(db_path)
    except Exception as exc:  # pragma: no cover - defensive
        return CheckResult("database", Status.FAIL, f"cannot init {db_path}: {exc}")
    return CheckResult("database", Status.OK, str(db_path))


# --------------------------------------------------------------------------- #
# Runner
# --------------------------------------------------------------------------- #


def run_all_checks(config: AppConfig, *, check_db: bool = True) -> List[CheckResult]:
    """Run every doctor check and return the results in display order."""
    results: List[CheckResult] = [
        check_python(),
        check_binary("ffmpeg"),
        check_binary("ffprobe"),
        check_disk_space(Path(config.paths.media_root), config.system.min_free_disk_gb),
    ]

    dir_labels = {
        "inbox": config.paths.inbox,
        "media": config.paths.media_root,
        "cache": config.paths.cache_dir,
        "logs": config.paths.logs_dir,
        "tokens": config.paths.tokens_dir,
    }
    for label, path in dir_labels.items():
        results.append(check_writable_dir(label, Path(path)))

    if check_db:
        results.append(check_database(Path(config.paths.db_path)))

    return results


def summarize(results: List[CheckResult]) -> Status:
    """Overall status: FAIL if any failed, else WARN if any warned, else OK."""
    if any(r.status is Status.FAIL for r in results):
        return Status.FAIL
    if any(r.status is Status.WARN for r in results):
        return Status.WARN
    return Status.OK
