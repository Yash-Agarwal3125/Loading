/**
 * PHASE 0: check() returns a SCRIPTED result. Keep the signature below
 * intact so the Phase 2 model drops in behind it. The UI must label the
 * stub visibly. Do not build ONNX loading in Phase 0.
 *
 * On-device PPE inference.
 *
 *   loadModel()                 -> ONNX Runtime Web session, cached
 *   check(imageBitmap)          -> { result, items, confidence, modelVersion }
 *   buildPayload(checkResult)   -> server payload, STRUCTURED ONLY
 *
 * buildPayload must never include the source image. Add a unit test that
 * asserts the payload contains no image field, and keep it green — this is
 * the one regression that quietly destroys the privacy design. (Phase 0 has
 * no test runner configured; verified manually in-browser instead — see the
 * Block 7 commit.)
 *
 * Classes: helmet, hi_vis_vest, eye_protection (gating)
 *          gloves, hearing_protection (advisory, often occluded — say so)
 *
 * Tuned for recall over precision. Explain the asymmetry in the UI copy if
 * asked, not by default.
 *
 * Degrade in this order: model missing -> manual self-declaration checklist
 * -> skip with reason. Never a dead end. Phase 0 builds the two-tier version
 * docs/PRD.md §5 and DATA_GOVERNANCE.md rule 3 actually specify — missing
 * item -> retake -> override; camera/model unavailable -> skip — without
 * the intermediate self-declaration checklist. That tier is a real
 * enhancement, not built here; the fail-open guarantee holds either way.
 */

const MODEL_VERSION = 'ppe-v1.3.0-stub'
const GATING_CLASSES = ['helmet', 'hi_vis_vest', 'eye_protection']

// Two scripted outcomes, chosen by the caller — a scripted stub is
// controlled by a scenario name, not by looking at pixels. `imageBitmap`
// is accepted and ignored so the real signature is already correct; Phase
// 2 drops a model in here without ShiftStart.jsx changing at all.
const SCRIPTED_RESULTS = {
  pass: {
    helmet: { present: true, confidence: 0.94 },
    hi_vis_vest: { present: true, confidence: 0.91 },
    eye_protection: { present: true, confidence: 0.87 },
    gloves: { present: true, confidence: 0.55 },
    hearing_protection: { present: false, confidence: 0.4 },
  },
  fail: {
    helmet: { present: true, confidence: 0.92 },
    hi_vis_vest: { present: true, confidence: 0.89 },
    eye_protection: { present: false, confidence: 0.31 },
    gloves: { present: true, confidence: 0.58 },
    hearing_protection: { present: false, confidence: 0.4 },
  },
}

/** Simulates on-device latency so the UI's "checking" state means something — ADR 0001 budgets ~400ms for the real model. */
export async function check(imageBitmap, { scenario = 'pass' } = {}) {
  await new Promise((resolve) => setTimeout(resolve, 500))

  const items = SCRIPTED_RESULTS[scenario] ?? SCRIPTED_RESULTS.pass
  const missingGating = GATING_CLASSES.filter((cls) => !items[cls].present)
  const confidence = GATING_CLASSES.reduce((sum, cls) => sum + items[cls].confidence, 0) / GATING_CLASSES.length

  return {
    result: missingGating.length === 0 ? 'pass' : 'fail',
    items,
    missingGating,
    confidence: Math.round(confidence * 100) / 100,
    modelVersion: MODEL_VERSION,
    stub: true,
  }
}

/**
 * Structured server payload only. No image field, ever — see
 * DATA_GOVERNANCE.md rule 1's exact JSON shape, which this mirrors.
 * Phase 0 has no backend to send this to; it exists so the shape is
 * proven correct before there is one.
 */
export function buildPayload(checkResult, { checkId, operatorId, machineId, timestamp, overridden = false, overrideReason = null }) {
  return {
    checkId,
    operatorId,
    machineId,
    timestamp,
    result: checkResult.result,
    items: checkResult.items,
    modelVersion: checkResult.modelVersion,
    overridden,
    overrideReason,
  }
}
