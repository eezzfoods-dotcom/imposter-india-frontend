# ReachEngine

**Local-first, multi-platform video distribution & analytics tool.**

Take one source video → auto-select the strongest segment → render
platform-native variants with captions → publish to YouTube / Shorts /
Instagram Reels / Facebook → collect normalized analytics → feed results back
into future clip selection and posting times.

Built to the spec in [`BRD_VideoDistributionEngine.md`](../..), one phase per
prompt. **This directory currently implements Phase 0 only** — the foundation
the rest of the pipeline is built on.

> ReachEngine automates *the creator's own repetitive work*. It does **not**
> automate other people's behaviour. The permanently-excluded features in
> BRD §4.2 (bulk DMs, contact scraping, engagement pods, etc.) will never be
> implemented.

---

## What's in Phase 0

| Piece | Requirement | File |
|---|---|---|
| Config schema + loader | SYS-01 | `src/reachengine/config.py` |
| SQLModel data model (all §9 tables) | §9, SYS-03 | `src/reachengine/models.py` |
| SQLite engine + backup helper | SYS-08 | `src/reachengine/db.py` |
| Structured JSON logging w/ job IDs + secret redaction | SYS-02, SYS-06 | `src/reachengine/logging_setup.py` |
| `reachengine doctor` health check | SYS-04 | `src/reachengine/doctor.py` |
| CLI (`version` / `init` / `doctor`) | — | `src/reachengine/cli.py` |
| `.gitignore` for secrets & media | SYS-07 | `.gitignore` |
| Config-loader unit tests | Appendix A | `tests/` |

## Requirements

- Python 3.11+
- `ffmpeg` / `ffprobe` on `PATH` (checked by `doctor`; needed from Phase 1 on)

## Setup

```powershell
# From this directory
python -m pip install -e .            # or: pip install -e ".[dev]"

reachengine init                      # writes config.yaml, creates dirs + DB
reachengine doctor                    # verifies the environment
```

Without installing, you can run it via the module and `src` path:

```powershell
$env:PYTHONPATH = "src"
python -m reachengine doctor
```

## Commands (Phase 0)

| Command | Purpose |
|---|---|
| `reachengine version` | Print the version. |
| `reachengine init` | Write a starter `config.yaml`, create the configured directories, and initialise the SQLite schema. |
| `reachengine doctor` | Check ffmpeg/ffprobe, Python, disk space, writable dirs, and the DB. Exits non-zero on any FAIL. |

## Configuration

All settings live in a single `config.yaml`. Copy `config.example.yaml` (or run
`reachengine init`) and edit. **No secrets ever go in this file** — it only
references paths to encrypted token vaults and the *names* of environment
variables holding API keys (SYS-06).

## Tests

```powershell
pip install pytest
python -m pytest
```

## Security posture

- `tokens/`, `media/`, `*.env`, `.cache/`, and the DB are git-ignored (SYS-07).
- All log output passes a redaction filter; anything that looks like a token,
  secret, or bearer credential is replaced with `***REDACTED***` (SYS-06).
- Timestamps are stored/emitted in UTC; display conversion to IST happens at
  the presentation layer (NFR-05).

## Roadmap

See [`BLUEPRINT.md`](BLUEPRINT.md) for the full 15-phase plan and current
status. MVP = Phases 0–7.
