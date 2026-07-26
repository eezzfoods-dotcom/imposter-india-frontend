# ReachEngine — Blueprint & Build Status

Living map of the build. Source of truth for requirements is
`BRD_VideoDistributionEngine.md`. Update this file after every phase.

## Architecture (target)

```
CLI (typer) ──► Local Web UI (FastAPI + HTMX)   [Phase 13]
        │
   Orchestrator (job state machine, retry, queue)   [SYS-03]
        │
 Ingest ─ Analyze ─ ClipSelect ─ Render ─ Caption ─ Publish adapters
        │
 Analytics Collector + Normalizer ─► Feedback Learner (best time / best hook)

Storage: SQLite (metadata) + local filesystem (media)
```

## Module layout (current)

```
reachengine/
  config.example.yaml          # documented default config (SYS-01)
  pyproject.toml               # package + `reachengine` entry point
  src/reachengine/
    config.py                  # typed schema + loader
    models.py                  # SQLModel tables (§9)
    db.py                      # engine, init, session, backup (SYS-08)
    logging_setup.py           # JSON logs, job-id context, redaction (SYS-02/06)
    doctor.py                  # environment checks (SYS-04)
    cli.py                     # typer app: version / init / doctor
  tests/                       # config, models, doctor
```

## Phase status

| Phase | Deliverable | Requirements | Status |
|---|---|---|---|
| **0** | Scaffold, config, models, doctor, logging | SYS-01→09 | ✅ Done |
| 1 | Ingest + ffprobe + sidecar YAML + dedupe | ING-01→07 | ⏳ Next |
| 2 | Transcription + scene detect + loudness (cached) | ANL-01→04, 08 | ☐ |
| 3 | Music hook detection (librosa) — primary use case | ANL-05, CLP-06 | ☐ |
| 4 | Clip candidates + LLM scoring + boundary snapping | CLP-01→09 | ☐ |
| 5 | Render: aspects, reframe, safe-zone captions, Tamil font | RND-01→11 | ☐ |
| 6 | Caption/metadata per platform + review gate | CAP-01→10 | ☐ |
| 7 | YouTube OAuth + upload + quota manager | PUB-01→03,06→08,14 | ☐ |
| — | **MVP boundary (0–7)** | | |
| 8 | Meta OAuth + IG Reels + Facebook adapters | PUB-04,05 | ☐ |
| 9 | Scheduler + job queue + retry + staggered publish | PUB-09,10, SCH-01 | ☐ |
| 10 | Analytics collectors + normalizer (non-summed) | ANA-01→10 | ☐ |
| 11 | Best-time recommender + cold-start | SCH-02→07 | ☐ |
| 12 | Feedback learner + A/B reporting | LRN-01→05 | ☐ |
| 13 | Local web UI (FastAPI + HTMX) | UI | ☐ |
| 14 | Owned-audience helpers (WhatsApp copy, Telegram) | OWN-01→04 | ☐ |
| 15 | Evergreen recycle, campaign mode, multi-account | CLP-10, SCH-08/09, PUB-12 | ☐ |

## Phase 0 acceptance (from BRD Appendix A)

- [x] Repo scaffold
- [x] `config.yaml` schema with documented defaults
- [x] SQLModel definitions for all §9 tables
- [x] Structured JSON logging with job IDs
- [x] `.gitignore` per SYS-07 (`tokens/`, `*.env`, `media/`, `.cache/`)
- [x] `reachengine doctor` (ffmpeg/ffprobe/Python/disk/writable dirs/DB)
- [x] Unit tests for the config loader
- [x] `doctor` reports green on a clean machine after setup (FAILs only on
      missing ffmpeg/ffprobe here, which is expected until they're installed)

## Design decisions locked in Phase 0

- **src/ layout** with a `reachengine` package; `python -m reachengine` and the
  `reachengine` console script both work.
- **Fail-fast config**: unknown keys rejected (`extra="forbid"`), cross-field
  validation (clip min/max, safe-zone band, known language/provider).
- **Secrets never in config or logs**: config references env-var *names* and
  vault *paths* only; a redaction filter scrubs log output.
- **UTC everywhere in storage**, IST for display (NFR-05).

## Open decisions (BRD §15)

1. Claude vs Gemini for clip scoring — benchmark in Phase 4.
2. Whisper `base` vs `small` — decide on real hardware in Phase 2.
3. Whether the Phase 13 web UI is worth building vs CLI + CSV export.
