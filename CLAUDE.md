# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## North star

This is an operator's in-cab daily companion, not a fleet analytics tool. At
the start of a shift it answers, for **one operator on one day**: which
machine am I on, what are my tasks and when will I finish them, is anything
unsafe right now, and what should I do about it. The brief:
`WhatsApp Image 2026-09-23 at 12.12.51 PM.jpeg` ("Smart Operator Assistant for
CAT machinery", Caterpillar hackathon).

**Before adding anything, check it against this test:**
- **Scoped to one operator, one day.** If it needs the whole fleet to make sense, it belongs in the collapsed Supervisor `<details>` at the bottom of `index.html`, not the main page.
- **Actionable.** Every alert says what to do, not just what happened ("Fasten seatbelt" beats "Seatbelt: Unfastened").
- **Glanceable.** Few items, large text, no digging.
- **Grounded in `data.csv`.** A model only belongs in the operator's day view if its output shows up there as something to act on — see RECOMMENDATIONS.md before building any of the proposed models.

**Non-goals:** fleet/business-intelligence dashboards as the main experience, admin UIs, and any model whose output the operator never sees.

Pure Python stdlib + a static HTML/JS frontend. No package manager, no build step, no framework.

## Commands

```bash
python generate_data.py            # writes data.csv from scratch (fixed random seed = reproducible)
python generate_data.py --test     # self-check: asserts data invariants hold, no file written
python -m http.server              # serve index.html — it fetch()es data.csv, which fails under file://
python dev_review_loop.py          # 3 review cycles (default) scanning the repo, appends to RECOMMENDATIONS.md
python dev_review_loop.py --cycles N --pause 0
python dev_review_loop.py --test   # self-check: runs the checks once, asserts finding shape
```

There is no test framework — correctness is checked via the `--test` self-checks embedded in each script (assert-based, run directly, not via pytest).

## Architecture

1. **`generate_data.py`** produces `data.csv`, ~1080 rows across 8 machines over 45 days. One operator is assigned to exactly one machine per day (`random.sample` per day, zipped) — this is what makes a per-operator daily view possible; don't go back to independent per-machine `random.choice`. Columns group into: identity (Timestamp/Machine/Operator + static per-operator Experience/Certification from `operator_profile()`), task context (Task ID/Type/Site Zone/Material/Weather/Ground Condition/Shift), operation telemetry (Engine Hours/Fuel/Engine Load/Hydraulic Oil Temp/Load Cycles/Idling/Tilt/Speed/Harsh Events), safety (Seatbelt/Proximity Distance+Object+Alert/Safety Alert Triggered/Incident Logged+Type+Severity), and outcomes (Scheduled vs. **Actual Duration** — the task-time-estimation target — and **Anomaly Label**, ground truth for unusual-behavior detection). Nothing is independent: `Safety Alert Triggered` derives from `make_alert()`, `Anomaly Label` from `make_anomaly_label()`, Actual Duration from task/material/weather/ground/shift/experience multipliers. Two planted patterns exist on purpose: `HABITUAL_IDLER` (one operator idles more) and `DRIFTING_MACHINE` (one machine's hydraulic temp climbs over the period) — real signal for the operator/supervisor to notice, not just labeled data. Field values must never contain a comma — `index.html` parses with a naive `split(',')`; `--test` enforces this.

2. **`index.html`** is a single self-contained file (inline CSS + JS, Chart.js via CDN). Structure follows the north star: an operator+date picker at the top drives `renderOperatorView()` — briefing line, today's tasks with predicted duration and expected finish time, a safety action list, and "My Machine" telemetry. `renderSupervisorView()` (the old fleet-wide stat cards/charts/log/estimate table) renders **once**, inside a collapsed `<details class="supervisor">` at the bottom — it is not re-run on operator/date change. Keep it that way: Chart.js throws "canvas already in use" if a chart-containing render function runs more than once. Task-duration predictions use `buildDurationLookup()`, which only looks at rows *before* the selected date (the brief says estimates are "based on past data" — using same-day or future rows would leak the target). Any new CSV column needs a matching read in the relevant render function to show up.

3. **`dev_review_loop.py`** is a static project auditor, not a data/dashboard component. Each `check_*()` function re-reads `data.csv` / `index.html` from disk and returns `(severity, message)` tuples (`MUST`/`SHOULD`/`NICE`); `run_cycle()` appends a timestamped block to `RECOMMENDATIONS.md` (proposals and prior cycles above it are never overwritten — the loop only appends). Includes a `check_docs_freshness()` check: if `generate_data.py`, `index.html`, or itself was committed more recently than this file, it flags CLAUDE.md as possibly stale. **Update this file in the same commit as any schema, dashboard-structure, or file-role change** — that's what keeps the check quiet and keeps future sessions from drifting off the operator-first track.

## Working conventions

- Work happens on the `yash-agarwal` branch (via a worktree), pushed with `git push origin HEAD:yash-agarwal`. Do not merge to `main` unless explicitly asked.
- Keep `generate_data.py`'s output schema and `index.html`'s render functions in sync — no defensive handling for missing columns.
- `RECOMMENDATIONS.md` holds both a "Model Proposals" section (candidates, not yet built) and an append-only review-loop history below it — don't delete proposals when running the loop.
- `data.csv` is committed (small, deterministic via the fixed seed) so the dashboard works without a generation step; regenerate it after changing `generate_data.py`, and re-check that any "measured" numbers quoted in RECOMMENDATIONS.md still hold.
