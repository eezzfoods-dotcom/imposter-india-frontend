"""Unit tests for the config loader (required by BRD Appendix A)."""

import os

import pytest

from reachengine.config import (
    CONFIG_ENV_VAR,
    AppConfig,
    ConfigError,
    find_config_path,
    load_config,
)


def test_defaults_when_no_file(tmp_path, monkeypatch):
    """A missing config yields fully-populated defaults, not an error."""
    monkeypatch.chdir(tmp_path)
    monkeypatch.delenv(CONFIG_ENV_VAR, raising=False)
    cfg = load_config()
    assert isinstance(cfg, AppConfig)
    assert cfg.clip.candidate_count == 3
    assert cfg.render.loudness_target_lufs == -14.0
    assert cfg.publish.dry_run is True
    assert ".mp4" in cfg.ingest.allowed_extensions


def test_empty_file_is_valid(tmp_path):
    p = tmp_path / "config.yaml"
    p.write_text("", encoding="utf-8")
    cfg = load_config(p)
    assert cfg.scheduling.timezone == "Asia/Kolkata"


def test_partial_override_merges_with_defaults(tmp_path):
    p = tmp_path / "config.yaml"
    p.write_text(
        "clip:\n  candidate_count: 5\nrender:\n  loudness_target_lufs: -16.0\n",
        encoding="utf-8",
    )
    cfg = load_config(p)
    assert cfg.clip.candidate_count == 5
    assert cfg.render.loudness_target_lufs == -16.0
    # Untouched sections keep their defaults.
    assert cfg.publish.max_retry_attempts == 5


def test_extension_normalisation(tmp_path):
    p = tmp_path / "config.yaml"
    p.write_text("ingest:\n  allowed_extensions: ['MP4', 'mov']\n", encoding="utf-8")
    cfg = load_config(p)
    assert cfg.ingest.allowed_extensions == [".mp4", ".mov"]


def test_path_expansion(tmp_path, monkeypatch):
    monkeypatch.setenv("MYROOT", str(tmp_path))
    p = tmp_path / "config.yaml"
    p.write_text("paths:\n  media_root: $MYROOT/media\n", encoding="utf-8")
    cfg = load_config(p)
    assert str(cfg.paths.media_root) == str(tmp_path / "media")


def test_unknown_top_level_key_rejected(tmp_path):
    p = tmp_path / "config.yaml"
    p.write_text("nonsense: 1\n", encoding="utf-8")
    with pytest.raises(ConfigError):
        load_config(p)


def test_invalid_language_rejected(tmp_path):
    p = tmp_path / "config.yaml"
    p.write_text("analysis:\n  default_language: fr\n", encoding="utf-8")
    with pytest.raises(ConfigError):
        load_config(p)


def test_clip_max_must_exceed_min(tmp_path):
    p = tmp_path / "config.yaml"
    p.write_text("clip:\n  min_seconds: 30\n  max_seconds: 10\n", encoding="utf-8")
    with pytest.raises(ConfigError):
        load_config(p)


def test_safe_zone_must_leave_middle_band(tmp_path):
    p = tmp_path / "config.yaml"
    p.write_text(
        "render:\n  safe_zone_top_pct: 0.6\n  safe_zone_bottom_pct: 0.5\n",
        encoding="utf-8",
    )
    with pytest.raises(ConfigError):
        load_config(p)


def test_non_mapping_root_rejected(tmp_path):
    p = tmp_path / "config.yaml"
    p.write_text("- just\n- a\n- list\n", encoding="utf-8")
    with pytest.raises(ConfigError):
        load_config(p)


def test_malformed_yaml_rejected(tmp_path):
    p = tmp_path / "config.yaml"
    p.write_text("clip: [unbalanced\n", encoding="utf-8")
    with pytest.raises(ConfigError):
        load_config(p)


def test_invalid_provider_rejected(tmp_path):
    p = tmp_path / "config.yaml"
    p.write_text("ai:\n  provider: openai\n", encoding="utf-8")
    with pytest.raises(ConfigError):
        load_config(p)


def test_explicit_missing_path_raises(tmp_path):
    with pytest.raises(ConfigError):
        load_config(tmp_path / "does_not_exist.yaml")


def test_find_config_precedence(tmp_path, monkeypatch):
    # Explicit wins over env and cwd.
    explicit = tmp_path / "explicit.yaml"
    explicit.write_text("", encoding="utf-8")
    monkeypatch.setenv(CONFIG_ENV_VAR, str(tmp_path / "env.yaml"))
    assert find_config_path(explicit) == explicit

    # Env var wins over cwd when no explicit path.
    monkeypatch.chdir(tmp_path)
    (tmp_path / "config.yaml").write_text("", encoding="utf-8")
    assert find_config_path() == tmp_path / "env.yaml"

    # Falls back to cwd config.yaml when no explicit and no env.
    monkeypatch.delenv(CONFIG_ENV_VAR, raising=False)
    assert find_config_path() == tmp_path / "config.yaml"


def test_example_config_is_valid():
    """The shipped config.example.yaml must load and validate."""
    from pathlib import Path

    example = Path(__file__).resolve().parents[1] / "config.example.yaml"
    cfg = load_config(example)
    assert isinstance(cfg, AppConfig)
