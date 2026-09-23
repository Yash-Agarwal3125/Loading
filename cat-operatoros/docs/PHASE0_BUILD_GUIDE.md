# Implementation Guide

Sixteen blocks. Follow them in order. The app must run and demo at the end of
every block.

Times assume one person. Parallelise across a team by taking whole blocks, not
whole files, and keep block 2 on one person only — everything downstream
depends on those signatures.

Blocks 1 through Freeze (block 15) total 12h55m. If the window is a 12-hour
hackathon day, drop the first two items on the cut list — the training video
poster tile and the warning-light stub — before you start, not at 2 a.m.

---

## Block 1 — Scaffold (45 min)

`npm install && npm run dev`, app shell, six nav tabs pointing at stub pages,
design tokens wired, contrast toggle working.

Files: `App.jsx`, `components/BottomNavigation.jsx`, `components/OperatorHeader.jsx`

**Tailwind v4 gotcha.** There is no `tailwind.config.js` and no
`npx tailwindcss init`. It is a Vite plugin plus `@import "tailwindcss"` in
`src/index.css`, and tokens go in an `@theme` block. Teams lose half an hour
here following v3 tutorials. The config is already correct in this repo; do
not "fix" it.

*Done when:* all six tabs switch, contrast toggle visibly inverts.

---

## Block 2 — Data and engines, zero UI (85 min)

The most important block. Everything after it is rendering.

**In scope:** all of `src/data/`, `utils/stats.js`, `utils/format.js`,
`hooks/useTelemetryClock.js`, `state/store.jsx`, and exactly these five
services: `riskEngine`, `anomalyDetector`, `etaModel`, `hazardMemory`,
`coachEngine`.

**Out of scope in Phase 0:**

| File | Reason |
|---|---|
| `services/db.js` | IndexedDB/Dexie. Phase 1. |
| `services/sync.js` | Outbox sync engine. Phase 1. |
| `services/api.js` | Network client. No backend in Phase 0. |
| `services/handover.js` | Built in Block 12. |
| `services/assistant.js` | Built in Block 13. |
| `services/persistence.js` | localStorage only, built in Block 13. |

Their docblocks describe the Phase 1 product. Reading them mid-Phase-0 will
lead you to build a backend the roadmap says does not exist yet.

Seed data must open with the judges' four sample rows verbatim, then ~200
synthetic rows with real variance. Flat data produces a model with no
explanatory power and the contributor breakdown will look invented.

*Done when:* you can call `assessRisk`, `detectAnomalies` and `predict` from
the console and get sensible output. No UI yet.

---

## Block 3 — Home (90 min)

The screen judges look at longest. Take it to polish floor now, not later.

Files: `pages/Home.jsx`, `MissionCard`, `TelemetryCard`, `StatusBadge`,
`MetricCard`, plus glance mode.

*Done when:* someone who has not seen it can state task, schedule status and
safety state in three seconds.

---

## Block 4 — Safety engine and alert (75 min)

Files: `pages/Safety.jsx`, `components/SafetyAlert.jsx`, `LongPressButton`.

Includes the four states, the why-panel, hold-to-acknowledge, seatbelt
critical path, and the decision-support disclaimer on the surface itself.

---

## Block 5 — Hazard Memory (55 min)

Files: `pages/Safety.jsx` additions, `components/ZoneMap.jsx`, `HazardCard`,
`services/hazardMemory.js`.

Static inline SVG map. Do not reach for a mapping library.

---

## Block 6 — Report hazard and photo (45 min)

Files: `pages/ReportHazard.jsx`, `components/PhotoCapture.jsx`,
`utils/image.js`.

Build the shared downscale utility here; block 7 and block 11 reuse it.

**Use `<input type="file" accept="image/*" capture="environment">`**, not
`getUserMedia`. Native camera on mobile, file picker on desktop, no permission
prompt, cannot fail on stage.

**Downscale to 800 px before storing.** localStorage is about 5 MB; one
full-resolution photo can exceed that alone. Cap at three per report, wrap
writes in try/catch. A quota error mid-demo wipes the state you are
presenting.

*Done when:* reporting a hazard increments Zone C on screen.

---

## Block 7 — Shift Start and the PPE check (45 min)

Read `docs/DATA_GOVERNANCE.md` rules 1-4 and both ADRs before opening either
file below.

Files: `pages/ShiftStart.jsx`, `services/ppeCheck.js`.

Reuses the camera and downscale utility from Block 6.

**Stubbed in Phase 0:** the detector. `ppeCheck.check()` returns a scripted
result. Keep the real signature intact so the Phase 2 model drops in behind
it without a rewrite. The stub must be visibly labelled as a stub in the UI —
rule 5, never fake a model, applies here more than anywhere else in the app.

**Real in Phase 0, and this is what is actually being validated:** the notice
copy verbatim from `docs/PRD.md` §5, including the final sentence about being
able to skip; capture and the per-item result; the retake prompt; the
override in two taps with a reason picker; skip-with-reason when the camera
or model is unavailable; the result writing into the handover.

"Supervisor notified" has no real target in Phase 0. Write it to local state
and show it in the handover. Do not stub a fake toast.

*Done when:* the check completes in under 15 seconds including capture, the
override is two taps from a failed result, and there is no path through the
screen that prevents the operator from proceeding. Test that last one
deliberately — fail the check, refuse the retake, confirm you can still reach
Home.

---

## Block 8 — Tasks and ETA (55 min)

Files: `pages/Tasks.jsx`, `components/TaskCard.jsx`.

ETA renders inline on the card. There is no detail screen; it was cut.

*Done when:* the prediction moves when inputs move, the interval is derived
from residual spread rather than invented, and you can state the method in
one sentence without lying. (Interval calibration within 5 points of nominal
is a Phase 3 criterion — it needs real held-out shifts, not synthetic seed
data.)

---

## Block 9 — Coach and Unusual Activity (55 min)

Files: `pages/Coach.jsx`, `components/CoachCard.jsx`,
`services/coachEngine.js`.

The link from the one improvement into a training module is what closes the
learning loop. Without it the Coach is a dead end.

---

## Block 10 — Training Hub (25 min)

Files: `pages/Training.jsx`, `components/TrainingCard.jsx`,
`data/trainingModules.js`.

Scenario plus one video poster tile only. Instructor booking is deferred —
its ten minutes pays for Block 7 (Shift Start and the PPE check). The video
tile is a poster and a duration, labelled as a module — do not ship a play
button that does nothing.

---

## Block 11 — Machine and fault lookup (35 min)

Files: `pages/Machine.jsx`, `data/faultSymbols.js`.

Photo → candidate symbol grid → tap the match → meaning, urgency, action.
No classification claim anywhere in the copy. Logging a fault writes to recent
observations, which reaches the handover.

`services/lightCheck.js` is out of scope for the Files line above.
`classify()` is scripted in Phase 0, or skipped entirely in favour of the
manual symbol grid, which is the real Phase 0 experience. Do not build ONNX
loading here.

---

## Block 12 — Shift handover (25 min)

Files: `pages/Handover.jsx`, `services/handover.js`.

Generated from live state. This is where you prove the lineage.

---

## Block 13 — Demo controls, Ask sheet, persistence (55 min)

Files: `demo/DemoControls.jsx`, `demo/demoScenarios.js`,
`components/AskSheet.jsx`, `services/assistant.js`,
`services/persistence.js`.

Build **Play demo** as a hands-free sequence. Clicking seven buttons while
talking is how demos derail.

Pause the telemetry clock while a scenario runs, or the random walk will
overwrite your scripted values. This bug appears during rehearsal, not before.

---

## Block 14 — Polish (40 min)

Tablet breakpoints, empty states, focus rings, reduced motion, the
disclaimer, and removing anything that only half works.

---

## Block 15 — Freeze (45 min)

Stop building. Rehearse the full flow five times. **Record a clean screen
capture.** Write the four-to-five-minute pitch.

Do not skip the recording. Teams lose hackathons to a merge conflict at 11:40,
not to a missing feature.

---

## Block 16 — Voice, on a branch (50 min)

Only after block 15 is complete and the video exists.

Files: `hooks/useSpeech.js`, additions to `AskSheet`.

Hold-to-talk, live transcript on screen, local intent match, spoken answer,
tap-chips always visible underneath, scripted-transcript fallback for a loud
room.

Chrome and Edge only. Test on the actual demo laptop at actual room volume.
Merge only if it runs clean twice. If not, revert one commit and your demo is
exactly as strong as it was an hour ago.

---

## Tripwires

Hour 6: Home, Safety, Hazard Memory. Hour 9: Shift Start and Coach.

If you are behind, cut in this order and do not improvise a different order
late at night:

1. Training video poster tile
2. Warning-light stub
3. Play demo runner (click the buttons manually)
4. Unusual Activity collapses into a single Coach card
5. Voice

Never cut the PPE block or the freeze block. The first is a compulsory
feature, the second is why you have a demo at all.

## Definition of done for any block

It runs, it is reachable from the nav, it reads from the store rather than
local mock state, every intelligent surface has a provenance line, and it does
not contain a number that was not computed.
