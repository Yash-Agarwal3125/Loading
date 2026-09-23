import { useEffect, useRef } from 'react'

/**
 * Drives the simulated telemetry tick (2s interval feels alive without
 * being distracting). Pauses when a demo scenario is running so scripted
 * values are not overwritten by the random walk — this bug will bite you
 * during rehearsal if you skip it.
 *
 * Does not own state — state/store.jsx is the single source of truth. This
 * hook just calls `onTick()` on an interval; the reducer decides what a
 * tick means and where the result goes.
 */
const INTERVAL_MS = 2000

export function useTelemetryClock(onTick, { paused = false } = {}) {
  const savedCallback = useRef(onTick)
  savedCallback.current = onTick

  useEffect(() => {
    if (paused) return undefined
    const id = setInterval(() => savedCallback.current(), INTERVAL_MS)
    return () => clearInterval(id)
  }, [paused])
}

/**
 * Bounded random walk from the current live telemetry snapshot. Exported
 * separately from the hook so the reducer can call it directly on `tick`
 * and so it is testable without mounting a component.
 */
export function walkTelemetry(current, rng = Math.random) {
  const step = (value, spread, lo, hi) => Math.max(lo, Math.min(hi, value + (rng() * 2 - 1) * spread))

  return {
    ...current,
    proximityM: current.proximityM == null ? null : Math.round(step(current.proximityM, 3, 3, 100)),
    machineSpeed: Math.round(step(current.machineSpeed ?? 1, 0.3, 0, 3) * 100) / 100,
    slopeDeg: Math.round(step(current.slopeDeg ?? 0, 0.4, 0, 15) * 10) / 10,
    engineRpm: Math.round(step(current.engineRpm ?? 1200, 60, 750, 2050)),
    hydraulicPressureBar: Math.round(step(current.hydraulicPressureBar ?? 140, 8, 60, 280)),
  }
}
