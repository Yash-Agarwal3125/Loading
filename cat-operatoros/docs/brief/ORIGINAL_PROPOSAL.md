# Original proposal (superseded)

Kept for provenance. Where this disagrees with `docs/PRD.md`, the PRD wins.
See `README.md` in this folder for the list of what changed and why.

---

Build a polished, standalone web application called **CAT OperatorOS** —
"Less looking. Less remembering. Safer operating." A hackathon prototype for
Caterpillar's "Smart Operator Assistant for CAT machinery" challenge.

Not a fleet-management dashboard, not an admin dashboard, not primarily for
supervisors. The primary user is the machine operator sitting inside or near a
CAT machine. Goal: a polished, realistic operator experience improving safety,
productivity, learnability and ease of operation. Realistic enough to show how
it could connect to CAT telemetry, with all machine/IoT data simulated.

## Core idea

Continuously combine current telemetry, current task, operator behaviour,
historical machine behaviour, historical safety incidents, jobsite hazards,
environmental conditions and task history, and convert them into simple
actionable information.

Loop: **sense → understand → alert → assist → learn → improve.**
It should feel like a smart copilot, not a dashboard. The operator should
never interpret complicated charts while operating.

## Target operator

Long shifts, excavators and loaders, often gloved, limited attention, noisy
environment, possibly limited connectivity, does not want to type, needs
information quickly and safety information without distraction, varying
experience, wants to finish efficiently, needs plain explanations rather than
raw telemetry.

## Modules

Six primary screens: Home / Operator Dashboard, Safety, Tasks, Coach, AI
Assistant, Machine. Quick-action flows for Report Hazard, Shift Handover and
30-second Training.

**Home** answers: what am I doing, how am I doing, am I safe, what next.
Header with greeting, machine EXC001 / CAT Excavator 320, shift 08:00–17:00.
Mission card: Excavate Zone B, 78%, 14/18 cycles, AI ETA 17 min vs expected
20, status ON TRACK. Safety SAFE with seatbelt, load, slope and proximity
indicators. Next task: Load Truck T-04, 42 m away. Micro-coach: last three
cycles 12% slower than normal, tip to reduce swing distance, [Show me how].

**Dynamic safety engine.** Simulated telemetry, controllable via demo mode:
speed, load, slope, proximity, vehicle and pedestrian proximity, seatbelt,
engine, fuel, idle, cycle time. Not independent alerts — a contextual risk
engine. Example: high load + 7° slope + vehicle at 12 m + moderate speed →
HIGH ATTENTION, "vehicle entering operating radius", with a WHY breakdown and
a recommended action. States: SAFE, ATTENTION, HIGH ATTENTION, CRITICAL.
Decision support only; the app does not control the machine.

**Hazard memory.** Remember prior hazards at jobsite locations. Zone C: three
proximity events this week, common hazard vehicles entering swing radius. On
approach, show SITE MEMORY with [View incidents] / [Dismiss]. Jobsite map with
Zone A green, B yellow, C red and hazard markers. Demonstrates learning from
the jobsite rather than only reacting to sensors.

**One-tap hazard reporting.** Three taps: what happened (vehicle, person,
ground, machine, other), severity (near miss, risk, incident), location.
Auto-attach timestamp, machine ID, operator ID, task, location, telemetry.
Add the event to hazard memory.

**Personal micro-coach.** Performance against the operator's own baseline —
cycle time, idle, fuel per cycle — never shaming or ranking. One thing to
improve, with estimated impact and [Learn in 30 sec].

**Adaptive 30-second training.** Short scenario questions generated from
observed behaviour, with skills such as proximity awareness, fuel efficiency,
safe loading, slope operation, smooth operation, idle reduction, hazard
awareness.

**AI assistant.** "Ask OperatorOS", large microphone, suggested questions,
answers composed from structured application data rather than invented
telemetry. Local intent system if no LLM is available, architected for later
replacement with LLM/RAG.

**Task management and time estimation.** Today's schedule with type, location,
estimated duration, predicted ETA, progress, status and safety context.
Prediction inputs: machine, operator, task type, load cycles, idle, fuel,
engine hours, load, slope, weather, historical duration. Output: predicted ETA
with confidence and contributors.

**Machine screen.** Snapshot of engine, hydraulic, fuel, coolant and
attachment status, operating hours 1530.2, next service in 18 hours, recent
observations. Monitoring only, no control.

**Shift handover.** Automatic end-of-shift summary generated from application
data: tasks completed, operating and idle time, safety events, key
observations, next-shift note.

## Operator UX

Glance mode (current task, ETA, safety state, next action only). Glove mode
(large buttons and tap targets, long-press confirmations, minimal typing).
High-contrast mode for bright outdoor environments. Voice-first interaction
where possible.

Offline-first concept, communicated visually, with demo data stored locally.

## Data

Base schema on the supplied columns, extended with task type and duration,
slope, load weight, weather, temperature, proximity distance, vehicle count,
cycle time, location and incident type. Enough synthetic records to show
normal behaviour, inefficient behaviour, proximity events, high idle, safe
operation and varying task durations. Primary machine EXC001, primary operator
OP1001.

## Demo mode

Hidden demo controls: normal operation, trigger proximity hazard, trigger high
idle, complete task, generate coaching insight, generate shift handover.
Proximity trigger walks vehicle distance 30 m → 18 m → 12 m with high load and
7° slope, then fires the dynamic safety alert.

## Visual design

Professional and industrial rather than generic startup dashboard: rugged,
modern, high contrast, clean, operator friendly, large typography, clear
status indicators, minimal clutter, responsive and tablet friendly.
Caterpillar-inspired visual language without pretending to be official. Do not
overuse yellow or orange. Colour primarily for state: green safe, yellow
attention, red danger, neutral information. Subtle purposeful animation.
Safety alerts visually prominent.

## Tech stack

React + Vite, Tailwind, Lucide, Recharts, lightweight mock site map, backend
only if necessary. No Docker, no authentication, no microservices. Runs with
`npm install` and `npm run dev`.

## Principles

Do not overwhelm the operator. Always prioritise the most important action.
Plain language — "Vehicle approaching from your right", not "proximity
threshold violation detected"; "Your idle time is unusually high", not
"anomaly score = 0.82". Never present raw telemetry without context. Every
alert explains what happened, why it matters and what to do. Training is
generated from actual behaviour. Historical incidents improve future safety.
Reduce cognitive load. The operator should not need to interact constantly.
Safety recommendations are decision support and must not claim to replace
machine controls, CAT manuals or trained safety procedures.

## Most important requirement

Do not build a collection of disconnected screens. Behaviour → anomaly →
coaching → micro-training → improvement → new baseline. And: safety incident →
hazard memory → future approach → contextual warning → response → better site
knowledge. It should feel like a continuous learning operator companion.
