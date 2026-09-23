# Working agreement

Claude Code loads this automatically. It is the operating contract for this
repo. Read it fully before the first edit.

## What this is

CAT OperatorOS is an operator-first assistant for construction equipment
operators. It is being built as a **product**, not a demo. The user is the
person in the cab, not a supervisor and not a fleet manager.

| Doc | For |
|---|---|
| `docs/PRD.md` | Product requirements and acceptance criteria |
| `docs/ARCHITECTURE.md` | Services, offline model, deployment |
| `docs/DATA_GOVERNANCE.md` | **Read before any code touching worker imagery** |
| `docs/ML_SPEC.md` | All four models, thresholds, monitoring |
| `docs/AI_GUIDELINES.md` | How the intelligence behaves and what it may claim |
| `docs/DATA_SCHEMA.md` | Telemetry and record contracts |
| `docs/API.md` | Endpoint contract |
| `docs/DESIGN_SYSTEM.md` | Palette, type, layout, motion |
| `docs/ROADMAP.md` | Phased build order |
| `docs/DEMO_SCRIPT.md` | Hackathon slice run of show |
| `docs/adr/` | Decisions that must not be casually reversed |
| `docs/brief/` | Original challenge + superseded proposal. Provenance only — the PRD wins any disagreement. |

## The eight rules

All eight are load-bearing. If a prompt refers to "the five rules", it is out
of date — follow this file.

1. **Logic never lives in components.** Risk, anomaly, ETA, coaching and PPE
   evaluation are pure functions in `services/`.
2. **Offline is the normal case.** Every mutation goes through the outbox in
   `services/sync.js`. Nothing writes straight to the network.
3. **Every intelligent surface carries a provenance line.** "Predicted from 14
   similar cycles." "Because 3 events happened here this week."
4. **Plain language.** "Vehicle approaching from your right", never
   "proximity threshold violation". Scores may exist in objects; they never
   render.
5. **Never fake a model.** If it was not computed, the UI must not imply it
   was. See `docs/AI_GUIDELINES.md`.
6. **PPE imagery never leaves the device.** No full-resolution upload, ever.
   No face detection, ever. See ADR 0001.
7. **The PPE check never blocks work.** Fail open with a logged override.
   See ADR 0002.
8. **Role checks are server-side, on every endpoint.** A hidden screen is not
   access control. Individual PPE reads write an audit row before returning
   data.

## Do not build

Machine control of any kind. Face recognition or identity matching. Fatigue or
emotion inference. Continuous in-cab video. A fleet-management dashboard.
Productivity league tables. Any export joining PPE compliance to HR or payroll
records. Native apps before the PWA is proven. Multi-tenant SaaS before one
single-tenant pilot works.

Each of these has been asked for in products like this. Each converts a safety
tool into a surveillance tool, and the second kind does not work, because the
people it measures stop cooperating.

## Working style

- Follow `docs/ROADMAP.md` phase by phase. The app runs at every phase
  boundary.
- Small commits. When a phase is done, name the acceptance criteria in
  `docs/PRD.md` it satisfies. "It renders" is not done.
- Any change touching worker imagery, retention, roles or model rollout needs
  a line in the commit body saying which governance rule it engages.
- Reversing anything in `docs/adr/` requires a new ADR, not an edit to the old
  one.

## Honesty constraints

The app is decision support. It does not control machinery and does not
replace machine controls, service manuals or trained safety procedure. Say so
on the safety surface itself.

The warning-light lookup confirms, it does not classify unassisted. Never
write copy implying recognition happened.

Not a Caterpillar product. No CAT logo, wordmark or copied artwork.
