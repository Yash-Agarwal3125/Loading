/**
 * TaskCard
 * One scheduled task. Shows status, zone, predicted ETA inline (there is no separate ETA detail screen — it was cut for time).
 *
 * Range suppression matches components/MissionCard.jsx exactly: below a
 * 45-minute point estimate, etaModel.js's fixed residualStdev reads as a
 * ±35-69% range — wider than useless. Home and Tasks show the same
 * prediction object; they must not disagree about when to show the range,
 * or it looks like two different models are running.
 */
const STATUS_LABELS = {
  done: 'Done',
  active: 'In progress',
  pending: 'Scheduled',
}

function formatDelta(deltaMin) {
  const sign = deltaMin > 0 ? '+' : ''
  return `${sign}${deltaMin} min`
}

export default function TaskCard({ task }) {
  const { prediction, cycles } = task
  const progressPct = cycles?.total ? Math.round((cycles.done / cycles.total) * 100) : 0

  return (
    <details className="rounded-lg border border-steel-600 bg-steel-800 p-4">
      <summary className="cursor-pointer list-none">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-label text-concrete-400">
              <span className="tabular">{task.time}</span> · Zone {task.zone} · {STATUS_LABELS[task.status] ?? task.status}
            </p>
            <p className="mt-1 text-lg text-concrete-100">{task.title}</p>
            <p className="mt-1 text-label text-concrete-400">
              <span className="tabular">
                {cycles?.done ?? 0}/{cycles?.total ?? 0}
              </span>{' '}
              cycles
            </p>
          </div>
          {prediction && (
            <p className="tabular text-2xl text-concrete-100">{Math.round(prediction.pointMin)} min</p>
          )}
        </div>
      </summary>

      {prediction && (
        <div className="mt-3 border-t border-steel-600 pt-3">
          {prediction.pointMin >= 45 && (
            <p className="tabular text-body text-concrete-400">
              {Math.round(prediction.lowMin)}–{Math.round(prediction.highMin)} min range
            </p>
          )}
          <p className="text-label text-concrete-400">Predicted from {prediction.nSimilar} similar cycles</p>

          {prediction.contributors?.length > 0 && (
            <ul className="mt-2 space-y-1">
              {prediction.contributors.map((c) => (
                <li key={c.label} className="tabular text-body text-concrete-100">
                  {formatDelta(c.deltaMin)} — {c.label}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </details>
  )
}
