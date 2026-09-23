/**
 * StatusBadge
 * Safety state pill. The only component allowed to emit state colour directly. Props: state, size, label.
 *
 * STATE_CLASSES is exported so SafetyAlert.jsx — the one surface the
 * design system explicitly asks to "spend the boldness" on — reuses this
 * exact mapping for its own card chrome instead of maintaining a second,
 * driftable copy. "Only StatusBadge emits state colour" means one source
 * of truth for the mapping, not that nothing else may ever render it.
 */
export const STATE_LABEL = {
  safe: 'Safe',
  attention: 'Attention',
  high: 'High attention',
  critical: 'Critical',
}

// Each class string needs to appear literally for Tailwind to generate it —
// no dynamic `bg-state-${state}` interpolation.
export const STATE_CLASSES = {
  safe: 'border-state-safe bg-state-safe/15 text-state-safe',
  attention: 'border-state-attention bg-state-attention/15 text-state-attention',
  high: 'border-state-high bg-state-high/15 text-state-high',
  critical: 'border-state-critical bg-state-critical/15 text-state-critical',
}

const SIZE_CLASSES = {
  sm: 'gap-1.5 px-2.5 py-1 text-label',
  lg: 'gap-2 px-4 py-2 text-lg',
}

export default function StatusBadge({ state = 'safe', size = 'lg', label }) {
  const stateClass = STATE_CLASSES[state] ?? STATE_CLASSES.safe
  const sizeClass = SIZE_CLASSES[size] ?? SIZE_CLASSES.lg

  return (
    <span className={`inline-flex items-center rounded-full border font-medium ${stateClass} ${sizeClass}`}>
      <span className="h-2 w-2 rounded-full bg-current" aria-hidden="true" />
      {label ?? STATE_LABEL[state] ?? STATE_LABEL.safe}
    </span>
  )
}
