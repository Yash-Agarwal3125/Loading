import { mean } from '../utils/stats.js'
import { TRAINING_MODULES } from '../data/trainingModules.js'

/**
 * PERSONAL MICRO-COACH.
 *
 *   buildCoaching(history, baseline, anomalies) -> {
 *     metrics: [{ label, today, normal, direction }],
 *     oneThing: { text, estimatedImpact, linkedModuleId, isInvitation? },
 *     sampleSize: number,  // history.length — for an honest provenance
 *                          // line ("compared against your last N cycles").
 *                          // "cycles" to match the ETA screen's vocabulary
 *                          // (docs/AI_GUIDELINES.md's own examples use
 *                          // different nouns per surface — "cycles",
 *                          // "shifts" — but two different nouns on the
 *                          // same Home screen reads as inconsistent, not
 *                          // context-appropriate)
 *   }
 *
 * EMPTY STATE: when no metric is worse than baseline by more than
 * MATERIALITY_THRESHOLD, oneThing is not "nothing to report" — per
 * docs/AI_GUIDELINES.md §8, an empty state is an invitation, not a status.
 * It says the operator is matching their own normal and points at Training
 * as something to do anyway, the same shape as "No hazards reported this
 * shift. Report one if you see something." `isInvitation: true` marks this
 * case so a later block can style it differently from a real oneThing
 * (no impact estimate, no anomaly-linked module — there is nothing to link).
 * Without a materiality floor this branch was unreachable: a metric even
 * 1% above baseline still counted as "worse" and got surfaced as the one
 * thing to fix, which is noise dressed up as coaching.
 *
 * RULES
 * - Compare to the operator's OWN baseline. Never to other operators, never
 *   to a fleet average, never a leaderboard. The spec says do not shame.
 * - Return exactly ONE improvement. Three recommendations is a report; one
 *   is coaching.
 * - `linkedModuleId` is what closes the loop into the Training Hub. Without
 *   it the Coach is a dead end and the "continuous learning" pitch breaks.
 *
 * `history` is whatever window the caller wants coached against (today's
 * shift, this week — the function itself has no calendar opinion). Idle
 * percent uses the same 90-minute-per-record convention seedTelemetry.js
 * uses to derive duty cycle, so it is directly comparable to
 * OPERATOR.baseline.idlePercent.
 */

const ASSUMED_RECORD_WINDOW_MIN = 90

const METRIC_SKILL = {
  'Idle time': 'Idle reduction',
  'Cycle time': 'Smooth operation',
  'Fuel per cycle': 'Fuel efficiency',
  'Seatbelt compliance': 'Hazard awareness',
}

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v))
}

function round1(n) {
  return Math.round(n * 10) / 10
}

export function buildCoaching(history = [], baseline = {}, anomalies = []) {
  const idleToday = mean(history.map((r) => clamp((r.idlingTimeMin ?? 0) / ASSUMED_RECORD_WINDOW_MIN, 0, 1) * 100))
  const cycleToday = mean(history.map((r) => r.cycleTimeSec).filter((v) => v != null))
  // baseline.fuelPerCycleL is calibrated against raw fuelUsedL per record,
  // not fuelUsedL / loadCycles — see the same note in anomalyDetector.js.
  const fuelPerCycleToday = mean(history.map((r) => r.fuelUsedL).filter((v) => v != null))
  const seatbeltComplianceToday = history.length
    ? (history.filter((r) => r.seatbelt === 'Fastened').length / history.length) * 100
    : 100

  const metrics = [
    {
      label: 'Idle time',
      today: round1(idleToday),
      normal: baseline.idlePercent ?? null,
      direction: idleToday > (baseline.idlePercent ?? idleToday) ? 'worse' : 'better',
    },
    {
      label: 'Cycle time',
      today: Math.round(cycleToday || 0),
      normal: baseline.cycleTimeSec ?? null,
      direction: cycleToday > (baseline.cycleTimeSec ?? cycleToday) ? 'worse' : 'better',
    },
    {
      label: 'Fuel per cycle',
      today: round1(fuelPerCycleToday || 0),
      normal: baseline.fuelPerCycleL ?? null,
      direction: fuelPerCycleToday > (baseline.fuelPerCycleL ?? fuelPerCycleToday) ? 'worse' : 'better',
    },
    {
      label: 'Seatbelt compliance',
      today: round1(seatbeltComplianceToday),
      normal: baseline.seatbeltCompliancePercent ?? null,
      direction: seatbeltComplianceToday < (baseline.seatbeltCompliancePercent ?? seatbeltComplianceToday) ? 'worse' : 'better',
    },
  ]

  return { metrics, oneThing: pickOneThing(metrics, anomalies), sampleSize: history.length }
}

// Below this relative deviation, "worse than normal" is noise, not
// something worth a coaching nudge over.
const MATERIALITY_THRESHOLD = 0.15

function relativeDeviation(metric) {
  if (!metric.normal) return 0
  return Math.abs(metric.today - metric.normal) / Math.abs(metric.normal)
}

function pickOneThing(metrics, anomalies) {
  const worse = metrics.filter(
    (m) => m.direction === 'worse' && m.normal != null && relativeDeviation(m) >= MATERIALITY_THRESHOLD,
  )
  const worst = [...worse].sort((a, b) => relativeDeviation(b) - relativeDeviation(a))[0]

  if (!worst) {
    return {
      text: "You're matching your own normal across the board today.",
      estimatedImpact: null,
      linkedModuleId: null,
      isInvitation: true,
      invitation: 'Browse the Training Hub any time to stay sharp.',
    }
  }

  const skill = METRIC_SKILL[worst.label] ?? 'Hazard awareness'
  const module = TRAINING_MODULES.find((m) => m.skill === skill)
  const relevantAnomaly = anomalies.find((a) => METRIC_SKILL[worst.label] && anomalyMatchesMetric(a.kind, worst.label))

  return {
    text: buildOneThingText(worst),
    estimatedImpact: buildImpactText(worst),
    linkedModuleId: module ? module.id : null,
    _anomalyId: relevantAnomaly ? relevantAnomaly.id : null, // provenance for a "why" link, not rendered
  }
}

function anomalyMatchesMetric(kind, label) {
  if (label === 'Idle time') return kind === 'excessive-idle'
  if (label === 'Cycle time') return kind === 'cycle-time-drift'
  if (label === 'Fuel per cycle') return kind === 'fuel-per-cycle-spike'
  if (label === 'Seatbelt compliance') return kind === 'seatbelt-violation'
  return false
}

function buildOneThingText(metric) {
  if (metric.label === 'Idle time') return `Idle time is running at ${metric.today}%, above your normal ${metric.normal}%.`
  if (metric.label === 'Cycle time') return `Cycle time is averaging ${metric.today}s, above your normal ${metric.normal}s.`
  if (metric.label === 'Fuel per cycle') return `Fuel per cycle is ${metric.today} L, above your normal ${metric.normal} L.`
  if (metric.label === 'Seatbelt compliance') return `Seatbelt compliance is ${metric.today}%, below your normal ${metric.normal}%.`
  return `${metric.label} is off your normal pace.`
}

function buildImpactText(metric) {
  if (metric.label === 'Idle time') return 'Closing the gap to your normal idle time saves fuel and keeps cycles moving.'
  if (metric.label === 'Cycle time') return 'Getting cycle time back to your normal pace recovers minutes across the shift.'
  if (metric.label === 'Fuel per cycle') return 'Bringing fuel per cycle back down adds up over a full shift.'
  if (metric.label === 'Seatbelt compliance') return 'This is the one that matters most — fix it first.'
  return null
}
