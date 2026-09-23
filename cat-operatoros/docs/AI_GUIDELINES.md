# AI Guidelines

How the intelligence in this product is allowed to behave, what it may claim,
and how it speaks. These rules exist because the fastest way to lose a
Caterpillar hackathon is to make a claim that does not survive one follow-up
question.

## 1. Do not fake a model

The single hardest rule. Every number the UI presents as computed must
actually be computed.

| Surface | Allowed | Not allowed |
|---|---|---|
| ETA | Fitted ridge regression or kNN over seed rows, interval from residual spread | A hardcoded "86% confidence" |
| Anomalies | Rolling z-score or IQR against the operator's own baseline | A fixed list of "detected" issues |
| Risk state | Fusion of live telemetry fields | A scripted state that ignores telemetry |
| Fault symbol | Operator taps the match from a candidate grid | Claiming the photo was recognised |
| Assistant | Intent match over current store state | Inventing telemetry that is not in state |

If something is a stub, label it a stub and show the interface contract. "The
prototype narrows and confirms; the interface is built for a classifier to
drop in" is a respectable answer. A fake one is not recoverable.

## 2. Every alert answers three questions, in order

1. **What happened.** One sentence, plain words.
2. **Why it matters.** The contributing factors, behind a control so the
   default view stays calm.
3. **What to do.** Exactly one instruction, imperative voice.

One action, never two. Two actions is an operator making a decision while
operating a machine.

## 3. Language rules

The operator is not a software engineer and is not reading carefully.

| Write | Not |
|---|---|
| Vehicle approaching from your right | Proximity threshold violation detected |
| Your idle time is unusually high | Anomaly score = 0.82 |
| Reduce movement until the truck clears | Recommend velocity attenuation |
| Predicted from 14 similar cycles | Model inference complete |
| 3 safety events have happened here | Historical incident density: high |

Never present raw telemetry without meaning. "Vehicle at 12 m" is fine because
the distance is the meaning. "Load index 0.74" is not.

Sentence case. Active voice. A button that says Report produces a confirmation
that says Reported.

## 4. Provenance on every intelligent surface

Anything the system concluded must show what it concluded it from. One short
line, same pattern everywhere:

- "Because 3 events happened here this week"
- "Predicted from 14 similar cycles"
- "Assigned because your proximity alerts rose this week"
- "Compared against your last 30 shifts"

This is the cheapest thing in the build and it does more work than any other
single detail. It is what makes six screens read as one system.

## 5. Scoring and comparison

Compare the operator to their own past. Never to other operators, never to a
fleet average, never a leaderboard, never a grade.

Surface exactly one improvement at a time. Three recommendations is a
performance review; one is coaching.

Training is assigned from observed behaviour, never from a fixed curriculum.
A module with no `triggeredBy` should not be shown.

## 6. The assistant

Answers are composed from the current store snapshot. The assistant has no
knowledge outside application state and must say so rather than guess:

> I don't have that in this session.

Six intents is enough: next task, explain the last alert, how long remaining,
what a warning means, what to improve today, current status.

Keep `answer(question, snapshot)` stable. Swapping in an LLM later means
writing an async adapter with the same signature, prompted with the same
snapshot, and nothing else in the app changes. That is the honest answer to
"how would this scale".

## 7. Safety boundaries

The app is decision support. It does not actuate anything, and it never
implies it could. No "stopping machine", no "engaging brake", no language that
suggests the software is in the loop.

It does not replace machine controls, CAT service manuals, or trained safety
procedure. Say so on the safety surface itself, not only in a footer.

Telemetry is simulated for the prototype. State it once, clearly, where it
cannot be missed.

When the system is uncertain, it says less rather than guessing. An operator
acting on a confident wrong instruction is worse than an operator getting no
instruction.

## 8. Failure and emptiness

Errors explain what happened and what to do, in the interface's voice. They do
not apologise and they are never vague.

An empty state is an invitation: "No hazards reported this shift. Report one
if you see something." Not "No data available."

If telemetry stops, say the connection dropped and show the last known values
with their timestamp. Never show a stale number as if it were live.
