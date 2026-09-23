/**
 * PHASE 0: classify() returns SCRIPTED candidates, or is skipped
 * entirely in favour of the manual symbol grid, which is the real
 * Phase 0 experience. Do not build ONNX loading in Phase 0.
 *
 * On-device warning-light classification.
 *
 *   classify(imageBitmap) -> { candidates: [{ symbolId, confidence }], modelVersion }
 *
 * Returns TOP THREE for operator confirmation. The UI never states that the
 * symbol was identified — the operator taps the match. That confirmation is
 * also the labelled data that improves the model.
 *
 * Low confidence or model unavailable -> full symbol grid, works offline.
 */
// TODO
