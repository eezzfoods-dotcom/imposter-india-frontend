"""SQLite engine, schema creation, session and backup helpers (§9, SYS-08).

The database is a single local SQLite file (zero-config, portable, free).
``init_db`` creates the schema; ``backup_db`` snapshots the file before any
migration (SYS-08). Sessions are handed out via a context manager.
"""

from __future__ import annotations

import datetime as _dt
import shutil
from contextlib import contextmanager
from pathlib import Path
from typing import Iterator, Optional

from sqlalchemy.engine import Engine
from sqlmodel import Session, SQLModel, create_engine

# Import the models module so every table is registered on SQLModel.metadata
# before create_all() runs.
from . import models  # noqa: F401


def make_engine(db_path: str | Path, *, echo: bool = False) -> Engine:
    """Create a SQLite engine for ``db_path`` (parent dirs created as needed)."""
    db_path = Path(db_path)
    if db_path.parent and not db_path.parent.exists():
        db_path.parent.mkdir(parents=True, exist_ok=True)
    return create_engine(
        f"sqlite:///{db_path}",
        echo=echo,
        connect_args={"check_same_thread": False},
    )


def init_db(db_path: str | Path, *, echo: bool = False) -> Engine:
    """Create all tables (idempotent) and return the engine."""
    engine = make_engine(db_path, echo=echo)
    SQLModel.metadata.create_all(engine)
    return engine


@contextmanager
def session_scope(engine: Engine) -> Iterator[Session]:
    """Provide a transactional session; commit on success, rollback on error."""
    session = Session(engine)
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def backup_db(db_path: str | Path, backup_dir: Optional[str | Path] = None) -> Optional[Path]:
    """Copy the SQLite file to a timestamped backup before migrations (SYS-08).

    Returns the backup path, or ``None`` if the source DB does not exist yet.
    """
    db_path = Path(db_path)
    if not db_path.exists():
        return None
    backup_dir = Path(backup_dir) if backup_dir else db_path.parent / "backups"
    backup_dir.mkdir(parents=True, exist_ok=True)
    stamp = _dt.datetime.now(_dt.timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    dest = backup_dir / f"{db_path.stem}.{stamp}{db_path.suffix}.bak"
    shutil.copy2(db_path, dest)
    return dest
