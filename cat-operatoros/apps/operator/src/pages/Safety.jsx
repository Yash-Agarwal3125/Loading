import { useStore } from '../state/store.jsx'
import { ZONES } from '../data/incidents.js'
import { summarizeZone, shouldWarnOnApproach } from '../services/hazardMemory.js'
import StatusBadge from '../components/StatusBadge.jsx'
import TelemetryCard from '../components/TelemetryCard.jsx'
import MetricCard from '../components/MetricCard.jsx'
import ZoneMap from '../components/ZoneMap.jsx'
import HazardCard from '../components/HazardCard.jsx'

/**
 * Safety
 * Block 4. Live risk state, contextual indicators, seatbelt compliance, [Report hazard] entry point, decision-support disclaimer.
 * Block 5 additions: site plan, the current-zone hazard-memory card.
 * Read docs/PRD.md for acceptance criteria before building.
 *
 * The full-screen alert (SafetyAlert, mounted in App.jsx) already owns
 * acknowledging an active high/critical verdict — by the time an operator
 * could see this page underneath it, they've already dealt with it. This
 * page is the calm, always-available "check anytime" surface: current
 * state, why, and the plain-language facts it came from, whether or not
 * anything is currently wrong.
 *
 * Zone summaries are computed here, inline, from `state.incidents` on
 * every render — not in useState/useEffect-on-mount, not memoized against
 * the wrong deps. Block 6 reports a hazard through the same store
 * `incidents` array this reads; React re-renders every consumer of
 * useStore() on any state change, so as long as nothing here freezes a
 * snapshot, the Zone C count ticks live with no refresh. That's the
 * property to not break later: don't wrap summaries in useMemo unless its
 * dep array includes `incidents` itself, and don't lift them into local
 * state at all.
 */
export default function Safety() {
  const { state, setScreen } = useStore()
  const { risk, telemetry, coach, incidents } = state

  const seatbeltMetric = coach.metrics.find((m) => m.label === 'Seatbelt compliance')

  const zoneSummaries = Object.fromEntries(ZONES.map((z) => [z.id, summarizeZone(z.id, incidents)]))
  const currentZone = telemetry?.zone ?? null
  const showZoneWarning = currentZone != null && shouldWarnOnApproach(currentZone, incidents, telemetry)
  const currentZoneIncidents = currentZone ? incidents.filter((i) => i.zone === currentZone) : []

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl text-concrete-100">Safety</h1>
        <StatusBadge state={risk.state} label={risk.headline} />
      </div>

      {risk.factors?.length > 0 && (
        <details className="rounded-lg border border-steel-600 bg-steel-800 p-3">
          <summary className="min-h-tap cursor-pointer text-body text-concrete-400">Why am I seeing this</summary>
          <ul className="mt-2 space-y-1">
            {risk.factors.map((f) => (
              <li key={f.label} className="text-body text-concrete-100">
                {f.detail}
              </li>
            ))}
          </ul>
        </details>
      )}

      <p className="text-body text-concrete-100">{risk.action}</p>

      <TelemetryCard telemetry={telemetry} />

      {seatbeltMetric && (
        <div className="max-w-[10rem]">
          <MetricCard {...seatbeltMetric} unit="%" />
        </div>
      )}

      <section>
        <p className="text-label uppercase tracking-wide text-concrete-400">Site plan</p>
        <div className="mt-2 rounded-lg border border-steel-600 bg-steel-800 p-3">
          <ZoneMap zones={ZONES} summaries={zoneSummaries} />
        </div>
      </section>

      {showZoneWarning && (
        <HazardCard zoneId={currentZone} summary={zoneSummaries[currentZone]} incidents={currentZoneIncidents} />
      )}

      <button
        type="button"
        onClick={() => setScreen('report')}
        className="min-h-tap w-full rounded-lg border border-steel-600 bg-steel-800 text-lg text-concrete-100"
      >
        Report hazard
      </button>

      <p className="text-label text-concrete-400">
        Decision support only. This does not control the machine and does not replace machine
        controls, service manuals or trained safety procedure.
      </p>
    </div>
  )
}
