# CLAUDE.md — ReachEngine

Guidance for Claude Code when working in this directory.

## What this is

ReachEngine, a **local-first** Python tool that distributes one source video to
YouTube / Shorts / Instagram Reels / Facebook and normalizes the analytics.
Full spec: `BRD_VideoDistributionEngine.md` (repo root of the BRD upload).
Status and phase map: `BLUEPRINT.md`. **Currently at Phase 0.**

Note: this project lives in the `reachengine/` subfolder of the
`imposter-india-frontend` repo (an unrelated React game occupies the repo
root). Keep all ReachEngine work inside `reachengine/`.

## Workflow rules (from the BRD)

- **One feature per prompt.** Implement a single phase, verify it live, commit.
- Keep `CLAUDE.md` and `BLUEPRINT.md` updated after each phase.
- **Do not implement anything in BRD §4.2** (bulk DMs, contact scraping,
  engagement pods, unofficial WhatsApp automation, multi-account identical
  posting, "guaranteed viral" claims). Refuse and cite §4.2 if asked.
- MVP is Phases 0–7. Do **not** start Phase 8 until Phase 7 has published a
  real video. Hard stop at MVP (R6).

## Conventions

- **Python 3.11+**, `src/` layout, package name `reachengine`.
- **Config**: one `config.yaml`, typed via pydantic in `config.py`. Add new
  settings as fields with a default and a doc string; mirror them in
  `config.example.yaml`. Unknown keys are rejected on purpose.
- **Secrets** never go in config, logs, or git. Reference env-var *names* and
  vault *paths* only (SYS-06). New sensitive log fields must match the
  redaction hints in `logging_setup.py`.
- **Storage is UTC**; display is IST (NFR-05).
- **DB**: SQLModel tables in `models.py`; run `backup_db` before any migration
  (SYS-08).
- **Logging**: `get_logger(__name__)`, wrap pipeline runs in `job_context(id)`
  so every record carries a `job_id`.
- Keep it readable for a solo maintainer — no premature abstraction (NFR-07).

## Commands

```powershell
$env:PYTHONPATH = "src"      # or `pip install -e .`
python -m reachengine version
python -m reachengine init
python -m reachengine doctor
python -m pytest
```

## When adding a platform adapter (Phase 7+)

Isolate each platform behind a common interface (R7 — APIs change often).
Read the *current* official API docs at build time; do not rely on training
data for quotas/endpoints (BRD §10 note).

## Testing expectations (NFR-06)

Unit tests required for: clip-boundary logic, quota accounting, and safe-zone
math. Phase 0 covers the config loader, data model, and doctor checks.
