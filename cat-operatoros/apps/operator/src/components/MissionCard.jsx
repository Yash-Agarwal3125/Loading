import StatusBadge from './StatusBadge.jsx'

/**
 * MissionCard
 * Home hero. Current task, progress bar, cycles done/total, AI ETA vs expected, on-track verdict. Largest type in the app after glance mode.
 *
 * Carries the safety badge too, not just the task — "what am I doing" and
 * "am I safe" need to land in the same glance, not a scroll apart.
 */
function onTrackVerdict(task) {
  if (!task?.prediction || task.estimatedMin == null) return null
  const over = task.prediction.pointMin - task.estimatedMin
  if (over <= task.estimatedMin * 0.05) return 'On schedule'
  if (over <= task.estimatedMin * 0.2) return 'Running a little long'
  return 'Running behind'
}

export default function MissionCard({ task, risk }) {
  if (!task) {
    return (
      <section className="rounded-xl border border-steel-600 bg-steel-800 p-5">
        <p className="text-lg text-concrete-100">No active task right now.</p>
      </section>
    )
  }

  const { prediction, cycles } = task
  const progressPct = cycles?.total ? Math.round((cycles.done / cycles.total) * 100) : 0
  const verdict = onTrackVerdict(task)

  return (
    <section className="rounded-xl border border-steel-600 bg-steel-800 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-label uppercase tracking-wide text-concrete-400">Current task</p>
          <h2 className="mt-1 text-2xl text-concrete-100">{task.title}</h2>
        </div>
        {risk && <StatusBadge state={risk.state} label={risk.headline} size="sm" />}
      </div>

      <p className="mt-1 text-body text-concrete-400">
        Zone {task.zone} · <span className="tabular">{cycles?.done ?? 0}/{cycles?.total ?? 0}</span> cycles
      </p>

      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-steel-700">
        <div className="h-full rounded-full bg-concrete-100" style={{ width: `${progressPct}%` }} />
      </div>

      {prediction && (
        <div className="mt-4">
          <p className="text-label text-concrete-400">Predicted time</p>
          <p className="tabular text-3xl text-concrete-100">{Math.round(prediction.pointMin)} min</p>
          {/*
            etaModel.js's residualStdev is one fixed absolute spread applied
            to every task regardless of length (documented there). Below
            ~45 min that reads as a ±35-69% range — wider than useless,
            actively misleading next to a confident-looking point estimate.
            docs/AI_GUIDELINES.md §7: "when the system is uncertain, it says
            less rather than guessing." Below the threshold, say less: the
            point estimate and its provenance, no range. This is a display
            rule only — the model isn't touched, and the range still shows
            for tasks long enough that the same absolute spread is a
            reasonable relative one.
          */}
          {prediction.pointMin >= 45 && (
            <p className="tabular text-body text-concrete-400">
              {Math.round(prediction.lowMin)}–{Math.round(prediction.highMin)} min range
            </p>
          )}
          <p className="mt-1 text-label text-concrete-400">Predicted from {prediction.nSimilar} similar cycles</p>
        </div>
      )}

      {verdict && <p className="mt-3 text-lg text-concrete-100">{verdict}</p>}
    </section>
  )
}
