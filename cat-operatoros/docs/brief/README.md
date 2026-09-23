# Brief

Source material for the project, kept in the repo so the requirements do not
drift away from the original ask.

| File | What |
|---|---|
| `PROBLEM_STATEMENT.md` | The challenge, transcribed, plus the mapping to our build |
| `problem-statement-p1.jpg` | Source image: background, challenge, expected outcomes |
| `problem-statement-p2.jpg` | Source image: task time estimation and the data table |
| `ORIGINAL_PROPOSAL.md` | The first solution draft, before review |

`ORIGINAL_PROPOSAL.md` is kept for provenance, not as a specification. Where
it disagrees with `docs/PRD.md`, the PRD wins. The main differences, and why:

- The proposal treated seatbelt compliance as a status indicator. It is a
  first-class safety feature with its own critical state.
- Training was quiz-only. The brief names three formats; all three ship.
- Anomaly detection was folded into coaching. It has its own surface now.
- ETA confidence was to be hardcoded. It is a fitted model with a calibrated
  interval, because the hardcoded version does not survive one follow-up
  question.
- The proposal was scoped as a one-day prototype. This is now a product, with
  the prototype preserved as Phase 0 in `docs/ROADMAP.md`.
