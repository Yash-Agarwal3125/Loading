/**
 * ASK OPERATOROS — local intent engine.
 *
 *   answer(question, storeSnapshot) -> { text, sourceScreen, citedFacts[] }
 *
 * DESIGN
 * - Keyword intent match. No network call, no latency, no failure mode on
 *   stage. Six intents is enough:
 *     next-task, explain-alert, eta, warning-meaning, improve-today, status
 * - Every answer is composed from the CURRENT store snapshot. The assistant
 *   must never invent telemetry. If it cannot answer from state, it says so.
 * - `citedFacts` drives the provenance line under the answer, e.g.
 *   "from your last 14 cycles". Same provenance pattern as every other card.
 *
 * LLM SWAP: keep this module's signature stable. Replacing it later means
 * writing an async adapter with the same shape, prompted with the same
 * snapshot. Nothing else in the app changes. Say that if asked about scale.
 */
export function answer(question, snapshot) {
  // TODO(Block 12)
}
