# Demo Script

Four to five minutes. Rehearse it five times before you present it. Record a
clean run as insurance before you touch any further code.

## Setup

High-contrast mode on if the room is bright. Demo drawer opened by
long-pressing the header, so a judge never finds it by accident. Ideally run
**Play demo** hands-free and talk over it.

## The run

**0:00 — Open on Shift Start.** "This is how an operator's day actually
starts." Read the notice aloud: helmet, vest, eye protection; the photo stays
on this tablet; your supervisor sees pass or fail, not the picture; you can
skip it. Capture. Show the per-item result.

**0:25 — Fail it on purpose.** Tap "Skip instead" — one tap, pick a reason,
one more tap, done. "It never blocks anyone from working. A model that
misreads a vest at 6 a.m. must not be why someone can't move a machine."
Mention, don't demonstrate: fail it twice instead of skipping and a two-tap
override appears in its place — same fail-open guarantee, logged
differently. Say plainly that detection is stubbed here and the interaction
— notice, capture, skip, override — is what is being validated. Do not let
it be discovered.

**0:40 — Home.** "This is built for one person: the operator in the seat. Not
a fleet dashboard." Task, progress, ETA, safety green.

**1:10 — The data is yours.** Point at engine hours 1530.2. "Your sample
table is the first four rows of our seed set. Everything else is synthetic
on the same schema."

**1:30 — Trigger proximity.** Vehicle closes 30 m → 18 m → 12 m. State moves
to high attention.

**1:50 — The fusion point.** "This is not a proximity alert. It fired because
three things are true at once." Open the why panel: heavy load, 7° slope,
vehicle at 12 m. One action. Hold to acknowledge.

**2:20 — Hazard Memory.** "The site already knew. Three events here this
week, all vehicles entering the swing radius." This is the differentiator;
give it a beat.

**2:40 — Report it.** Three taps, then a photo. Confirmation. Then show the
Zone C count going from 3 to 4 **live**. "The site just got smarter."

**3:10 — Task completes.** Four minutes under prediction. Open the breakdown:
"predicted from 14 similar cycles", real contributors.

**3:30 — Coach.** Idle 38% against your own normal of 23% — the tail of the
inefficient stretch in the seed data, not an invented number. One thing to
improve. "We never rank operators against each other."

**3:45 — Training.** Tap through. Thirty-second scenario, assigned *because*
of the proximity alerts earlier. "Behaviour became coaching became training."

**4:05 — Handover.** The PPE override from minute zero is here. The hazard
from minute two is here. The fault logged on the Machine screen is here.
"This is the only thing a supervisor sees, and it wrote itself."

**4:25 — Close.** "Two loops. The operator gets better, and the site
remembers. Simulated telemetry, decision support only, not a Caterpillar
product."

## Questions you will get

**"Is the PPE detection real?"** Not in this build. It returns a scripted
result and the UI says so. What is real is the interaction, the override
path, and the privacy design: on-device inference, no upload, no face
detection. Point at ADR 0001.

**"Is the ETA a real model?"** Yes — ridge regression fitted on the seed rows
at boot, interval from residual spread. Name the features.

**"Does it recognise the warning light?"** No. It narrows and confirms. The
interface is built for a classifier to drop in. Say this plainly; do not
oversell.

**"Where is the supervisor view?"** The handover, deliberately. Fleet
dashboards already exist. Nothing exists for the operator.

**"How does this connect to real machines?"** The telemetry contract is their
nine-column schema. Swap the simulator for a CAN bus or Product Link feed and
nothing above the data layer changes.

**"Offline?"** State persists locally, reports queue with a visible count.
No real sync backend in the prototype.
