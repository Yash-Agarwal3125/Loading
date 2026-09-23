# Data Schema

**Rule for adding a field:** a new field is only added to this schema if the
change names which tier it belongs in and the specific feature that consumes
it. A field nothing consumes does not get added, no matter how plausible it
looks on a real machine.

Three tiers. Keep them visually separate in the object so it stays true that
the base nine are the judges' contract, the middle tier is what a real
machine would give you, and the last tier is what only this product knows.

## Given

The judges supplied this nine-column table. Never altered. Every synthetic
record carries all nine fields, and the first four rows of the seed set are
this sample verbatim.

| Field | Type |
|---|---|
| timestamp | ISO string |
| machineId | string |
| operatorId | string |
| engineHours | number |
| fuelUsedL | number |
| loadCycles | integer |
| idlingTimeMin | integer |
| seatbelt | 'Fastened' \| 'Unfastened' |
| safetyAlert | boolean |

## Machine-derived

Would come off a real CAN bus or Product Link feed. Nothing here is invented
by the app — it is what an instrumented excavator already knows about
itself and its environment. Each row names its plausible real source so a
reviewer can tell simulated-but-real from invented.

| Field | Type | Consumed by | Plausible real source |
|---|---|---|---|
| taskType | string | ETA model | Product Link job/task assignment feed |
| taskDurationMin | number | ETA model (training label) | Product Link cycle-segmentation analytics |
| slopeDeg | number | risk engine, ETA | onboard IMU / inclinometer (Cat Grade, Product Link) |
| loadClass | 'light' \| 'medium' \| 'high' | risk engine, ETA | Cat Payload load-weighing system, bucketed |
| proximityM | number | risk engine | onboard object-detection radar/camera (Cat Detect) |
| vehicleCount | integer | risk engine | onboard object-detection radar/camera, object count |
| pedestrianNear | boolean | risk engine | onboard object-detection radar/camera, person-class flag |
| machineSpeed | number | risk engine | wheel/track speed sensor, CAN bus |
| cycleTimeSec | number | coach, anomalies | Product Link cycle-segmentation analytics |
| weather | string | ETA | site weather feed keyed to Product Link GPS location |
| temperatureC | number | ETA | ambient temperature sensor, CAN bus / Product Link |
| travelMeters | number | ETA | GPS / odometry via Product Link |
| swingAngleDeg | number | coaching (currently promised with nothing behind it) | upper-structure swing-angle sensor, CAN bus |
| swingCount | integer | coaching (currently promised with nothing behind it) | swing-cycle counter, CAN bus |
| hydraulicPressureBar | number | Machine observations (currently promised with nothing behind it) | hydraulic pressure sensor, CAN bus |
| hydraulicTempC | number | Machine observations (currently promised with nothing behind it) | hydraulic oil temperature sensor, CAN bus |
| attachmentType | string | ETA — major cycle-time driver | attachment ID sensor / Product Link configuration feed |
| materialType | string | ETA — major cycle-time driver | operator-set or vision-classified material, relayed via Product Link |
| groundCondition | string | risk engine — slope interaction | terrain/site-condition feed (Cat Grade or operator-set), relayed via Product Link |
| ambientLux | number | PPE model confidence, contrast mode | cab-mounted ambient light sensor, CAN bus |
| engineRpm | number | distinguishes working idle from true idle | engine ECM, CAN bus (standard J1939 PGN) |
| throttlePercent | number | distinguishes working idle from true idle | engine ECM, CAN bus (standard J1939 PGN) |
| payloadKg | number | productivity, load class | Cat Payload load-weighing system |
| bucketFillPercent | number | productivity, load class | Cat Payload / vision fill-estimation system |
| headingDeg | number | risk engine | onboard compass/IMU or Product Link GPS heading |
| seatOccupied | boolean | risk engine | seat-occupancy interlock switch, CAN bus |

## App-generated

Only OperatorOS knows these. No machine anywhere reports them; they exist
because a feature in this product produced them.

| Field | Type | Consumed by |
|---|---|---|
| ppeCheckId | string (uuid) | links a shift to its PPE check — Shift Start, handover |
| faultLookupId | string (uuid) | links a warning-light lookup to a logged fault — Machine, handover |
| alertAcknowledgedAt | ISO string \| null | hold-to-acknowledge timestamp — Safety, handover |
| overrideReason | string \| null | the picked reason on a PPE or safety override — Shift Start, handover |
| zone | 'A' \| 'B' \| 'C' | the site zone a record belongs to — hazard memory |
| incidentType | string \| null | the hazard classification chosen when reporting — hazard memory |
| modelVersion | string | which stub or model produced a result — provenance lines, PPE check, Machine lookup |

## Snapshots vs. the live tick

The given table is periodic snapshots, hours apart — four rows spanning two
days. The app assumes a live tick, seconds apart, from the same machine. Both
are real in the product's model of the world, they just operate at different
frequencies:

- The snapshot cadence is the **historical layer** — it is what feeds the ETA
  model's training rows and the Coach's rolling baseline.
- The live tick is an **assumed higher-frequency feed from the same
  machine** — the CAN bus / Product Link connection the snapshot table is
  itself sampled from, just polled continuously instead of a few times a
  shift. It is what drives the risk engine, the safety alert and glance mode.

Nothing here contradicts the other: the live tick, aggregated down, is what
would eventually produce more rows like the four given ones.

## Seed requirements

About 200 synthetic records after the four sample rows, covering:

- normal operation at the operator's baseline
- an inefficient stretch with idle climbing and cycle time drifting
- at least three vehicle-proximity events clustered in Zone C, dated this week
- two seatbelt violations
- a spread of task durations wide enough for the ETA model to learn from

Synthetic rows must preserve the correlations visible in the four sample
rows, not just their marginal distributions: high idle co-occurring with low
load cycles, and seatbelt unfastened co-occurring with `safetyAlert: true`
(both `Unfastened` rows in the sample carry `Safety Alert = Yes`).
Independently randomising each field breaks these relationships and teaches
the anomaly detector noise instead of the pattern it is supposed to catch.

Flat data is the other failure mode. If every row looks the same, the
regression has no signal, confidence is meaningless and the contributor
breakdown will read as invented.

## Identity chain

Primary machine `EXC001`, primary operator `OP1001`. Engine hours run
1523.5 → 1524.8 → 1526.5 → 1530.2, which is why the Machine screen shows
1530.2. Mention this chain in the pitch.

## Incident record

```
{ id, zone, type, severity, timestamp, machineId, operatorId,
  task, telemetrySnapshot, photos: [dataUrl] }
```

`telemetrySnapshot` is the full current-tick record — all three tiers, not
just the given nine — at the moment of report. That snapshot is what makes
the incident useful later, and it is what the "Why am I seeing this" panel
replays when the zone warns a future operator.
