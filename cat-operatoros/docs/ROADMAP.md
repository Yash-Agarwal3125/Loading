# Roadmap

Five phases. The product runs at every boundary. Phase 0 is the hackathon
slice and is deliberately a subset of phase 1, not a throwaway.

---

## Phase 0 — Demo slice (1 day)

Frontend only, simulated telemetry, no backend. Everything in
`docs/DEMO_SCRIPT.md` works end to end.

PPE check runs with a stubbed detector that returns a scripted result, clearly
labelled in the UI as a stub. The interaction, the override path and the
notice copy are all real, because those are what you are actually validating.

**Exit:** the three-minute demo runs five times without a stumble, and a
recording exists.

---

## Phase 1 — Walking skeleton (3-4 weeks)

One operator, one machine, one site, real persistence.

- FastAPI + Postgres/TimescaleDB + object storage, docker compose
- Auth with the five roles, enforced server-side on every endpoint
- Telemetry simulator publishing to MQTT, ingested and stored
- IndexedDB + outbox sync, conflict rules, honest queue badge
- Risk engine, anomaly detection (z-score), ETA (ridge baseline) on real data
- Hazard reporting with photo, zone aggregation
- Audit log on its own insert-only DB user
- **Retention job.** Write it now. Retention that waits for launch never ships.

**Exit:** a full simulated shift in airplane mode, reconnect, nothing lost,
nothing duplicated.

---

## Phase 2 — Vision (4-6 weeks)

- PPE dataset assembly. This is the long pole, not the training. Consent
  paperwork, lighting spread, seated-in-cab poses, every vest colour on site.
- PPE model to ship criteria in `docs/ML_SPEC.md`, including the lighting
  disparity slice
- ONNX export, INT8, on-device runtime, latency budget enforced in the build
- Warning-light classifier, confirm-not-classify flow
- Model registry, staged rollout, one-command rollback
- Consent capture and the operator notice, as content not hardcoded strings
- **DPIA completed and signed off before any real worker is photographed**

**Exit:** PPE check running on a real tablet, in real light, at 6 a.m. and at
2 p.m., with the override rate instrumented.

---

## Phase 3 — Intelligence and voice (4 weeks)

- LightGBM ETA with quantile intervals and SHAP contributors, shipped only if
  it beats the ridge baseline on held-out shifts
- Coaching engine against rolling 30-shift personal baselines
- Behaviour-driven training assignment, all three formats
- Voice assistant: hold-to-talk, on-device intent, spoken answers, tap-chip
  fallback always visible
- Shift handover generation and distribution
- Supervisor console, narrow by design: compliance aggregates, incidents,
  handovers, rollout state

**Exit:** the two loops in `docs/PRD.md` section 4 are observable in
production data, not just demonstrable.

---

## Phase 4 — Pilot (6-8 weeks)

One customer, one site, 10-20 machines, feature-flagged per site.

- Works council or union consultation complete before PPE is enabled
- Real telemetry adapter: Cat Product Link / VisionLink or J1939 over MQTT
- Penetration test
- Drift monitoring, override-rate alerting, on-call rotation
- Operator training and a feedback channel that a human reads weekly

**Exit metrics.** Adoption above 80% of shifts starting with a completed
check. Override rate under 10% and falling. Alert acknowledgement above 70%.
And the one that actually matters: operators say it saved them something. If
they do not, the earlier numbers are measuring compliance theatre.

---

## Phase 5 — Scale

Multi-site, multi-tenant, second machine class (loaders), hardened rollout,
localisation. Only after one pilot has run a full quarter.

---

## Sequencing notes

The PPE dataset in phase 2 is the critical path for the whole product. Start
consent paperwork and image collection during phase 1, in parallel, or phase 2
stalls with engineers idle waiting for data.

The retention job and the audit log are phase 1 items on purpose. Both are
trivial to build early and miserable to retrofit once there is production data
that was never supposed to be kept.
