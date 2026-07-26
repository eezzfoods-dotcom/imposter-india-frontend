"""ReachEngine command-line interface (Typer).

Phase 0 ships three commands:

* ``reachengine version``  — print the version.
* ``reachengine init``     — scaffold config + directories + SQLite schema.
* ``reachengine doctor``   — run environment health checks (SYS-04).

Pipeline commands (ingest/analyze/clip/render/caption/publish) are introduced
in later phases and are intentionally absent here.
"""

from __future__ import annotations

from pathlib import Path
from typing import Optional

import typer

from . import __version__
from .config import ConfigError, load_config
from .doctor import Status, run_all_checks, summarize
from .logging_setup import configure_logging, get_logger

app = typer.Typer(
    name="reachengine",
    help="Local-first multi-platform video distribution & analytics tool.",
    no_args_is_help=True,
    add_completion=False,
)

# Colour mapping for doctor output.
_STATUS_COLOR = {
    Status.OK: typer.colors.GREEN,
    Status.WARN: typer.colors.YELLOW,
    Status.FAIL: typer.colors.RED,
}


def _load(config_path: Optional[str]):
    try:
        return load_config(config_path)
    except ConfigError as exc:
        typer.secho(f"Config error: {exc}", fg=typer.colors.RED, err=True)
        raise typer.Exit(code=2)


@app.command()
def version() -> None:
    """Print the ReachEngine version."""
    typer.echo(f"reachengine {__version__}")


@app.command()
def init(
    config_path: Optional[str] = typer.Option(
        None, "--config", "-c", help="Path to config.yaml (defaults searched if omitted)."
    ),
    write_config: bool = typer.Option(
        True, help="Write a starter config.yaml if none exists."
    ),
) -> None:
    """Create directories, initialise the SQLite schema, and write a config."""
    # Write a starter config next to the CWD if requested and none exists.
    target = Path(config_path) if config_path else Path("config.yaml")
    if write_config and not target.exists():
        example = Path(__file__).resolve().parents[2] / "config.example.yaml"
        if example.exists():
            target.write_text(example.read_text(encoding="utf-8"), encoding="utf-8")
            typer.secho(f"Wrote starter config to {target}", fg=typer.colors.GREEN)
        else:  # pragma: no cover - example ships with the package
            typer.secho("config.example.yaml not found; using built-in defaults.", fg=typer.colors.YELLOW)

    config = _load(config_path)
    configure_logging(config)
    log = get_logger("cli.init")

    for path in config.paths.all_dirs():
        Path(path).mkdir(parents=True, exist_ok=True)
        typer.echo(f"  dir  {path}")

    from .db import init_db

    init_db(config.paths.db_path)
    typer.echo(f"  db   {config.paths.db_path}")
    log.info("init.completed", extra={"db": str(config.paths.db_path)})
    typer.secho("Initialised ReachEngine workspace.", fg=typer.colors.GREEN)


@app.command()
def doctor(
    config_path: Optional[str] = typer.Option(
        None, "--config", "-c", help="Path to config.yaml."
    ),
    no_db: bool = typer.Option(False, "--no-db", help="Skip the database check."),
) -> None:
    """Verify ffmpeg/ffprobe, Python, disk space, writable dirs, and the DB."""
    config = _load(config_path)
    configure_logging(config)
    log = get_logger("cli.doctor")

    results = run_all_checks(config, check_db=not no_db)

    typer.echo("ReachEngine doctor\n")
    for r in results:
        badge = typer.style(f"[{r.status.value:4}]", fg=_STATUS_COLOR[r.status], bold=True)
        typer.echo(f"  {badge} {r.name:14} {r.detail}")

    overall = summarize(results)
    typer.echo("")
    typer.secho(
        f"Overall: {overall.value}",
        fg=_STATUS_COLOR[overall],
        bold=True,
    )
    log.info(
        "doctor.completed",
        extra={"overall": overall.value, "checks": len(results)},
    )

    if overall is Status.FAIL:
        raise typer.Exit(code=1)


def main() -> None:  # entry point for the ``reachengine`` script
    app()


if __name__ == "__main__":  # pragma: no cover
    main()
