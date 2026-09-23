/**
 * Scripted demo scenarios. These exist so the demo does not depend on a
 * random walk producing the right telemetry at the right moment.
 *
 *   normalOperation
 *   triggerProximityHazard   // vehicle 30m -> 18m -> 12m, load HIGH, slope 7deg
 *   triggerHighIdle
 *   triggerSeatbeltViolation // straight to CRITICAL
 *   completeTask             // finishes 4 min under prediction
 *   generateCoachingInsight
 *   generateShiftHandover
 *
 * Each scenario is a sequence of telemetry patches with delays. While one is
 * running, useTelemetryClock must pause its random walk.
 *
 * PLAY DEMO runs the whole sequence hands-free in about 3 minutes. Build it.
 * Clicking seven buttons while talking is how demos derail.
 */
export const SCENARIOS = {
  // TODO(Block 12)
}
