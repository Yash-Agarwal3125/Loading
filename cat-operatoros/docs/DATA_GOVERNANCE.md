# Data Governance

This document exists because CAT OperatorOS photographs workers. Everything
here is a product requirement, not legal boilerplate. A safety product that
mishandles worker imagery gets rejected in procurement, defeated by the people
it monitors, or both.

Applicable regimes for the likely deployment footprint: India's Digital
Personal Data Protection Act 2023, EU GDPR (Articles 6, 9, 35), and site-level
works council or union agreements in most European and Australian operations.
This is not legal advice. Have counsel review before a paying deployment.

---

## 1. The four rules

### Rule 1 — Inference happens on the device

The PPE check runs locally on the tablet. The photograph does not leave the
device, is not uploaded, and is not retained in full resolution anywhere.

What the server receives:

```json
{
  "checkId": "uuid",
  "operatorId": "OP1001",
  "machineId": "EXC001",
  "timestamp": "2026-09-23T07:58:11Z",
  "result": "pass",
  "items": {
    "helmet":  { "present": true,  "confidence": 0.94 },
    "vest":    { "present": true,  "confidence": 0.91 },
    "eyewear": { "present": false, "confidence": 0.38 }
  },
  "modelVersion": "ppe-v1.3.0",
  "thumbnailRef": "s3://.../thumb.jpg",
  "overridden": false
}
```

The thumbnail is 256 px, retained 7 days, and exists for one purpose: letting
a safety officer verify a disputed result before it expires. After 7 days the
record is structured data only.

This single decision removes most of the privacy surface. Make it early and do
not trade it away for a marginal accuracy gain from a bigger server-side model.

### Rule 2 — No face recognition. Ever.

Identity comes from the authenticated session, not from the image. The model
detects equipment classes, not people.

This is what keeps the feature out of GDPR Article 9 special-category
processing and out of the equivalent sensitive-data tier under DPDP. The
moment you add "verify it's really them by face", the legal burden, the DPIA
scope and the consultation requirement all change tier.

If a customer asks for identity verification, the answer is badge tap or PIN,
not face matching.

### Rule 3 — Fail open, always

The check never hard-blocks an operator from working.

| Situation | Behaviour |
|---|---|
| Items detected | Pass, logged, machine start proceeds |
| Item missing | Prompt to fix it, offer retake |
| Retake still fails | **Override** — two taps, pick a reason, proceed |
| Camera broken / no model / dark | Skip with reason, logged as unchecked |

Override reasons are a fixed list: *equipment not required for this task*,
*check not working*, *already verified by supervisor*, *other*. The override
is recorded, the supervisor is notified, and the shift continues.

A model that misreads a vest in low light must never be the reason a person
cannot move a machine. That is a new hazard created by a safety tool, and it
is how the product gets switched off within a month.

### Rule 4 — Aggregate by default

| Role | Sees |
|---|---|
| Operator | Their own full history, always |
| Supervisor | Site and crew compliance rates, trends, override counts. No individual photo history. |
| Safety officer | Individual records, gated behind a stated reason. Every access is logged and the operator can see who viewed their record. |
| Admin | No PPE data at all. Admin is configuration, not surveillance. |

**PPE data must not feed performance scoring, ranking or disciplinary
workflow.** Hard requirement in the product, not a setting. The moment
compliance data becomes disciplinary evidence, operators defeat it — a helmet
on the seat, a borrowed vest, tape over the lens — and the measurement becomes
worthless while the liability stays.

---

## 2. Retention

| Data | Retention | Basis |
|---|---|---|
| PPE full photo | Never stored | — |
| PPE thumbnail | 7 days | Dispute resolution |
| PPE structured result | 24 months | Safety record keeping |
| Hazard report photo | 24 months, or until incident closed + 12 months | Incident investigation |
| Warning-light photo | 30 days | Maintenance diagnosis |
| Telemetry | 24 months hot, then aggregated | Operations |
| Voice audio | Never stored | Transcript only, 30 days |
| Audit log | 7 years | Regulatory |

Retention is enforced by a scheduled job, not by policy documents. Write the
job in phase one. Retention that depends on someone remembering is not
retention.

## 3. Consent and notice

Consent is collected at operator onboarding, in the operator's own language,
and it is specific: what is captured, what leaves the device, who can see it,
how long it is kept, and how to object.

DPDP requires notice in English plus the schedules' listed languages on
request. Build the notice as content, not a hardcoded string.

Where a works council or union agreement governs the site, deployment is
blocked until that consultation is complete. Make this a configuration flag
per site, so the feature genuinely cannot be enabled before sign-off.

Withdrawal of consent disables the PPE check for that operator and logs the
shift as unchecked. It does not block them from working.

## 4. DPIA triggers

A Data Protection Impact Assessment is required before first deployment and
again whenever any of these change:

- The PPE model moves from on-device to server-side inference
- Any biometric or identity-matching capability is proposed
- Voice audio retention changes from transcript-only
- PPE data is proposed as an input to any scoring, ranking or HR process
- A new jurisdiction is added

The fifth one catches most surprises.

## 5. Operator-facing transparency

The operator screen shows, in plain language, before the first photo:

> This checks for a helmet, vest and eye protection. The photo stays on this
> tablet and is not uploaded. Your supervisor sees whether the check passed,
> not the picture. You can skip it.

That last sentence is the one that gets the product adopted. Say it.

## 6. Security requirements

- Images encrypted at rest on device; cleared on logout and on app uninstall
- Thumbnails in object storage with server-side encryption and signed,
  short-lived URLs
- TLS 1.3 in transit
- Role checks enforced server-side; never rely on the client hiding a screen
- Every read of an individual PPE record writes an audit row: who, when, why
- Penetration test before the first customer deployment

## 7. What we deliberately do not build

Face recognition. Emotion or fatigue inference from imagery. Continuous
in-cab video. Location tracking outside jobsite zone granularity. Productivity
league tables. Any export that joins PPE compliance to payroll or HR records.

Each of these has been asked for in products like this. Each one converts a
safety tool into a surveillance tool, and the second one does not work,
because the people it measures stop cooperating.
