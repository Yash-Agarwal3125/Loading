import { useState } from 'react'

/**
 * HazardCard
 * Site memory card. 'N safety events have previously occurred here', common hazard, [View incidents] [Dismiss]. Must re-render when a new incident lands.
 *
 * `summary` (hazardMemory.summarizeZone output) and `incidents` (the raw
 * list for this zone) are computed by the caller from live store state on
 * every render, never cached — this component only displays whatever it's
 * handed, which is what makes the count tick live when a hazard is
 * reported. `dismissed` is local and session-only (no persistence exists
 * yet); it hides this specific card, not the underlying zone history or
 * the map's live count.
 */
export default function HazardCard({ zoneId, summary, incidents = [] }) {
  const [dismissed, setDismissed] = useState(false)
  const [showIncidents, setShowIncidents] = useState(false)

  if (dismissed || !summary || summary.eventCount === 0) return null

  return (
    <section className="rounded-lg border border-steel-600 bg-steel-800 p-4">
      <p className="text-body text-concrete-100">
        <span className="tabular">{summary.eventCount}</span> safety event{summary.eventCount === 1 ? '' : 's'}{' '}
        {summary.window} in Zone {zoneId}
      </p>
      {summary.commonHazard && (
        <p className="mt-1 text-label text-concrete-400">Most common: {summary.commonHazard}</p>
      )}

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => setShowIncidents((v) => !v)}
          className="min-h-tap flex-1 rounded border border-steel-600 text-label text-concrete-100"
        >
          {showIncidents ? 'Hide incidents' : 'View incidents'}
        </button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="min-h-tap flex-1 rounded border border-steel-600 text-label text-concrete-400"
        >
          Dismiss
        </button>
      </div>

      {showIncidents && (
        <ul className="mt-3 space-y-2 border-t border-steel-600 pt-3">
          {incidents.map((inc) => (
            <li key={inc.id} className="text-label text-concrete-400">
              <span className="text-concrete-100">{inc.type}</span> · {inc.severity} ·{' '}
              {new Date(inc.timestamp).toLocaleString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
