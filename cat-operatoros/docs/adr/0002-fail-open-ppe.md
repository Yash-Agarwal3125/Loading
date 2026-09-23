# ADR 0002 — The PPE check never blocks work

**Status:** accepted

## Context

A compliance check is only meaningful if it gates something. The obvious
design blocks machine start until PPE is verified.

## Decision

It never blocks. Failed check offers a retake, then an override with a logged
reason and a supervisor notification.

## Rationale

Two failure modes, and the blocking design loses to both.

A false negative in poor light would prevent someone moving a machine. In an
emergency that is a new hazard, invented by a safety tool.

And a blocking check becomes a thing to defeat: a helmet on the seat, a
borrowed vest, tape over the lens. The measurement degrades to noise while the
liability remains.

## Consequences

Compliance rate is a signal, not a guarantee, and we must say so to customers
who want the stronger claim.

The override rate becomes our most valuable production metric. It is both the
model's live accuracy signal and an early warning that a site has a real
equipment shortage rather than a behaviour problem.
