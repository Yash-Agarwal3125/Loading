# API Contract

Base `/v1`. OIDC bearer tokens. Every endpoint declares a role. An endpoint
without a role dependency is a bug; the test suite asserts none exist.

## Conventions

- Mutations accept `client_uuid`. Retries are idempotent — the same UUID
  returns the original result rather than creating a duplicate.
- List endpoints are cursor-paginated.
- Errors: `{ code, message, requestId }`. Messages are safe to show an
  operator and never leak another person's data.

## Auth

```
POST /auth/token                 exchange OIDC code
POST /auth/refresh
POST /devices/enroll             device identity, site binding
```

## Telemetry

```
POST /telemetry                  supervisor|gateway. Batch. Nine-field contract.
GET  /machines/{id}/telemetry    operator|supervisor. Windowed.
```

## Safety and PPE

Read `docs/DATA_GOVERNANCE.md` before changing anything here.

```
POST /ppe-checks                 operator. STRUCTURED RESULT + 256px thumb.
                                 Reject payloads containing a full image.
POST /ppe-checks/{id}/override   operator. reason required. Notifies supervisor.
                                 Never blocks the shift.
GET  /me/ppe-checks              operator. Own history. Always allowed.
GET  /ppe-compliance             supervisor. AGGREGATES ONLY.
GET  /ppe-checks/{operatorId}    safety_officer. ?reason= required. Audited
                                 before the response is returned.
```

There is no endpoint exposing PPE data for scoring, ranking or HR export. Do
not add one.

## Incidents

```
POST /incidents                  operator. Append-only; never merges on conflict.
POST /incidents/{id}/photos      operator. Signed short-lived upload URL.
GET  /zones/{id}/summary         operator. Powers the site-memory warning.
GET  /incidents                  supervisor|safety_officer.
```

## Tasks

```
GET  /me/tasks                   operator. Today's schedule.
POST /tasks/{id}/progress        operator.
GET  /tasks/{id}/eta             operator. Point, interval, contributors,
                                 nSimilar, modelVersion.
```

## Training

```
GET  /me/training                operator. Assigned modules with triggeredBy.
POST /training/{id}/complete     operator.
GET  /me/skills                  operator.
```

## Handover

```
POST /shifts/{id}/handover       operator. Generated from state.
GET  /handovers                  supervisor.
```

## Models

```
GET  /models/manifest            device. Which versions this device should run.
GET  /models/{name}/{version}    device. Signed artefact URL.
POST /models/{name}/rollout      admin. Staged: 5 -> 25 -> 100, rollback.
```

## Audit

```
GET  /me/access-log              operator. Who viewed my records, and why.
GET  /audit                      safety_officer|admin.
```

That first one is not optional. An operator being able to see who looked at
their compliance record is what makes the rest of the governance credible
rather than stated.
