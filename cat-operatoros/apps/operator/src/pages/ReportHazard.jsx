import { useState } from 'react'
import { useStore } from '../state/store.jsx'
import PhotoCapture from '../components/PhotoCapture.jsx'

/**
 * ReportHazard
 * Block 6. Three taps: what, severity, location. Optional fourth step: photo. Auto-attaches timestamp, machine, operator, task, telemetry.
 * Read docs/PRD.md for acceptance criteria before building.
 *
 * "Auto-attaches ... zone" (PRD §6) and "location" being one of the three
 * required taps are the same field, not two: the zone step defaults to
 * state.telemetry.zone (pre-highlighted) so confirming it is the tap,
 * not free entry. timestamp/machineId/operatorId/task/telemetrySnapshot
 * are attached by the store's reportHazard reducer itself (Block 2/4),
 * not duplicated here.
 *
 * The three taps (what, severity, location) are local wizard state, not
 * dispatched to the store incrementally — the actual reportHazard() call
 * happens once, after the photo step, whether a photo was added or
 * skipped. That keeps the store action a single, honest creation rather
 * than needing an "update an existing incident" mechanism that doesn't
 * exist.
 */
const HAZARD_TYPES = [
  { id: 'proximity', label: 'Vehicle proximity' },
  { id: 'near-miss', label: 'Near miss' },
  { id: 'equipment', label: 'Equipment issue' },
  { id: 'spill', label: 'Spill' },
  { id: 'other', label: 'Other' },
]

const SEVERITIES = [
  { id: 'low', label: 'Low' },
  { id: 'medium', label: 'Medium' },
  { id: 'high', label: 'High' },
]

const ZONE_IDS = ['A', 'B', 'C']

export default function ReportHazard() {
  const { state, reportHazard, setScreen } = useStore()
  const [step, setStep] = useState('what')
  const [hazardType, setHazardType] = useState(null)
  const [severity, setSeverity] = useState(null)
  const [zone, setZone] = useState(state.telemetry?.zone ?? 'A')
  const [photos, setPhotos] = useState([])
  const [submitted, setSubmitted] = useState(false)

  function submit(finalPhotos) {
    reportHazard({ zone, hazardType, severity, photos: finalPhotos })
    try {
      localStorage.removeItem('hazardPhotoDraft')
    } catch {
      // Best-effort cleanup of PhotoCapture's local cache; the report
      // itself already succeeded above regardless of this.
    }
    setSubmitted(true)
  }

  if (submitted) {
    const hazardLabel = HAZARD_TYPES.find((h) => h.id === hazardType)?.label ?? 'Hazard'
    const severityLabel = SEVERITIES.find((s) => s.id === severity)?.label ?? ''
    return (
      <div className="space-y-4 p-4">
        <h1 className="text-2xl text-concrete-100">Reported</h1>
        <p className="text-body text-concrete-100">
          {severityLabel} severity {hazardLabel.toLowerCase()} logged in Zone {zone}.
        </p>
        <button
          type="button"
          onClick={() => setScreen('safety')}
          className="min-h-tap w-full rounded-lg border border-steel-600 bg-steel-800 text-lg text-concrete-100"
        >
          Back to Safety
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl text-concrete-100">Report hazard</h1>

      {step === 'what' && (
        <section>
          <p className="text-label uppercase tracking-wide text-concrete-400">What happened</p>
          <div className="mt-2 grid grid-cols-1 gap-2">
            {HAZARD_TYPES.map((h) => (
              <button
                key={h.id}
                type="button"
                onClick={() => {
                  setHazardType(h.id)
                  setStep('severity')
                }}
                className="min-h-tap rounded-lg border border-steel-600 bg-steel-800 text-lg text-concrete-100"
              >
                {h.label}
              </button>
            ))}
          </div>
        </section>
      )}

      {step === 'severity' && (
        <section>
          <p className="text-label uppercase tracking-wide text-concrete-400">Severity</p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {SEVERITIES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setSeverity(s.id)
                  setStep('location')
                }}
                className="min-h-tap rounded-lg border border-steel-600 bg-steel-800 text-lg text-concrete-100"
              >
                {s.label}
              </button>
            ))}
          </div>
        </section>
      )}

      {step === 'location' && (
        <section>
          <p className="text-label uppercase tracking-wide text-concrete-400">Location</p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {ZONE_IDS.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setZone(id)
                  setStep('photo')
                }}
                className={`min-h-tap rounded-lg border bg-steel-800 text-lg text-concrete-100 ${
                  id === zone ? 'border-concrete-100' : 'border-steel-600'
                }`}
              >
                Zone {id}
              </button>
            ))}
          </div>
          <p className="mt-2 text-label text-concrete-400">Zone {zone} is where you are now.</p>
        </section>
      )}

      {step === 'photo' && (
        <section>
          <p className="text-label uppercase tracking-wide text-concrete-400">Photo (optional)</p>
          <PhotoCapture photos={photos} onChange={setPhotos} />
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => submit([])}
              className="min-h-tap flex-1 rounded-lg border border-steel-600 text-body text-concrete-400"
            >
              Skip
            </button>
            {photos.length > 0 && (
              <button
                type="button"
                onClick={() => submit(photos)}
                className="min-h-tap flex-1 rounded-lg border border-concrete-100 text-body text-concrete-100"
              >
                Submit
              </button>
            )}
          </div>
        </section>
      )}
    </div>
  )
}
