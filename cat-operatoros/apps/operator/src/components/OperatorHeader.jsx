/**
 * OperatorHeader
 * Greeting, machine ID plate, shift window, sync badge. Long-press opens demo controls.
 *
 * BLOCK 1: app-shell only — title plate and the contrast toggle. Greeting,
 * machine ID plate and shift window need data/operator.js and data/machine.js
 * (Block 2); the sync badge needs services/sync.js (Phase 1); the long-press
 * demo drawer is Block 13. Those land with the blocks that own them.
 */
export default function OperatorHeader({ contrast, onToggleContrast }) {
  // TODO(Block 3+): greeting, machine ID plate, shift window
  // TODO(Phase 1): sync badge, once services/sync.js exists
  // TODO(Block 13): long-press opens <DemoControls />
  const highContrast = contrast === 'high'

  return (
    <header className="flex items-center justify-between border-b border-steel-600 bg-steel-800 px-4 py-3">
      <span className="font-plate font-medium text-lg tracking-wide text-concrete-100">
        CAT OperatorOS
      </span>
      <button
        type="button"
        onClick={onToggleContrast}
        aria-pressed={highContrast}
        className={`min-h-tap min-w-tap rounded px-3 text-label ${
          highContrast ? 'text-machine-amber' : 'text-concrete-400'
        }`}
      >
        {highContrast ? 'Contrast: high' : 'Contrast: normal'}
      </button>
    </header>
  )
}
