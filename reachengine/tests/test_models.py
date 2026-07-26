"""Tests for the SQLModel data model and DB helpers (§9, SYS-08)."""

from sqlmodel import select

from reachengine.db import backup_db, init_db, session_scope
from reachengine.models import (
    ALL_TABLES,
    Analysis,
    Clip,
    Job,
    JobState,
    Platform,
    Post,
    PostStatus,
    Render,
    SourceVideo,
)


def test_all_tables_created(tmp_path):
    engine = init_db(tmp_path / "t.db")
    from sqlalchemy import inspect

    names = set(inspect(engine).get_table_names())
    expected = {t.__tablename__ for t in ALL_TABLES}
    assert expected <= names


def test_json_columns_roundtrip(tmp_path):
    engine = init_db(tmp_path / "t.db")
    with session_scope(engine) as s:
        v = SourceVideo(path="a.mp4", hash="deadbeef", duration=120.0)
        s.add(v)
        s.flush()
        a = Analysis(
            video_id=v.id,
            transcript_json={"words": [{"w": "hi", "t": 0.1}]},
            hook_segments_json=[{"start": 1.0, "end": 5.0}],
        )
        s.add(a)

    with session_scope(engine) as s:
        a = s.exec(select(Analysis)).one()
        assert a.transcript_json["words"][0]["w"] == "hi"
        assert a.hook_segments_json[0]["end"] == 5.0


def test_enum_persistence(tmp_path):
    engine = init_db(tmp_path / "t.db")
    with session_scope(engine) as s:
        v = SourceVideo(path="a.mp4", hash="h")
        s.add(v)
        s.flush()
        c = Clip(video_id=v.id, start_s=0, end_s=10)
        s.add(c)
        s.flush()
        r = Render(clip_id=c.id, platform=Platform.YOUTUBE, aspect="9:16", path="r.mp4")
        s.add(r)
        s.flush()
        s.add(Post(render_id=r.id, platform=Platform.YOUTUBE, status=PostStatus.DRAFT))

    with session_scope(engine) as s:
        p = s.exec(select(Post)).one()
        assert p.platform == Platform.YOUTUBE
        assert p.status == PostStatus.DRAFT


def test_job_defaults(tmp_path):
    engine = init_db(tmp_path / "t.db")
    with session_scope(engine) as s:
        s.add(Job(type="ingest", payload_json={"path": "x.mp4"}))
    with session_scope(engine) as s:
        j = s.exec(select(Job)).one()
        assert j.state == JobState.PENDING
        assert j.created_at is not None


def test_backup_db(tmp_path):
    db = tmp_path / "t.db"
    init_db(db)
    dest = backup_db(db)
    assert dest is not None and dest.exists()


def test_backup_missing_db_returns_none(tmp_path):
    assert backup_db(tmp_path / "nope.db") is None
