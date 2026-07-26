"""Tests for the doctor health checks and secret redaction (SYS-04, SYS-06)."""

from reachengine.config import AppConfig
from reachengine.doctor import (
    Status,
    check_binary,
    check_python,
    check_writable_dir,
    run_all_checks,
    summarize,
)
from reachengine.logging_setup import redact


def _config_in(tmp_path):
    return AppConfig.model_validate(
        {
            "paths": {
                "inbox": str(tmp_path / "inbox"),
                "media_root": str(tmp_path / "media"),
                "cache_dir": str(tmp_path / "cache"),
                "logs_dir": str(tmp_path / "logs"),
                "tokens_dir": str(tmp_path / "tokens"),
                "db_path": str(tmp_path / "re.db"),
            }
        }
    )


def test_check_python_ok():
    assert check_python().status is Status.OK


def test_check_binary_missing():
    assert check_binary("definitely-not-a-real-binary-xyz").status is Status.FAIL


def test_check_writable_dir(tmp_path):
    res = check_writable_dir("media", tmp_path / "sub")
    assert res.status is Status.OK
    assert (tmp_path / "sub").exists()


def test_run_all_checks_creates_dirs_and_db(tmp_path):
    cfg = _config_in(tmp_path)
    results = run_all_checks(cfg)
    names = {r.name for r in results}
    assert {"python", "ffmpeg", "ffprobe", "disk_space", "database"} <= names
    assert (tmp_path / "media").exists()
    assert (tmp_path / "re.db").exists()


def test_summarize_precedence():
    from reachengine.doctor import CheckResult

    ok = CheckResult("a", Status.OK)
    warn = CheckResult("b", Status.WARN)
    fail = CheckResult("c", Status.FAIL)
    assert summarize([ok, ok]) is Status.OK
    assert summarize([ok, warn]) is Status.WARN
    assert summarize([ok, warn, fail]) is Status.FAIL


def test_redaction_hides_secrets():
    data = {
        "access_token": "abc123",
        "nested": {"client_secret": "shh", "safe": "visible"},
        "note": "Authorization: Bearer sk-verylongtokenvalue12345",
    }
    red = redact(data)
    assert red["access_token"] == "***REDACTED***"
    assert red["nested"]["client_secret"] == "***REDACTED***"
    assert red["nested"]["safe"] == "visible"
    assert "sk-verylongtokenvalue12345" not in red["note"]
