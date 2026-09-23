# ADR 0001 — PPE inference runs on the device

**Status:** accepted

## Context

The PPE check photographs a worker. Worker imagery is personal data under
India's DPDP Act 2023 and GDPR. Server-side inference would give us a larger
model, easier updates and centralised evaluation data.

## Decision

Inference runs on the tablet. The photo never leaves the device. The server
receives structured results plus a 256px thumbnail retained 7 days.

We accept a smaller model and harder update mechanics in exchange.

## Consequences

Most of the privacy surface disappears. No image transfer, no image-at-rest
policy on the server, a far narrower DPIA scope, and a claim we can make
plainly to operators and to procurement.

Costs: on-device models are constrained to roughly 10 MB and 400 ms. Model
updates need a distribution mechanism and staged rollout. We lose the option
of retraining directly on production images, so training data must be gathered
under explicit, separate consent.

## Do not reverse casually

Moving to server-side inference is a DPIA trigger and, at most European sites,
a works council re-consultation. It is not a performance optimisation.
