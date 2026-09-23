/**
 * ZoneMap
 * Static inline SVG site plan. Zones A/B/C with risk fill and incident markers. Not interactive — panning was cut.
 *
 * "Risk fill" here is incident density, not the operator's live safety
 * verdict — deliberately NOT drawn in state-safe/attention/high/critical.
 * Those colours are reserved for the fused verdict (StatusBadge is the
 * only component that emits them); reusing them on a static history map
 * would read as an active alert that isn't there. Density shows as fill
 * opacity and border weight in a neutral tone, plus a live count per zone.
 *
 * `summaries` must be computed by the caller from current store state on
 * every render (hazardMemory.summarizeZone against state.incidents), never
 * cached — that's what makes a reported hazard change the fill live.
 */
const ZONE_LAYOUT = {
  A: { x: 16, y: 16, w: 168, h: 140 },
  B: { x: 196, y: 16, w: 168, h: 140 },
  C: { x: 16, y: 168, w: 348, h: 96 },
}

function densityOpacity(count) {
  if (count === 0) return 0.06
  return Math.min(0.12 + count * 0.1, 0.5)
}

export default function ZoneMap({ zones = [], summaries = {} }) {
  return (
    <svg
      viewBox="0 0 380 280"
      width="380"
      height="280"
      className="h-auto w-full"
      role="img"
      aria-label="Site plan showing zones A, B and C"
    >
      {zones.map((zone) => {
        const layout = ZONE_LAYOUT[zone.id]
        if (!layout) return null
        const summary = summaries[zone.id]
        const count = summary?.eventCount ?? 0
        const markers = Math.min(count, 6)

        return (
          <g key={zone.id}>
            <rect
              x={layout.x}
              y={layout.y}
              width={layout.w}
              height={layout.h}
              rx="8"
              fill="var(--color-concrete-100)"
              fillOpacity={densityOpacity(count)}
              stroke="var(--color-steel-600)"
              strokeWidth={count > 0 ? 2 : 1}
            />
            <text x={layout.x + 12} y={layout.y + 22} fill="var(--color-concrete-100)" fontSize="14">
              Zone {zone.id}
            </text>
            {count > 0 && (
              <text
                x={layout.x + layout.w - 12}
                y={layout.y + 22}
                textAnchor="end"
                fill="var(--color-concrete-400)"
                fontSize="13"
                className="tabular"
              >
                {count}
              </text>
            )}
            {Array.from({ length: markers }).map((_, i) => (
              <circle
                key={i}
                cx={layout.x + 24 + (i % 3) * ((layout.w - 48) / 2)}
                cy={layout.y + layout.h - 20 - Math.floor(i / 3) * 18}
                r="4"
                fill="var(--color-concrete-100)"
                fillOpacity="0.55"
              />
            ))}
          </g>
        )
      })}
    </svg>
  )
}
