import { Home, ShieldAlert, ClipboardList, TrendingUp, GraduationCap, Truck } from 'lucide-react'

/**
 * BottomNavigation
 * Six tabs. 88px tall, 64px tap targets. Active tab uses machine-amber, never a state colour.
 */
const TABS = [
  { id: 'home', label: 'Home', Icon: Home },
  { id: 'safety', label: 'Safety', Icon: ShieldAlert },
  { id: 'tasks', label: 'Tasks', Icon: ClipboardList },
  { id: 'coach', label: 'Coach', Icon: TrendingUp },
  { id: 'training', label: 'Training', Icon: GraduationCap },
  { id: 'machine', label: 'Machine', Icon: Truck },
]

export default function BottomNavigation({ screen, onNavigate }) {
  return (
    <nav className="grid h-nav grid-cols-6 border-t border-steel-600 bg-steel-800" aria-label="Primary">
      {TABS.map(({ id, label, Icon }) => {
        const active = screen === id
        return (
          <button
            key={id}
            type="button"
            onClick={() => onNavigate(id)}
            aria-current={active ? 'page' : undefined}
            className={`flex h-full min-h-tap min-w-tap flex-col items-center justify-center gap-1 text-label ${
              active ? 'text-machine-amber' : 'text-concrete-400'
            }`}
          >
            <Icon size={22} strokeWidth={2} aria-hidden="true" />
            <span>{label}</span>
          </button>
        )
      })}
    </nav>
  )
}
