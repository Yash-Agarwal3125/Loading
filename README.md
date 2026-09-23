# Smart Operator Assistant — CAT Machinery

Hackathon project (Caterpillar): a dashboard prototype for CAT machine operators
covering the daily task list, safety features (seatbelt compliance, proximity
hazards, incident logging), a training hub, and a task-time estimate.

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

- Real proximity-hazard/incident-logging data source (currently simulated).
- Task time estimation is a linear heuristic, not a trained model.
- Training hub links are placeholders (no real video/booking backend).
