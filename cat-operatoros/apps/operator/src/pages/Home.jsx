import { useStore } from '../state/store.jsx'
import { greeting } from '../utils/format.js'
import MissionCard from '../components/MissionCard.jsx'
import TelemetryCard from '../components/TelemetryCard.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import MetricCard from '../components/MetricCard.jsx'

/**
 * Home
 * Block 3. Answers four questions in one glance: what am I doing, how am I doing, am I safe, what is next. Also hosts glance mode.
 * Read docs/PRD.md for acceptance criteria before building.
 */

const METRIC_UNITS = {
  'Idle time': '%',
  'Cycle time': 's',
  'Fuel per cycle': ' L',
  'Seatbelt compliance': '%',
}

// Home shows two metrics, not all four — worse-than-normal ones first, so
// the thing worth noticing is what's visible without scrolling.
function pickHomeMetrics(metrics) {
  const worse = metrics.filter((m) => m.direction === 'worse')
  const rest = metrics.filter((m) => m.direction !== 'worse')
  return [...worse, ...rest].slice(0, 2)
}

export default function Home() {
  const { state, setScreen, toggleGlance } = useStore()
  const { tasks, telemetry, risk, coach, operator, mode } = state

  const activeTask = tasks.find((t) => t.status === 'active') ?? tasks.find((t) => t.status === 'pending')
  const nextTask = tasks.find((t) => t.status === 'pending' && t.id !== activeTask?.id)

  if (mode.glance) {
    return <GlanceHome activeTask={activeTask} risk={risk} nextTask={nextTask} onExit={toggleGlance} />
  }

  return (
    <div className="space-y-4 p-4">
      <header className="flex items-center justify-between">
        <p className="text-lg text-concrete-100">
          {greeting()}, {operator.name}
        </p>
        <button
          type="button"
          onClick={toggleGlance}
          className="min-h-tap rounded px-3 text-label text-concrete-400"
        >
          Glance mode
        </button>
      </header>

      <MissionCard task={activeTask} risk={risk} />

      <TelemetryCard telemetry={telemetry} />

      <section>
        <p className="text-label uppercase tracking-wide text-concrete-400">How you're doing</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {pickHomeMetrics(coach.metrics).map((m) => (
            <MetricCard key={m.label} {...m} unit={METRIC_UNITS[m.label] ?? ''} />
          ))}
        </div>

        <div className="mt-3 rounded-lg border border-steel-600 bg-steel-800 p-3">
          <p className="text-body text-concrete-100">{coach.oneThing.text}</p>
          {coach.oneThing.isInvitation ? (
            <button
              type="button"
              onClick={() => setScreen('training')}
              className="mt-2 min-h-tap text-label text-concrete-400 underline"
            >
              {coach.oneThing.invitation}
            </button>
          ) : (
            <>
              <p className="mt-1 text-label text-concrete-400">
                Compared against your last {coach.sampleSize} cycles
              </p>
              <button
                type="button"
                onClick={() => setScreen('training')}
                className="mt-2 min-h-tap text-label text-concrete-100 underline"
              >
                Improve this
              </button>
            </>
          )}
        </div>
      </section>

      {nextTask && (
        <p className="text-body text-concrete-400">
          Next: <span className="tabular">{nextTask.time}</span> — {nextTask.title}
        </p>
      )}
    </div>
  )
}

/** PRD §7: glance mode shows four elements only — task, ETA, safety, next up. */
function GlanceHome({ activeTask, risk, nextTask, onExit }) {
  return (
    <div className="relative flex h-full flex-col items-center justify-center gap-6 p-6 text-center">
      <button
        type="button"
        onClick={onExit}
        className="absolute right-4 top-4 min-h-tap min-w-tap text-label text-concrete-400 underline"
      >
        Exit glance
      </button>

      <p className="text-3xl text-concrete-100">{activeTask ? activeTask.title : 'No active task'}</p>

      <p className="tabular text-glance text-concrete-100">
        {activeTask?.prediction ? `${Math.round(activeTask.prediction.pointMin)} min` : '—'}
      </p>

      <StatusBadge state={risk.state} label={risk.headline} size="lg" />

      <p className="text-lg text-concrete-400">
        Next: {nextTask ? `${nextTask.time} — ${nextTask.title}` : 'Nothing else scheduled'}
      </p>
    </div>
  )
}
