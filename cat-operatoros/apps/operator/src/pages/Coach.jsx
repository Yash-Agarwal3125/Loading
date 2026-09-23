import { useStore } from '../state/store.jsx'
import MetricCard from '../components/MetricCard.jsx'
import CoachCard from '../components/CoachCard.jsx'

/**
 * Coach
 * Block 9. Metrics vs personal baseline, Unusual Activity feed, one thing to improve.
 * Read docs/PRD.md for acceptance criteria before building.
 *
 * Never ranks against other operators — every comparison on this screen is
 * against state.operator.baseline (their own history), never a fleet
 * average, never another operator, never a leaderboard.
 *
 * seatbelt-violation is shown in its own section, not folded into the
 * Unusual Activity feed. It's a deterministic rule (row.seatbelt ===
 * 'Unfastened'), not a statistical outlier the way the other four kinds
 * are — mixing them would make "8% of records are anomalous" mean two
 * different things at once, one a rule match and one a z-score tail.
 */
const METRIC_UNITS = {
  'Idle time': '%',
  'Cycle time': 's',
  'Fuel per cycle': ' L',
  'Seatbelt compliance': '%',
}

const ANOMALY_LABELS = {
  'excessive-idle': 'Excessive idle',
  'cycle-time-drift': 'Cycle time drift',
  'fuel-per-cycle-spike': 'Fuel spike',
  'off-pattern-operation': 'Off-pattern operation',
}

export default function Coach() {
  const { state, setScreen } = useStore()
  const { coach, anomalies } = state

  const seatbeltViolations = anomalies.filter((a) => a.kind === 'seatbelt-violation')
  const statisticalAnomalies = anomalies.filter((a) => a.kind !== 'seatbelt-violation')

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl text-concrete-100">Coach</h1>

      <section>
        <p className="text-label uppercase tracking-wide text-concrete-400">Your metrics vs your normal</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {coach.metrics.map((m) => (
            <MetricCard key={m.label} {...m} unit={METRIC_UNITS[m.label] ?? ''} />
          ))}
        </div>
      </section>

      <CoachCard oneThing={coach.oneThing} onNavigate={() => setScreen('training')} />

      {seatbeltViolations.length > 0 && (
        <section>
          <p className="text-label uppercase tracking-wide text-concrete-400">Seatbelt</p>
          <p className="mt-1 text-body text-concrete-100">
            <span className="tabular">{seatbeltViolations.length}</span> unfastened record
            {seatbeltViolations.length === 1 ? '' : 's'} in your history — a rule, not a statistical pattern.
          </p>
        </section>
      )}

      <section>
        <p className="text-label uppercase tracking-wide text-concrete-400">Unusual activity</p>
        {statisticalAnomalies.length === 0 ? (
          <p className="mt-1 text-body text-concrete-400">Nothing unusual detected.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {statisticalAnomalies.map((a) => (
              <li key={a.id} className="rounded-lg border border-steel-600 bg-steel-800 p-3">
                <p className="text-label text-concrete-400">{ANOMALY_LABELS[a.kind] ?? a.kind}</p>
                <p className="text-body text-concrete-100">{a.plainLanguage}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
