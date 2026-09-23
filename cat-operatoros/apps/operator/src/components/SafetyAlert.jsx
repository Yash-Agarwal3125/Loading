import { useEffect, useRef, useState } from 'react'
import { STATE_CLASSES } from './StatusBadge.jsx'
import LongPressButton from './LongPressButton.jsx'

/**
 * SafetyAlert
 * Full-screen alert overlay. Renders headline, factor list behind 'Why am I seeing this', one action, [Acknowledge]. Long-press to acknowledge (gloves). Never dismissible by tapping outside.
 *
 * Mounted once in App.jsx, above every page, driven purely by
 * state.risk — never by a page. Renders nothing unless risk.requiresAck
 * (riskEngine sets this for 'high' and 'critical' only; seatbelt-
 * unfastened-while-moving is always 'critical').
 *
 * The only orchestrated motion in the product lives here: a state change
 * pulses once and settles, then it's static — see docs/DESIGN_SYSTEM.md's
 * motion section. Not a loop; state-pulse.
 */
const PULSE_MS = 1400

export default function SafetyAlert({ risk, onAcknowledge }) {
  const [pulsing, setPulsing] = useState(false)
  const changeKey = risk ? `${risk.state}|${risk.headline}` : ''
  const prevKeyRef = useRef(changeKey)

  useEffect(() => {
    if (prevKeyRef.current !== changeKey) {
      prevKeyRef.current = changeKey
      setPulsing(true)
      const id = setTimeout(() => setPulsing(false), PULSE_MS)
      return () => clearTimeout(id)
    }
    return undefined
  }, [changeKey])

  if (!risk || !risk.requiresAck) return null

  const stateClass = STATE_CLASSES[risk.state] ?? STATE_CLASSES.critical

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end bg-steel-900/90 p-4"
      role="alertdialog"
      aria-modal="true"
      aria-label="Safety alert"
    >
      <section className={`rounded-xl border-2 bg-steel-800 p-5 ${stateClass} ${pulsing ? 'state-pulse' : ''}`}>
        <p className="text-xl font-medium">{risk.headline}</p>

        {risk.factors?.length > 0 && (
          <details className="mt-3">
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

        <p className="mt-4 text-lg text-concrete-100">{risk.action}</p>

        <div className="mt-4">
          <LongPressButton onConfirm={onAcknowledge}>Hold to acknowledge</LongPressButton>
        </div>

        <p className="mt-4 text-label text-concrete-400">
          Decision support only. This does not control the machine and does not replace machine
          controls, service manuals or trained safety procedure.
        </p>
      </section>
    </div>
  )
}
