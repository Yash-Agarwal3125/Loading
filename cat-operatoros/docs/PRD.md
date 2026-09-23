# CAT OperatorOS — Product Requirements

*Less looking. Less remembering. Safer operating.*

## 1. Thesis

Construction equipment keeps getting more instrumented, and almost all of that
instrumentation points at management: fleet dashboards, utilisation reports,
maintenance scheduling. The person actually operating the machine got none of
it.

OperatorOS is built for that person. One persona, and everything else is
downstream of it.

The supervisor gets exactly one artefact: the shift handover. That is a
product position, not an oversight, and it is worth saying plainly when
someone asks where the management view is.

## 2. The user

An excavator or loader operator, mid-shift. Gloves on. Loud cab. Screen in
direct sun. Three seconds of spare attention at a time. Will not type. Varying
experience. Would rather finish the job than learn software.

Non-negotiable consequences:

- 64 px minimum tap target
- 15 px minimum text
- Nothing requires typing
- Any screen readable in under three seconds
- Safety-critical confirmations are holds, not taps
- Everything that matters works with the network down

## 3. Capabilities

| Capability | Surface |
|---|---|
| PPE check at shift start | Shift Start |
| Daily task view and progress | Home, Tasks |
| Contextual risk detection | Safety |
| Seatbelt compliance | Safety, critical state |
| Site hazard memory | Safety, zone map |
| Incident reporting with photo | Report Hazard |
| Unusual usage detection | Coach |
| Task time estimation | Tasks |
| Personal coaching | Coach |
| Behaviour-driven training | Training |
| Warning-light lookup | Machine |
| Voice assistant | Everywhere |
| Shift handover | Handover |

## 4. The two loops

These are the product. Screens are where they surface.

**Learning.** Observed behaviour -> anomaly -> coaching insight ->
micro-training -> recomputed baseline.

**Site memory.** Incident reported -> stored against a zone -> another
operator approaches that zone -> contextual warning -> response -> the zone
gets sharper.

If a feature feeds neither loop, it is decoration.

## 5. Shift Start — the PPE check

The operator photographs themselves in PPE before the shift. Inference runs on
the tablet. The image never leaves it.

**Detects:** helmet, hi-vis vest, eye protection (gating). Gloves and hearing
protection are advisory, because they are frequently occluded by pose, and the
UI says so rather than pretending otherwise.

**Never detects:** faces, identity, or any attribute of the person. Identity
comes from the authenticated session. This keeps the feature out of
special-category biometric processing entirely. See ADR 0001.

**Fail open.** Missing item -> prompt and retake. Still failing -> override in
two taps with a reason, supervisor notified, shift proceeds. Camera or model
unavailable -> skip with reason, logged as unchecked. It never blocks an
operator from working. See ADR 0002.

**Notice, before the first photo of each shift:**

> This checks for a helmet, vest and eye protection. The photo stays on this
> tablet and is not uploaded. Your supervisor sees whether the check passed,
> not the picture. You can skip it.

*Done when:* the check completes in under 15 seconds including capture,
retake is offered on the first failed result, override becomes available on
the second failed result and is two taps from there, skip remains reachable
at every step so fail-open holds from the first failure onward, and a full
shift's worth of checks works with the network down.

**Out of scope, permanently:** PPE data feeding any score, ranking or
disciplinary process. Not a setting — it does not exist in the product. The
moment compliance becomes disciplinary evidence, operators defeat it, and the
measurement is worth nothing while the liability remains.

## 6. Screens

### Home
Answers four questions at a glance: what am I doing, how am I doing, am I
safe, what is next. Greeting is time-aware. One coaching nudge with a route
into training.

*Done when:* someone who has not seen the app can state the task, whether it
is on schedule and whether it is safe, in three seconds, in high contrast, at
arm's length.

### Safety
Four states: safe, attention, high attention, critical. **One fused verdict,
not a list of threshold breaches** — this is the core intelligence claim.

Every alert answers three things in order: what happened, why it matters, what
to do. The why sits behind a control so the default view stays calm. One
action, never two.

Seatbelt unfastened while moving is always critical.

*Done when:* heavy load, 7 degree slope and a vehicle at 12 m produce a single
high-attention alert naming all three factors, with one action and a
hold-to-acknowledge.

### Hazard Memory
Zones carry their history. Approaching one with prior events surfaces what
happened, how often and when.

*Done when:* an incident reported now changes the zone summary for the next
operator entering it, without a redeploy.

### Report Hazard
Three taps: what, severity, location. Optional photo. Auto-attaches timestamp,
machine, operator, task, zone and the telemetry snapshot at that moment.

*Done when:* under ten seconds from button to confirmation, works offline,
appears in Hazard Memory and the handover.

### Tasks and ETA
Schedule with inline predicted ETA. Expanding shows the contributor breakdown
in plain-language labels.

*Done when:* the prediction moves when inputs move, the interval is derived
from residual spread rather than invented, and you can state the method in
one sentence without lying. (Interval calibration within 5 points of nominal
is a Phase 3 criterion, checked against real held-out shifts — measuring
calibration over synthetic seed data would be theatre.)

### Coach
Today against the operator's own rolling baseline. Unusual Activity feed. One
improvement, with estimated impact and a link into training.

Never ranks operators against each other. Never shames.

*Done when:* the improvement shown is traceable to a real detected anomaly.

### Training
Three formats: 30-second decision scenario, video module, instructor booking.
Every module shows why it was assigned.

*Done when:* completion updates the skill and the Coach reflects it.

### Machine
System snapshot, hours, next service, observations, and the warning-light
lookup: photograph the symbol, tap the match from candidates, get meaning,
urgency and action. Logging a fault reaches the handover.

*Done when:* the lookup still works with the model unavailable, via the manual
symbol grid.

### Handover
Generated from live state. Tasks, times, safety events, PPE checks and
overrides, faults, zone notes, what the next shift needs to know.

*Done when:* an incident reported at shift start appears here at shift end and
the lineage is traceable.

## 7. Modes

Glance (four elements only), high contrast (direct sun), offline (everything
above except first login, model updates and fleet views).

## 8. Success metrics

**Adoption:** over 80% of shifts start with a completed check.
**Trust:** override rate under 10% and falling; alert acknowledgement over 70%.
**Safety:** proximity events per 1000 operating hours, trending down.
**Efficiency:** idle percentage and cycle-time variance, per operator, against
their own baseline.

And the one that decides whether the rest mean anything: operators, asked
directly, say it saved them something. If they do not, the other numbers are
measuring compliance theatre.
