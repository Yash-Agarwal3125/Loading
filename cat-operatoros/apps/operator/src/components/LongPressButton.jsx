import { useCallback, useRef, useState } from 'react'

/**
 * LongPressButton
 * Confirm-by-hold control for destructive or safety-critical actions. Gloved hands mis-tap; holds do not.
 *
 * The fill is interactive feedback proportional to the operator's own
 * held-down input, not an ambient animation — it does not run on its own,
 * so it isn't part of "nothing else animates" in docs/DESIGN_SYSTEM.md.
 * Releasing early cancels; it does not partially confirm.
 */
const HOLD_MS = 1400

export default function LongPressButton({ onConfirm, children = 'Hold to confirm', className = '' }) {
  const [progress, setProgress] = useState(0)
  const [holding, setHolding] = useState(false)
  const rafRef = useRef(null)
  const startRef = useRef(0)

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    setHolding(false)
    setProgress(0)
  }, [])

  const tick = useCallback(() => {
    const elapsed = performance.now() - startRef.current
    const p = Math.min(1, elapsed / HOLD_MS)
    setProgress(p)
    if (p >= 1) {
      rafRef.current = null
      setHolding(false)
      onConfirm?.()
      return
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [onConfirm])

  const start = useCallback(() => {
    startRef.current = performance.now()
    setHolding(true)
    rafRef.current = requestAnimationFrame(tick)
  }, [tick])

  return (
    <button
      type="button"
      onPointerDown={start}
      onPointerUp={stop}
      onPointerLeave={stop}
      onPointerCancel={stop}
      className={`relative min-h-tap w-full overflow-hidden rounded-lg border border-concrete-100 text-lg font-medium text-concrete-100 ${className}`}
    >
      <span className="pointer-events-none absolute inset-y-0 left-0 bg-concrete-100/25" style={{ width: `${progress * 100}%` }} aria-hidden="true" />
      <span className="relative">{holding ? 'Keep holding…' : children}</span>
    </button>
  )
}
