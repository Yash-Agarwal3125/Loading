# Model Proposals (for selection)

Designed with the advisor (Opus-level review), then checked against the actual
`data.csv` (1080 rows, 8 machines, 45 days) before writing anything down — every
number below is measured, not assumed. Ranked by how directly each serves the
brief's "Expected outcomes," then by whether today's data already supports it.

**Rule used to filter candidates:** a proposal only counts if the signal it
relies on is actually correlated in the data, not just present as a column. Two
candidates were rejected on this basis — see the bottom of this section.

## 1. Refuel advisor — the user's example — **needs new data columns**

The idea: estimate time-to-empty from fuel level and recent burn rate, output
"refuel by HH:MM."

Checked against the data and it doesn't work today:
- **There is no fuel-level, tank-capacity, or refuel-event column.** `Fuel Used (L)`
  is consumption per reading, not a tank gauge.
- **Burn rate is unrealistically low.** Measured average: 2.68 L/reading for
  Excavators, 2.28 L/reading for Loaders, against a ~1-3.5 engine-hour delta per
  reading — works out to roughly **1 L per engine-hour**. A mid-size excavator
  burns closer to 15-20 L/hour under load (check a CAT spec sheet before quoting
  a number in the actual model). At the current rate any realistic tank would
  run for hundreds of hours and the advisor would never have anything to say.

To build this for real, `generate_data.py` needs: a `Fuel Level (%)` column, a
`Tank Capacity (L)` per machine type, simulated refuel events (level jumps back
to ~95-100%), and burn rates scaled to realistic L/hour. Model: time-to-empty =
fuel remaining ÷ smoothed recent burn rate (task-type- and engine-load-weighted),
output as a clock time, pulled earlier if the next scheduled task's predicted
duration would exceed remaining runtime.

**Verdict: good idea, but it's a data-generation task before it's a model task.**

## 2. Service-due countdown — **ready now, cheapest to build**

Track `Engine Hours` per machine against a configurable service interval (e.g.
every 250 hours) and report hours/projected date until the next service is due.
Same shape as the fuel model (remaining ÷ rate → ETA) but the data already
exists — no schema change needed. Directly supports the "operator's daily
experience" and "beyond just a tool" goals from the brief.

## 3. Overheating trend detector — **ready now, the planted fault is real**

Rolling per-machine linear-regression slope of `Hydraulic Oil Temp (C)` vs. day,
projected forward to flag when it will cross 100°C.

Measured: **EXC002's hydraulic temp climbs ~1.01°C/day** and first crosses 100°C
on **2025-05-09** (day 9 of 45) — a genuine early-warning window before the
`Anomaly Label = Overheating` rows start appearing. `statistics.linear_regression`
(Python 3.10+, stdlib) is enough — no new dependency. Directly supports "identify
unusual behavior in machine usage."

## 4. Excessive-idling-by-operator flag — **ready now, signal confirmed**

Mean idling time per operator vs. fleet mean, as a z-score or simple ratio.

Measured mean idling per operator (minutes): OP1001 22.5, OP1002 23.6, **OP1003
38.0**, OP1004 22.8, OP1005 22.4, OP1006 27.6, OP1007 25.3, OP1008 21.8. OP1003 is
~65% above the next-highest operator — a clean, real outlier (this is the
planted `HABITUAL_IDLER`, but the point is the signal is genuinely there, not
asserted). Output: flag the operator, recommend the idling-reduction training
module. Directly supports "identify unusual behavior... excessive idling."

## 5. Task duration regression — **ready now, needs a scope decision**

Measured Actual/Scheduled ratio (how much conditions actually slow tasks down):
by Weather — Clear 1.069, Fog 1.163, Dust 1.196, Rain 1.256; by Ground — Dry
1.056, Wet 1.177, Muddy 1.325; by Shift — Day 1.076, Night 1.223. These aren't
flat — conditions genuinely move duration, so there's something to fit beyond
the group-mean baseline already in `index.html`.

Because `generate_data.py` builds duration as a product of multipliers, ordinary
least squares on `log(Actual Duration)` with one-hot factors (task type,
material, weather, ground, shift, experience) should recover something close to
the true multipliers. **This needs numpy** (or hand-rolled normal equations to
stay stdlib-only, which is more code but zero new dependencies) — worth deciding
before picking this one. Report mean absolute error against the current
group-mean baseline so "is the model actually better" has an answer.

## 6. Pre-task safety risk score — **ready now, one caveat**

Weighted score (or small logistic regression) from certification, ground
condition, night shift, hours into shift, and task type, trained against
`Incident Logged` as the label — output a Low/Medium/High risk badge on the
daily task card before the operator starts.

Certification counts (8 operators): Expert 4, Certified 3, **Trainee 1**
(OP1006). There is exactly one trainee, so a "trainee risk" effect exists in
the data but rests on a single operator — call this out as a caveat in the
model rather than treating it as a robust pattern.

## 7. Fatigue alert — **ready now**

Rule-based: `Hours Into Shift` above a threshold (e.g. 8) combined with a rising
`Harsh Event Count` in the same shift. Cheap, stdlib-only, no training needed.
Complements #6 rather than duplicating it (this is within-shift, #6 is
pre-task).

## 8. Training-hub recommender — **ready now, ties the app together**

Map each operator's recent anomaly/incident history to one of the three
training-hub cards already in `index.html` (seatbelt & cabin safety /
instructor booking / simulation module) — e.g. any Unfastened rows → seatbelt
module, any proximity incident → simulation module. Cheap to build and it's the
piece that makes the training hub feel connected to the rest of the app instead
of three static cards, which is closest to the brief's "intelligent companion"
framing.

## Rejected candidates (signal isn't in the data)

- **Per-operator seatbelt-violation ranking.** Measured unfastened rate per
  operator: 0.118-0.194 across all 8 — no real outlier, because `generate_data.py`
  rolls seatbelt status independently per row (`random.choices(..., weights=[85,15])`)
  with no per-operator bias. Ranking operators on this would rank noise.
- **Per-operator proximity-hazard ranking.** Same problem: rates measured at
  0.021-0.083 with no operator standing out — proximity distance isn't tied to
  the operator in the generator. Both would need a planted per-operator bias
  added to `generate_data.py` before they'd be honest models, the same way
  `HABITUAL_IDLER` was added for idling.

## Suggested integration shape (once models are chosen)

Compute these as Python functions writing a `predictions.json` that `index.html`
fetches alongside `data.csv`, rather than recomputing in JS — keeps `render()`
from growing model logic. Flagged for the pick, not decided here.

# Dev review run — 2026-09-23 12:49:29

## Cycle 1 — 2026-09-23 12:49:29

- **SHOULD**: Dashboard loads data.csv via fetch(), which needs a local server (file:// will fail on CORS) -- document `python -m http.server` in a README.

## Cycle 2 — 2026-09-23 12:49:29

- **SHOULD**: Dashboard loads data.csv via fetch(), which needs a local server (file:// will fail on CORS) -- document `python -m http.server` in a README.

## Cycle 3 — 2026-09-23 12:49:29

- **SHOULD**: Dashboard loads data.csv via fetch(), which needs a local server (file:// will fail on CORS) -- document `python -m http.server` in a README.

