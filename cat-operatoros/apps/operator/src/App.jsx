import { useEffect } from 'react'
import { useStore } from './state/store.jsx'
import OperatorHeader from './components/OperatorHeader.jsx'
import BottomNavigation from './components/BottomNavigation.jsx'
import SafetyAlert from './components/SafetyAlert.jsx'
import Home from './pages/Home.jsx'
import Safety from './pages/Safety.jsx'
import Tasks from './pages/Tasks.jsx'
import Coach from './pages/Coach.jsx'
import Training from './pages/Training.jsx'
import Machine from './pages/Machine.jsx'
import ReportHazard from './pages/ReportHazard.jsx'
import ShiftStart from './pages/ShiftStart.jsx'

/**
 * App shell. Holds the screen switcher, the persistent Ask button, the
 * global safety alert overlay and the demo drawer.
 *
 * CONTRACT
 * - No routing library. `screen` lives in the store; nav is a plain switch.
 * - SafetyAlert renders ABOVE everything and is driven purely by
 *   riskEngine output in the store. It is never triggered by a page.
 * - Ask button is present on every screen. It is not a nav tab.
 *
 * BUILD ORDER: this is Block 1. Stub every page, then fill them in order.
 *
 * `screen` and `contrast` come from useStore() (Block 2), not local state —
 * a page needs to be able to change screen too (Home's coaching nudge
 * routes into Training), and the store's own docblock is explicit about
 * why: local component state duplicating what the store already owns is
 * the thing that makes cross-screen effects stop working.
 */
const PAGES = {
  shiftStart: ShiftStart,
  home: Home,
  safety: Safety,
  tasks: Tasks,
  coach: Coach,
  training: Training,
  machine: Machine,
  // 'report' and 'handover' are in store.jsx's own screen union (Block 2)
  // but had no entry-point until Safety's "Report hazard" button needed
  // one. Wiring 'report' now, matching Block 1's precedent for a nav
  // target whose page is still a TODO stub (Coach, Training, Machine
  // all shipped exactly this way): a real screen switch to a blank page
  // is honest about what's built; a button that goes nowhere is not.
  report: ReportHazard,
}

export default function App() {
  const { state, setScreen, toggleContrast, acknowledgeRisk } = useStore()
  const { screen, mode, risk } = state

  useEffect(() => {
    if (mode.contrast === 'high') {
      document.documentElement.setAttribute('data-contrast', 'high')
    } else {
      document.documentElement.removeAttribute('data-contrast')
    }
  }, [mode.contrast])

  const Page = PAGES[screen]

  return (
    <div className="flex h-full flex-col bg-steel-900">
      <OperatorHeader contrast={mode.contrast} onToggleContrast={toggleContrast} />
      <main className="flex-1 overflow-y-auto">
        <Page />
      </main>
      {/* No nav during Shift Start — it's a flow the operator completes or
          skips, not a screen reachable by tapping away from. */}
      {screen !== 'shiftStart' && <BottomNavigation screen={screen} onNavigate={setScreen} />}
      <SafetyAlert risk={risk} onAcknowledge={acknowledgeRisk} />
      {/* TODO(Block 13): mount <DemoControls /> behind a long-press on the header */}
    </div>
  )
}
