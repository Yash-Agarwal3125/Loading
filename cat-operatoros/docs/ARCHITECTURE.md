# Architecture

## Shape

```
┌─────────────────────────────────────────────────────────────┐
│  CAB TABLET  (Android / iPad, PWA or wrapped)               │
│                                                              │
│  apps/operator            React + TypeScript + Vite          │
│    ├── on-device ML       ONNX Runtime Web / TFLite          │
│    │     ppe-v*.onnx           PPE detection                 │
│    │     lights-v*.onnx        warning-light classification  │
│    ├── local store        IndexedDB (Dexie)                  │
│    ├── sync engine        outbox queue, last-write-wins      │
│    └── speech             Web Speech API + local intents     │
└───────────────┬──────────────────────────────────────────────┘
                │  HTTPS / mTLS, batched, resumable
┌───────────────┴──────────────────────────────────────────────┐
│  services/api        FastAPI (Python 3.12)                   │
│    auth · telemetry ingest · incidents · tasks · training     │
│    ppe results · handover · audit · model distribution        │
├──────────────────────────────────────────────────────────────┤
│  PostgreSQL + TimescaleDB   relational + telemetry hypertable │
│  Redis                      cache, rate limit, job queue      │
│  S3-compatible object store thumbnails, hazard photos         │
├──────────────────────────────────────────────────────────────┤
│  services/ml         training, evaluation, export, registry   │
│    PyTorch · Ultralytics · ONNX export · MLflow               │
└───────────────┬──────────────────────────────────────────────┘
                │
┌───────────────┴──────────────────────────────────────────────┐
│  MACHINE TELEMETRY                                            │
│    adapters: Cat Product Link / VisionLink API · J1939 CAN    │
│    via MQTT gateway · simulator (dev + demo)                  │
└──────────────────────────────────────────────────────────────┘

apps/supervisor   thin web console: fleet compliance, incidents,
                  handovers, model rollout. Deliberately narrow.
```

## Why Python on the server now

The hackathon build had no backend and that was correct. A product has three
things that force one: multiple users with roles, an audit trail that must
survive the device, and models that need training, versioning and rollout.

Python because two of the four models are computer vision. Training, export
and evaluation all live in the Python ecosystem, and having the serving layer
in the same language removes an entire translation seam.

Node would be defensible if the ML were someone else's API. It isn't.

## The offline model is the hard part

A cab has no connectivity guarantee. Treat offline as the normal case and
connectivity as the exception, not the reverse.

**Everything below works with the network down:**
PPE check, risk engine, all telemetry display, task list and progress, hazard
reporting with photo, warning-light lookup, training modules already
downloaded, coaching against a cached baseline, shift handover generation,
voice assistant.

**Requires connectivity:**
First login, model updates, syncing completed work, pulling tomorrow's task
list, fleet-level views.

**Mechanics:**

- Every mutation writes to IndexedDB first and appends to an outbox.
- The sync engine drains the outbox when online, with exponential backoff.
- Each record carries a client-generated UUID, so retries are idempotent.
- Conflicts resolve last-write-wins per field, except incidents, which are
  append-only and never merge.
- The UI shows queue depth honestly: "3 items waiting to sync". Never a green
  tick when there is an unsent outbox.

Test this by putting the tablet in airplane mode for a full simulated shift.
That test has to pass before any customer pilot.

## On-device inference

Both vision models run locally. This is a privacy decision first
(`docs/DATA_GOVERNANCE.md`, Rule 1) and a latency decision second.

- Export to ONNX, run via ONNX Runtime Web with the WebGL or WASM-SIMD
  backend. Budget under 400 ms on a mid-range Android tablet.
- Quantise to INT8. Target under 10 MB per model so an over-the-air update is
  viable on a site hotspot.
- Models are versioned artefacts fetched from the API and cached. The device
  reports which version produced each result, so a bad rollout is traceable.
- Staged rollout: 5% of devices, watch the override rate, then widen. The
  override rate is your production accuracy signal — a spike means the model
  regressed, and it arrives faster than any offline metric.

## Data flow: the two loops, in production

**Site memory.** Incident captured on device → outbox → API → Postgres →
zone risk recomputed nightly → new zone profile pushed to devices → next
operator entering that zone gets warned before anything happens.

**Learning.** Telemetry ingested → anomaly detection over the operator's own
rolling baseline → coaching insight → training module assigned → completion
recorded → baseline recomputed. Weekly cadence, not real time.

## Services

| Service | Responsibility |
|---|---|
| `auth` | OIDC, roles, device enrolment, token refresh |
| `telemetry` | Ingest, validate, write to hypertable, fan out to risk |
| `incidents` | Hazard reports, photos, zone aggregation |
| `tasks` | Schedule, assignment, progress, ETA serving |
| `safety` | PPE results, override log, compliance aggregates |
| `training` | Module catalogue, assignment rules, completion |
| `handover` | Shift summary generation and distribution |
| `models` | Artefact registry, device distribution, rollout state |
| `audit` | Append-only access log. Separate database user, insert-only. |

## Roles

`operator` · `supervisor` · `safety_officer` · `maintenance` · `admin`

Enforced server-side on every endpoint. The client hiding a screen is not
access control. See the access matrix in `docs/DATA_GOVERNANCE.md` section 1.

## Environments

`local` (docker compose, simulator telemetry) → `staging` (synthetic fleet) →
`pilot` (one site, real machines, feature-flagged) → `production`.

Every feature ships behind a flag scoped per site, because PPE cannot be
enabled at a site before its works council consultation completes.

## What we are not building

Machine control of any kind. Real-time video streaming from the cab. A
fleet-management product — that market is served, and the whole thesis is that
the operator is not. Native iOS and Android apps before the PWA is proven.
Multi-tenant SaaS before the first single-tenant pilot works.
