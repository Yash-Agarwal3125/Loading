# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A hackathon prototype (Caterpillar) called "Smart Operator Assistant for CAT machinery" — a dashboard for CAT machine operators covering a daily task list, safety features (seatbelt compliance, proximity hazards, incident logging), an operator training hub, and a task-time estimate. The brief is `WhatsApp Image 2026-09-23 at 12.12.51 PM.jpeg` (the original sample dataset columns live there too).

Pure Python stdlib + a static HTML/JS frontend. No package manager, no build step, no framework.

## Commands

```bash
python generate_data.py            # writes data.csv from scratch (fixed random seed = reproducible)
python generate_data.py --test     # self-check: asserts alert/seatbelt invariants hold, no file written
python -m http.server              # serve index.html — it fetch()es data.csv, which fails under file://
python dev_review_loop.py          # 3 review cycles (default) scanning the repo, appends to RECOMMENDATIONS.md
python dev_review_loop.py --cycles N --pause 0
python dev_review_loop.py --test   # self-check: runs the checks once, asserts finding shape
```

There is no test framework — correctness is checked via the `--test` self-checks embedded in each script (assert-based, run directly, not via pytest).

## Architecture

Three independent pieces that share one contract — the CSV schema:

1. **`generate_data.py`** produces `data.csv`, ~1080 rows across 8 machines over 45 days. Columns fall into groups: identity (Timestamp/Machine/Operator + static per-operator Experience/Certification, keyed off `operator_profile()`), task context (Task ID/Type/Site Zone/Material/Weather/Ground Condition/Shift), operation telemetry (Engine Hours/Fuel/Engine Load/Hydraulic Oil Temp/Load Cycles/Idling/Tilt/Speed/Harsh Events), safety (Seatbelt/Proximity Distance+Object+Alert/Safety Alert Triggered/Incident Logged+Type+Severity), and outcomes (Scheduled vs. **Actual Duration** — the task-time-estimation target — and **Anomaly Label**, ground truth for unusual-behavior detection). Nothing is independent: `Safety Alert Triggered` is derived in `make_alert()` from seatbelt/proximity/idling/load-cycle values, `Anomaly Label` in `make_anomaly_label()` from idling/hydraulic-temp/tilt/speed, and Actual Duration from task/material/weather/ground/shift/operator-experience multipliers plus noise. Two deliberate planted patterns: `HABITUAL_IDLER` (one operator idles +15min) and `DRIFTING_MACHINE` (one machine's hydraulic temp climbs with `day`, simulating a developing fault) — both exist so "identify unusual behavior" has something real to find. If you add a new risk/anomaly factor, wire it through the relevant `make_*()` function so derived columns stay consistent with row-level fields. Field values must never contain a comma — `index.html` parses the CSV with a naive `split(',')`; the `--test` self-check enforces this.

2. **`index.html`** is a single self-contained file (inline CSS + JS, Chart.js via CDN) that fetches `data.csv` client-side and renders everything from it: stat cards, the daily task list (latest reading per machine, with scheduled-vs-actual duration and conditions), two trend charts (idling, alerts by day), a filterable machine log table, and a task-time estimate table (mean Actual Duration grouped by Task Type × Weather — a real historical estimate, not a formula). Any new CSV column needs a matching read in `render()` to actually show up — nothing is inferred automatically from headers beyond the raw log table.

3. **`dev_review_loop.py`** is a static project auditor, not a data/dashboard component. Each `check_*()` function re-reads `data.csv` / `index.html` from disk and returns `(severity, message)` tuples (`MUST`/`SHOULD`/`NICE`); `run_cycle()` sorts and appends a timestamped block to `RECOMMENDATIONS.md`. Because it re-scans the filesystem every cycle, it's meant to be re-run after making changes (not just looped in one sitting) — `RECOMMENDATIONS.md` accumulates a history rather than being overwritten. When adding a new brief requirement, add a corresponding check here so drift gets caught automatically.

## Working conventions

- Keep `generate_data.py`'s output schema and `index.html`'s `render()` in sync — the dashboard has no defensive handling for missing columns.
- When the brief's requirements change, update the checks in `dev_review_loop.py` alongside the feature, not after.
- `data.csv` is committed (small, deterministic via the fixed seed) so the dashboard works without a generation step; regenerate it after changing `generate_data.py`.
