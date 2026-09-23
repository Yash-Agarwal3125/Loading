/**
 * MetricCard
 * Today vs your normal. Props: label, today, normal, direction, unit. Never renders a rank or a comparison to other operators.
 *
 * Direction is informational, not a safety verdict — this never emits
 * state colour (StatusBadge is the only component allowed to). "Worse"
 * gets an arrow, not red.
 */
export default function MetricCard({ label, today, normal, direction, unit = '' }) {
  const arrow = direction === 'worse' ? '▲' : direction === 'better' ? '▼' : '–'

  return (
    <div className="rounded-lg border border-steel-600 bg-steel-800 p-3">
      <p className="text-label text-concrete-400">{label}</p>
      <p className="tabular text-xl text-concrete-100">
        {today}
        {unit}
      </p>
      {normal != null && (
        <p className="tabular text-label text-concrete-400">
          {arrow} your normal {normal}
          {unit}
        </p>
      )}
    </div>
  )
}
