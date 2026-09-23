# CAT OperatorOS

*Less looking. Less remembering. Safer operating.*

An operator-first assistant for construction equipment. Built for the person
in the cab, not for a fleet manager.

## Structure

```
apps/operator      React PWA for the cab tablet. On-device vision, offline-first.
apps/supervisor    Thin console: compliance aggregates, incidents, handovers.
services/api       FastAPI. Auth, ingest, incidents, safety, models, audit.
services/ml        Training, evaluation, ONNX export, registry. Four models.
packages/shared    Shared types.
infra              docker compose for local development.
docs               Everything below.
```

## Run it

```bash
docker compose -f infra/docker-compose.yml up -d   # db, redis, minio, mqtt, api
cd apps/operator && npm install && npm run dev
```

Or `make dev`.

Phase 0 (the demo slice) runs frontend-only with no backend at all — see
`docs/ROADMAP.md`.

## Docs

| File | For |
|---|---|
| `CLAUDE.md` | Working agreement. Claude Code loads it automatically. |
| `docs/PRD.md` | Requirements and acceptance criteria |
| `docs/ARCHITECTURE.md` | Services, offline model, deployment |
| `docs/DATA_GOVERNANCE.md` | **Read before any code touching worker imagery** |
| `docs/ML_SPEC.md` | Four models: training, thresholds, monitoring |
| `docs/AI_GUIDELINES.md` | How the intelligence behaves and what it may claim |
| `docs/API.md` | Endpoint contract |
| `docs/DATA_SCHEMA.md` | Telemetry and record contracts |
| `docs/DESIGN_SYSTEM.md` | Palette, type, layout, motion |
| `docs/ROADMAP.md` | Five phases |
| `docs/DEMO_SCRIPT.md` | Demo slice run of show |
| `docs/adr/` | Decisions not to reverse casually |
| `docs/brief/` | The original challenge, its data table, and the superseded first proposal |

Start with `CLAUDE.md`, then `docs/ROADMAP.md`.

## Three things that are load-bearing

**PPE imagery never leaves the device.** Inference runs on the tablet; the
server receives a structured result and a 256px thumbnail with 7-day
retention. No face detection anywhere in the product. ADR 0001.

**The PPE check never blocks work.** Fail open with a logged override. A model
that misreads a vest in low light must not be why someone cannot move a
machine. ADR 0002.

**Offline is the normal case.** Everything that matters in a shift works with
the network down, and the sync badge tells the truth about the outbox.

---

Independent project. Not affiliated with Caterpillar Inc. Decision support
only — this software does not control machinery and does not replace machine
controls, service manuals or trained safety procedure.
