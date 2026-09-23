# ML Specification

Four models. Two vision, two tabular. Each section states what it is, how it
is trained, what "good enough to ship" means, and how it is monitored once
live.

The rule from `docs/AI_GUIDELINES.md` applies throughout: nothing the UI
presents as computed may be faked, and nothing is claimed beyond what the
evaluation actually supports.

---

## 1. PPE detection — `ppe-v*`

**Job.** Given a photo taken by the operator at shift start, determine which
personal protective equipment is present.

**Classes.** `helmet`, `hi_vis_vest`, `eye_protection`, `gloves`,
`hearing_protection`.

Be honest about what is reliable. Helmet and hi-vis vest are detectable at
high accuracy in most lighting. Eye protection is materially harder, roughly
ten points behind. Gloves and hearing protection are often occluded by pose
and should be advisory rather than gating, with the UI saying so.

**Explicitly not a class:** faces, identity, person attributes of any kind.
The model detects equipment. See `docs/DATA_GOVERNANCE.md` Rule 2.

**Approach.** Fine-tune a small YOLO-family detector, `yolov8n` or `yolo11n`
class, on a PPE dataset. Public starting points exist (CHV, Pictor-v3,
SH17 and similar), then augment with site-collected images gathered under
explicit consent.

**Training data requirements.** The failure mode of PPE models is narrow
training data. The set must span dawn and dusk lighting, direct sun and deep
shade, rain and dust, all reflective vest colours in use, helmets in every
colour on site, seated-in-cab pose as well as standing, and a full range of
skin tones and body types. A model that works on a sunny afternoon and fails
at 6 a.m. in winter will be overridden until someone disables it.

**Ship criteria.**

| Metric | Threshold |
|---|---|
| Recall, helmet and vest | ≥ 0.97 |
| Precision, helmet and vest | ≥ 0.93 |
| Recall, eye protection | ≥ 0.88, advisory only below 0.92 |
| p95 latency, mid-range Android | ≤ 400 ms |
| Model size, INT8 quantised | ≤ 10 MB |
| Disparity in recall across lighting buckets | ≤ 5 points |

That last row is not optional. Evaluate it explicitly, report it, and treat a
gap as a blocker rather than a known issue.

**Recall over precision, deliberately.** A false pass is a person working
without a helmet. A false fail costs two taps and an override. Tune the
threshold accordingly and state the asymmetry when someone asks about
accuracy.

**Production monitoring.** The override rate is the live accuracy signal. A
rise in overrides at a specific site, time of day or after a rollout means the
model regressed, and it shows up days before any offline metric would.
Alert on it.

---

## 2. Warning-light classification — `lights-v*`

**Job.** Photograph a lit dashboard symbol, return candidate matches with
confidence.

**Approach.** Image classification over roughly 40 ISO 7000 / machine warning
symbol classes. Small CNN or a fine-tuned MobileNet is sufficient; this is an
easier problem than PPE because symbols are standardised and high contrast.

**The interaction is confirm-not-classify.** The model returns the top three
candidates and the operator taps the match. Reasons:

1. A misidentified fault code is a maintenance decision made on wrong
   information.
2. Confirmation gives you labelled production data for free, which is how the
   model improves.
3. It is honest. The UI never claims recognition happened unassisted.

**Ship criteria.** Top-3 accuracy ≥ 0.95. Top-1 is informational only and is
never presented as certain.

**Fallback.** When confidence is low or the model is unavailable, show the
full symbol grid for manual lookup. That path must work with the network down
and the model missing.

---

## 3. Task time estimation — `eta-v*`

**Job.** Predict remaining duration for the current task with an interval and
an explanation.

**Approach.** Gradient-boosted regression — LightGBM — over historical task
records. Start with ridge regression as the baseline, ship the boosted model
only if it beats it on held-out data. It usually will, on non-linear
interactions like slope against load class.

**Features.** Task type, load cycles completed, cycles remaining, idle
minutes, fuel used, engine hours, slope, load class, travel distance, weather,
ambient temperature, operator efficiency index, machine model, zone.

**Output contract.**

```json
{
  "pointMin": 17,
  "lowMin": 15, "highMin": 21,
  "confidence": 0.86,
  "contributors": [
    { "label": "Heavy load",           "deltaMin":  3 },
    { "label": "Long travel distance", "deltaMin":  2 },
    { "label": "Historical idle",      "deltaMin":  1 },
    { "label": "Your efficiency",      "deltaMin": -2 }
  ],
  "nSimilar": 14,
  "modelVersion": "eta-v2.1.0"
}
```

The interval comes from quantile regression at the 10th and 90th percentiles,
not from a guess around a point estimate. Confidence is derived from interval
width relative to the point estimate. Contributors come from SHAP values,
grouped into plain-language labels — no more than four, or it stops being an
explanation.

**Ship criteria.** MAPE ≤ 15% on held-out shifts. Interval calibration within
5 points of nominal, meaning the 80% interval actually contains the truth
about 80% of the time. Calibration matters more than sharpness here; an
operator who learns the ETA lies will stop reading it.

**Cold start.** A new operator or machine falls back to a fleet-level model
and the UI says so: "estimated from similar machines, not your history yet."

---

## 4. Anomaly detection — `anomaly-v*`

**Job.** Flag unusual machine usage against the operator's own norm.

**Approach.** Start with rolling z-scores and IQR bounds per metric. This is
interpretable, needs no training run, and covers excessive idling, cycle-time
drift and fuel-per-cycle spikes — which is most of the value.

Add an isolation forest over the multivariate feature vector only once the
simple version is live and you have evidence it misses something real.
Multivariate anomaly detection that nobody can explain is worse than a
threshold that everybody trusts.

**Always against the operator's own baseline**, never a fleet average. A
careful operator on difficult ground is not an anomaly.

**Baseline recomputation.** Rolling 30 shifts, weekly. A new baseline needs at
least 10 shifts before it replaces the fleet default.

**Ship criteria.** False positive rate under 1 per operator per week. Above
that, people stop reading the feed, and an ignored safety surface is worse
than an absent one.

---

## Shared infrastructure

**Registry.** MLflow. Every model version records its training dataset hash,
hyperparameters, full evaluation report including the fairness slices, and who
approved release.

**Rollout.** Staged by device: 5% → 25% → 100%, with a hold at each stage long
enough to see the override rate. One-command rollback. The device reports
model version with every inference result, so a bad version is traceable to
every decision it influenced.

**Drift.** Monitor input distribution per site monthly. New site, new season,
new vest supplier and new machine model all shift the input distribution and
all have caused production regressions in systems like this.

**Retraining.** Quarterly, or triggered by a drift alert or a sustained
override-rate rise. Production data enters training only where consent covers
it — see `docs/DATA_GOVERNANCE.md` section 3.

**Evaluation is versioned with the model.** A model without a current
evaluation report does not get deployed, regardless of who is asking.
