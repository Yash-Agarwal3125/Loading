/**
 * Primary demo operator plus the PERSONAL BASELINE the Coach compares
 * against. The baseline is the whole point: never rank operators against
 * each other, only against their own history.
 *
 * Every field is annotated below with its evidence: whether it is
 * corroborated by the judges' four given rows (the one thing in this
 * dataset that cannot be adjusted to fit) or is generator-derived only,
 * meaning it is only as good as seedTelemetry.js's latent-variable design.
 * "Generator-derived only" is not a weaker number by definition, but it is
 * one with a narrower evidence base, worth knowing if either ever needs
 * re-justifying.
 *
 *   cycleTimeSec: 162 — GENERATOR-DERIVED ONLY. The given rows don't carry
 *     cycleTimeSec (it isn't one of the 9 given fields), so there is
 *     nothing in the fixed data to check it against. Matches the
 *     synthetic normal-operation mean (157.6s) within a few percent.
 *
 *   idlePercent: 23 — CORROBORATED. Was 8, written before any telemetry
 *     existed. The two given Fastened rows alone (idle 30 min, 15 min)
 *     already rule out 8% under any workable per-record window; their own
 *     average (~24.9% under the 90-min-per-record convention
 *     seedTelemetry.js uses) lines up with the synthetic normal-operation
 *     mean (23.0%). Corrected to 23 on both counts agreeing.
 *
 *   fuelPerCycleL: 4.8 — CORROBORATED, loosely. The two given Fastened
 *     rows' raw fuelUsedL (5.2, 6.1) average 5.65; the synthetic
 *     normal-operation mean is 4.95. 4.8 sits inside that range, not
 *     exactly matching either but not contradicted by either. Left as-is;
 *     nudged the generator up half a litre so it centres on this value
 *     rather than the reverse.
 *
 *   seatbeltCompliancePercent: 97 — TENSION, resolved in favour of the
 *     generator, not the sample. The given rows are 50% Unfastened (2 of
 *     4) — but n=4, and those two rows exist specifically to demonstrate
 *     the seatbelt/safetyAlert correlation for the challenge, not to claim
 *     "this operator is unfastened half the time." A real 50% baseline
 *     would mean the "baseline" framing itself has failed — that isn't a
 *     coaching nudge, it's a compliance crisis, and it contradicts how
 *     PRD.md and the override design (ADR 0002) both frame this as a
 *     tracked-but-recoverable metric. Kept compliance high, but raised the
 *     synthetic violation count from 2 to 5 (7 total with the given rows,
 *     96.5% -> rounds to 97) specifically so seatbelt-violation has real
 *     material in the Unusual Activity feed instead of reading as a
 *     near-non-issue with only 4 instances across 200 rows. Two of the
 *     five new violations sit inside the inefficient stretch — a tired
 *     operator plausibly skips a safety step, not just runs slower.
 *
 * KNOWN DOWNSTREAM DEPENDENCY: docs/DEMO_SCRIPT.md's Coach beat quotes
 * "Idle 38% against your own normal of 23%" — taken from
 * SEED_TELEMETRY's actual tail-of-inefficient-stretch window (see
 * state/store.jsx's RECENT_WINDOW), not invented. If seedTelemetry.js's
 * generator changes again, re-run that window and re-check the beat.
 */
export const OPERATOR = {
  id: 'OP1001',
  name: 'Operator',
  shift: { start: '08:00', end: '17:00' },
  baseline: {
    cycleTimeSec: 162, // 2:42
    idlePercent: 23,
    fuelPerCycleL: 4.8,
    seatbeltCompliancePercent: 97,
  },
}
