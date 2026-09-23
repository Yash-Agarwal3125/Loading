# Smart Operator Assistant for CAT machinery

Transcribed from the challenge document. Source images alongside:
`problem-statement-p1.jpg`, `problem-statement-p2.jpg`.

## Background

Construction equipment like excavators and loaders are becoming increasingly
digitalized, yet the tools available to machine operators remain basic.
Imagine an intelligent assistant — an end to end application — that supports
machine operators throughout their workday, improving efficiency, safety and
training using smart technologies.

## Challenge

Design and build a multi-functional operator interface for CAT machines
operators. Participants are encouraged to think beyond just a tool: make it an
intelligent companion that enhances the operator's daily experience.

## Expected outcomes

- **Daily task dashboard** — view scheduled tasks for the day.
- **Safety features** — improve real-time operator safety using available or
  assumed data:
  1. Seatbelt compliance
  2. Proximity hazards
  3. Incident logging etc.
  (Working conditions to be considered.)
- **Operator training hub** — any creative learning format: e-learning videos,
  instructor booking or simulation module.
- **Identify unusual behavior in machine usage** — e.g. excessive idling,
  operation patterns.
- **Task time estimation** — predict time to complete a task based on past
  data and environmental conditions.

## Supplied data sample

| Timestamp | Machine ID | Operator ID | Engine Hours | Fuel Used (L) | Load Cycles | Idling Time (min) | Seatbelt Status | Safety Alert Triggered |
|---|---|---|---|---|---|---|---|---|
| 2025-05-01 08:00:00 | EXC001 | OP1001 | 1523.5 | 5.2 | 12 | 30 | Fastened | No |
| 2025-05-01 10:00:00 | EXC001 | OP1001 | 1524.8 | 3.8 | 2 | 55 | Unfastened | Yes |
| 2025-05-01 14:00:00 | EXC001 | OP1001 | 1526.5 | 6.1 | 10 | 15 | Fastened | No |
| 2025-05-02 09:00:00 | EXC001 | OP1001 | 1530.2 | 2.0 | 1 | 60 | Unfastened | Yes |

## How this maps to the build

| Expected outcome | Where it lands |
|---|---|
| Daily task dashboard | Home, Tasks |
| Seatbelt compliance | Safety — always a critical state when moving |
| Proximity hazards | Risk engine fusion + Hazard Memory |
| Incident logging | Report Hazard, zone incident history |
| Operator training hub | Training — all three named formats |
| Unusual behavior | Coach — Unusual Activity feed |
| Task time estimation | ETA model |

Two things the brief does not ask for, added deliberately: **Hazard Memory**,
which makes the site itself learn, and the **PPE check at shift start**. Both
are differentiators rather than checklist items.

Note on the sample rows: both `Unfastened` rows carry `Safety Alert = Yes`.
Seatbelt status is 1 of only 9 supplied columns. Treat it as a first-class
feature, not an indicator. The four rows above are seeded verbatim as the
first records in `apps/operator/src/data/seedTelemetry.js`, and the engine
hour chain ends at 1530.2, which is why the Machine screen shows that figure.
