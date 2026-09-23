# Smart Operator Assistant — CAT Machinery

Hackathon project (Caterpillar): a dashboard prototype for CAT machine operators
covering the daily task list, safety features (seatbelt compliance, proximity
hazards, incident logging), a training hub, and a task-time estimate.

The dataset goes beyond the brief's sample sheet with task/condition/operator
fields (task type, material, weather, ground condition, shift, operator
experience) and operational telemetry (engine load, hydraulic temp, tilt,
speed) so that task duration and unusual-behavior detection have real signal
to learn from, not independent random columns. See `generate_data.py` for how
each field is derived.

## Run it

```bash
python generate_data.py        # writes data.csv
python -m http.server          # serves index.html (fetch() needs http://, not file://)
```

Then open http://localhost:8000

## Files

- `generate_data.py` — generates a synthetic operator-telemetry dataset matching the brief's sample sheet.
- `data.csv` — generated dataset (regenerate any time).
- `index.html` — the dashboard (dashboard, safety stats, charts, training hub, task-time estimate).
- `dev_review_loop.py` — re-scans the project each run and lists must-fix gaps against the brief; logs to `RECOMMENDATIONS.md`.

## Still open (see RECOMMENDATIONS.md for the live list)

- All telemetry is simulated (no real machine/IoT data source yet).
- Task time estimation is a historical group-average, not a trained model.
- Anomaly detection is rule-derived (thresholds), not a trained classifier — `Anomaly Label` is there as ground truth for one.
- Training hub links are placeholders (no real video/booking backend).
