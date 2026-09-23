/**
 * TelemetryCard
 * Contextual indicator strip: seatbelt, load, slope, proximity. Plain words, no raw units without meaning.
 *
 * Deliberately neutral — no state colour here even when a value looks
 * concerning (e.g. Unfastened). The fused safety verdict lives in
 * StatusBadge; this strip is the plain-language facts it was fused from.
 */
function describeProximity(proximityM) {
  if (proximityM == null) return 'Clear'
  return `Vehicle at ${Math.round(proximityM)} m`
}

export default function TelemetryCard({ telemetry }) {
  if (!telemetry) return null

  const items = [
    { label: 'Seatbelt', value: telemetry.seatbelt ?? '—' },
    { label: 'Load', value: telemetry.loadClass ? `${telemetry.loadClass} load` : '—' },
    { label: 'Slope', value: telemetry.slopeDeg != null ? `${Math.round(telemetry.slopeDeg)}°` : '—' },
    { label: 'Proximity', value: describeProximity(telemetry.proximityM) },
  ]

  return (
    <section className="grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Current conditions">
      {items.map((item) => (
        <div key={item.label} className="rounded-lg border border-steel-600 bg-steel-800 p-3">
          <p className="text-label text-concrete-400">{item.label}</p>
          <p className="tabular text-body text-concrete-100">{item.value}</p>
        </div>
      ))}
    </section>
  )
}
