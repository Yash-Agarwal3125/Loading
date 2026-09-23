/**
 * CoachCard
 * The one thing to improve, its estimated impact, and the button into the linked training module. The link is what closes the loop.
 *
 * `oneThing` is coachEngine.js's real output — text, estimatedImpact and
 * whether this is the empty-state invitation are all computed from the
 * window it was given, never hardcoded here. onNavigate must actually
 * change screen (useStore().setScreen), not just render — Home's identical
 * button was a dead click until Block 3 fixed App.jsx reading screen from
 * the store.
 */
export default function CoachCard({ oneThing, onNavigate }) {
  if (!oneThing) return null

  return (
    <section className="rounded-lg border border-steel-600 bg-steel-800 p-4">
      <p className="text-label uppercase tracking-wide text-concrete-400">
        {oneThing.isInvitation ? 'Today' : 'One thing to improve'}
      </p>
      <p className="mt-1 text-lg text-concrete-100">{oneThing.text}</p>
      {oneThing.estimatedImpact && <p className="mt-1 text-body text-concrete-400">{oneThing.estimatedImpact}</p>}

      <button
        type="button"
        onClick={onNavigate}
        className={`mt-3 min-h-tap w-full rounded-lg border text-lg text-concrete-100 ${
          oneThing.isInvitation ? 'border-steel-600' : 'border-concrete-100'
        }`}
      >
        {oneThing.isInvitation ? oneThing.invitation : 'Improve this'}
      </button>
    </section>
  )
}
