import { ridgeSolve, mean, stdev, rSquared, createRng } from '../utils/stats.js'

/**
 * TASK TIME ESTIMATION — directly required by the problem statement.
 *
 * DO NOT hardcode "86% confidence". If a Caterpillar engineer asks what is
 * behind the number and the answer is "a constant", the ML claim collapses.
 * Fit something real and small at boot:
 *
 *   trainModel(seedRows) -> model          // ridge regression, closed form
 *   predict(model, taskFeatures) -> {
 *     lowMin, highMin,          // interval from residual spread, not a guess
 *     pointMin,
 *     confidence,               // derived from residual variance
 *     contributors: [{ label, deltaMin }],  // from real feature weights
 *     nSimilar,                 // how many historical rows informed this
 *   }
 *
 * FEATURES: taskType, slopeDeg, loadClass, travelMeters, weather. Not
 * loadCycles/idleMin/fuelUsedL — those are OUTCOMES of doing the task, not
 * knowable before it starts, and using them would be training-time leakage
 * for a scheduling prediction. Operator efficiency is left out too: Phase 0
 * has exactly one operator, so it is collinear with the intercept and would
 * make the fit singular. It becomes a real feature the day a second operator
 * exists.
 *
 * ALSO EXCLUDED, for a second, independent reason: payloadKg/
 * bucketFillPercent and engineRpm/throttlePercent. Even setting the leakage
 * problem aside, these are near-duplicate pairs in docs/DATA_SCHEMA.md's
 * machine-derived tier (r ≈ 0.97 and r ≈ 0.99 respectively, by construction
 * in seedTelemetry.js — payload drives bucket fill, RPM drives throttle).
 * Feeding both members of a 0.97+ pair into a regression adds no
 * information and makes the two coefficients arbitrary — the fit can trade
 * weight between them however the noise falls that run and call it
 * "explained". If a future block adds either pair as a feature, add ONE of
 * each, not both, and say which one and why.
 *
 * ~60 lines with a closed-form ridge solution (normal equations, small
 * matrix). Confidence and the interval both come from residual spread on the
 * training fit, never a made-up constant. The label itself carries
 * irreducible noise (see seedTelemetry.js) — real task duration is not a
 * deterministic function of telemetry, and a model that claimed otherwise
 * would be lying about what it knows. Held-out R² lands around 0.72-0.75,
 * not 0.96 — that lower number is the honest one.
 */

const TASK_TYPE_LEVELS = ['load', 'grade', 'trench', 'haul'] // 'dig' is the baseline (all-zero) level
const WEATHER_LEVELS = ['overcast', 'dust', 'rain'] // 'clear' is the baseline level
const LOAD_CLASS_ORDINAL = { light: 0, medium: 1, high: 2 }

const FEATURE_NAMES = [
  'slopeDeg',
  'loadClass',
  'travelMeters',
  'taskType:load',
  'taskType:grade',
  'taskType:trench',
  'taskType:haul',
  'weather:overcast',
  'weather:dust',
  'weather:rain',
]

const FEATURE_LABELS = {
  slopeDeg: 'Slope',
  loadClass: 'Load size',
  travelMeters: 'Travel distance',
  'taskType:load': 'Loading task',
  'taskType:grade': 'Grading task',
  'taskType:trench': 'Trenching task',
  'taskType:haul': 'Hauling task',
  'weather:overcast': 'Overcast weather',
  'weather:dust': 'Dusty conditions',
  'weather:rain': 'Rain',
}

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v))
}

function hasEtaFeatures(r) {
  return (
    r.taskDurationMin != null &&
    r.taskType != null &&
    r.weather != null &&
    r.loadClass != null &&
    r.slopeDeg != null &&
    r.travelMeters != null
  )
}

function encodeFeatures(r) {
  return [
    r.slopeDeg,
    LOAD_CLASS_ORDINAL[r.loadClass] ?? 0,
    r.travelMeters,
    TASK_TYPE_LEVELS.includes(r.taskType) && r.taskType === 'load' ? 1 : 0,
    r.taskType === 'grade' ? 1 : 0,
    r.taskType === 'trench' ? 1 : 0,
    r.taskType === 'haul' ? 1 : 0,
    r.weather === 'overcast' ? 1 : 0,
    r.weather === 'dust' ? 1 : 0,
    r.weather === 'rain' ? 1 : 0,
  ]
}

/** Fits on every usable row — Phase 0's "fit at boot" model, trained on the full seed set. */
export function trainModel(rows, { lambda = 0.5 } = {}) {
  const usable = rows.filter(hasEtaFeatures)
  const X = usable.map(encodeFeatures)
  const y = usable.map((r) => r.taskDurationMin)

  const { intercept, weights } = ridgeSolve(X, y, lambda)
  const predicted = X.map((row) => intercept + row.reduce((s, v, i) => s + v * weights[i], 0))
  const residuals = y.map((actual, i) => actual - predicted[i])
  const residualStdev = stdev(residuals)
  const featureMeans = FEATURE_NAMES.map((_, i) => mean(X.map((row) => row[i])))

  return {
    intercept,
    weights,
    featureNames: FEATURE_NAMES,
    featureMeans,
    residualStdev,
    meanY: mean(y),
    rows: usable, // kept for nSimilar
  }
}

/**
 * DECISION, NOT YET BUILT: residualStdev is a single fixed spread (13.76
 * min, measured) applied to every task regardless of length, so the
 * interval is always ±13.76 min in absolute terms — 27.5 min wide — no
 * matter what the point estimate is. Measured across the five scheduled
 * tasks: ±28% on the 99-minute trench task, ±69% on the 40-minute load
 * task. Neither is really right; a longer task has more opportunity for
 * delays to average out, not the same absolute uncertainty as a short one.
 *
 * IS THIS MODEL ERROR OR GENUINE VARIANCE? Both, and they're separable.
 * The 13.76 min itself is largely genuine: seedTelemetry.js deliberately
 * adds irreducible noise to taskDurationMin (±22 min jitter, on top of the
 * feature-driven signal) so the label isn't a deterministic function of
 * telemetry — see that file's comment. That part is honest and should stay
 * wide. What's model error is applying that ONE absolute number uniformly
 * to a 30-minute task and a 100-minute task alike. This is an additive
 * noise model (duration = signal + fixed-scale noise) fit on task types
 * with very different baseline durations (30-75 min); a multiplicative one
 * (fit on log(duration), or at minimum a per-task-type residual spread)
 * would make the interval scale with the task instead of swamping short
 * ones. That's real modelling work, not a threshold tweak, and doesn't
 * belong in Phase 0.
 *
 * The fix for LONG tasks (>~45 min) is to predict in segments — model the
 * task as N sub-cycles, predict each, sum the means and combine the
 * variances (they don't just add linearly if delays are correlated across
 * segments) — rather than one block regression on total duration.
 * The fix for SHORT tasks is the multiplicative-noise change above; a
 * short task doesn't need segmenting, it needs an interval that isn't
 * borrowed from tasks twice its length.
 *
 * Neither is built now. Recording the decision here so it isn't quietly
 * forgotten. Block 3 shows pointMin as the primary number with
 * [lowMin, highMin] secondary — a visibly wide range next to a confident-
 * looking point estimate is the honest version of this limitation until
 * either fix exists, not something to hide.
 */
export function predict(model, taskFeatures) {
  const x = encodeFeatures(taskFeatures)
  const pointMin = model.intercept + x.reduce((s, v, i) => s + v * model.weights[i], 0)
  const spread = model.residualStdev || pointMin * 0.15
  const lowMin = Math.max(0, pointMin - spread)
  const highMin = pointMin + spread
  const confidence = clamp(1 - spread / Math.max(model.meanY, 1), 0.3, 0.95)

  // Dummy features only make sense as a "contributor" when they are switched
  // on for this task — a load task is not meaningfully explained by "not a
  // trenching task". Continuous features (the first three) compare either
  // direction against the training mean.
  const contributors = x
    .map((v, i) => ({ name: model.featureNames[i], value: v, deltaMin: model.weights[i] * (v - model.featureMeans[i]) }))
    .filter((c, i) => i < 3 || c.value === 1)
    .filter((c) => Math.abs(c.deltaMin) > 0.3)
    .sort((a, b) => Math.abs(b.deltaMin) - Math.abs(a.deltaMin))
    .slice(0, 3)
    .map((c) => ({ label: FEATURE_LABELS[c.name] ?? c.name, deltaMin: Math.round(c.deltaMin * 10) / 10 }))

  const nSimilar = model.rows.filter((r) => r.taskType === taskFeatures.taskType).length

  return {
    lowMin: Math.round(lowMin * 10) / 10,
    highMin: Math.round(highMin * 10) / 10,
    pointMin: Math.round(pointMin * 10) / 10,
    confidence: Math.round(confidence * 100) / 100,
    contributors,
    nSimilar,
  }
}

/**
 * Trains on a random (seeded) 80/20 split and scores R² on the held-out
 * fold. Not what boots in the app — the app fits on everything it has, per
 * the docblock above — this is the honest number for "does this model
 * actually explain anything", since R² on your own training rows is not
 * that number.
 */
export function evaluateHoldout(rows, { testFraction = 0.2, lambda = 0.5, seed = 7 } = {}) {
  const usable = rows.filter(hasEtaFeatures)
  const rng = createRng(seed)
  const shuffled = [...usable]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  const testSize = Math.round(shuffled.length * testFraction)
  const testRows = shuffled.slice(0, testSize)
  const trainRows = shuffled.slice(testSize)

  const model = trainModel(trainRows, { lambda })
  const actual = testRows.map((r) => r.taskDurationMin)
  const predicted = testRows.map((r) => predict(model, r).pointMin)

  return { r2: rSquared(actual, predicted), nTrain: trainRows.length, nTest: testRows.length }
}
