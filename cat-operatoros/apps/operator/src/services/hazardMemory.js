/**
 * HAZARD MEMORY — the signature differentiator. Not in the problem
 * statement, which is exactly why it scores.
 *
 *   summarizeZone(zoneId, incidents) -> {
 *     eventCount, window: 'this week', commonHazard, lastEvent, severityMix
 *   }
 *   shouldWarnOnApproach(zoneId, incidents, telemetry) -> boolean
 *
 * THE LOOP THAT MUST BE DEMONSTRABLE:
 *   incident reported -> stored -> operator approaches zone later ->
 *   contextual warning -> operator responds -> new data sharpens the zone
 *
 * A hazard reported during the demo must change the Zone C card immediately.
 * If the count does not tick from 3 to 4 on screen, the feature reads as
 * static mock data and the differentiator is lost.
 */

const WEEK_MS = 7 * 24 * 60 * 60 * 1000

export function summarizeZone(zoneId, incidents) {
  const zoneIncidents = incidents.filter((i) => i.zone === zoneId)

  if (zoneIncidents.length === 0) {
    return { eventCount: 0, window: 'this week', commonHazard: null, lastEvent: null, severityMix: {} }
  }

  const now = Date.now()
  const thisWeek = zoneIncidents.filter((i) => now - new Date(i.timestamp).getTime() <= WEEK_MS)

  const typeCounts = {}
  for (const i of zoneIncidents) typeCounts[i.type] = (typeCounts[i.type] ?? 0) + 1
  const commonHazard = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0][0]

  const severityMix = {}
  for (const i of zoneIncidents) severityMix[i.severity] = (severityMix[i.severity] ?? 0) + 1

  const lastEvent = zoneIncidents.reduce((latest, i) =>
    new Date(i.timestamp) > new Date(latest.timestamp) ? i : latest,
  ).timestamp

  return {
    eventCount: thisWeek.length,
    window: 'this week',
    commonHazard,
    lastEvent,
    severityMix,
  }
}

export function shouldWarnOnApproach(zoneId, incidents, telemetry = {}) {
  if (telemetry.zone != null && telemetry.zone !== zoneId) return false
  return summarizeZone(zoneId, incidents).eventCount > 0
}
