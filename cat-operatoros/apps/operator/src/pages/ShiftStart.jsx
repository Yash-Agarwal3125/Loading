import { useEffect, useState } from 'react'
import { useStore } from '../state/store.jsx'
import PhotoCapture from '../components/PhotoCapture.jsx'
import { check } from '../services/ppeCheck.js'
import { localTimestamp } from '../utils/format.js'

/**
 * SHIFT START — the PPE check.
 *
 * Read docs/DATA_GOVERNANCE.md before touching this file. The rules below are
 * product requirements, not preferences.
 *
 * FLOW
 *   1. Notice screen, shown before the first photo of each shift:
 *        "This checks for a helmet, vest and eye protection. The photo stays
 *         on this tablet and is not uploaded. Your supervisor sees whether the
 *         check passed, not the picture. You can skip it."
 *      That last sentence is what gets the product adopted. Do not cut it.
 *   2. Capture -> on-device inference (services/ppeCheck.js)
 *   3. Result: per-item pass/fail, plain language
 *   4. Missing item -> prompt + retake
 *   5. Retake fails -> OVERRIDE, two taps, reason picker, proceed
 *   6. Camera or model unavailable -> skip with reason, logged as unchecked
 *
 * FAIL OPEN. This screen NEVER blocks an operator from starting work. A model
 * that misreads a vest in low light must not be why someone cannot move a
 * machine. That is a new hazard invented by a safety tool.
 *
 * NEVER: upload the full image, run face detection, show another operator's
 * result, or surface this in anything that looks like a score.
 *
 * The photo is discarded from memory after inference. Only a 256px thumbnail
 * is retained, 7 days. Phase 0 has no backend to send a thumbnail to and no
 * "supervisor" surface but the handover, so no thumbnail is generated or
 * stored at all here — the photo lives in local component state only and is
 * garbage-collected the moment this component unmounts (navigating to Home).
 * utils/image.js's thumbnail() exists for when there is somewhere to send it.
 *
 * check() always runs with the default 'pass' scenario here — this is the
 * happy path a real photo would produce most of the time. Forcing a 'fail'
 * scenario for a demo is Block 13's job (demo controls); this file doesn't
 * expose a toggle for it, on purpose, so nothing here can be mistaken for
 * the model actually reading the photo.
 */
const ITEM_LABELS = {
  helmet: 'Helmet',
  hi_vis_vest: 'Hi-vis vest',
  eye_protection: 'Eye protection',
  gloves: 'Gloves',
  hearing_protection: 'Hearing protection',
}
const GATING_CLASSES = ['helmet', 'hi_vis_vest', 'eye_protection']
const ADVISORY_CLASSES = ['gloves', 'hearing_protection']

// Same fixed list DATA_GOVERNANCE.md rule 3 specifies for override, reused
// for skip too — both are "why didn't a normal pass happen", and inventing
// a second list would just be two things to keep in sync.
const REASONS = [
  { id: 'not-required', label: 'Equipment not required for this task' },
  { id: 'check-not-working', label: 'Check not working' },
  { id: 'verified-by-supervisor', label: 'Already verified by supervisor' },
  { id: 'other', label: 'Other' },
]

function StubLabel() {
  return (
    <p className="rounded border border-steel-600 bg-steel-800 p-2 text-label text-concrete-400">
      Detection is stubbed in this build. The photo isn't analysed — this result is scripted so the
      interaction (retake, override, skip) can be tested honestly.
    </p>
  )
}

export default function ShiftStart() {
  const { recordPpeCheck, setScreen } = useStore()
  const [step, setStep] = useState('notice')
  const [photos, setPhotos] = useState([])
  const [checkResult, setCheckResult] = useState(null)
  const [attempts, setAttempts] = useState(0)
  const [reasonContext, setReasonContext] = useState(null) // 'override' | 'skip'

  useEffect(() => {
    if (step === 'capture' && photos.length === 1) {
      runCheck()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photos, step])

  async function runCheck() {
    setStep('checking')
    const result = await check(photos[0])
    setCheckResult(result)
    setAttempts((n) => n + 1)
    setStep('result')
  }

  function finish(record) {
    recordPpeCheck(record)
    setScreen('home')
  }

  function completeFromResult() {
    finish({
      checkId: `ppe-${Date.now()}`,
      timestamp: localTimestamp(),
      status: 'pass',
      items: checkResult.items,
      modelVersion: checkResult.modelVersion,
      overridden: false,
      overrideReason: null,
      supervisorNotified: false,
    })
  }

  function retake() {
    setPhotos([])
    setCheckResult(null)
    setStep('capture')
  }

  function goToReason(context) {
    setReasonContext(context)
    setStep('reason')
  }

  function pickReason(reasonId) {
    const reasonLabel = REASONS.find((r) => r.id === reasonId)?.label ?? reasonId
    if (reasonContext === 'override') {
      finish({
        checkId: `ppe-${Date.now()}`,
        timestamp: localTimestamp(),
        status: 'override',
        items: checkResult?.items ?? null,
        modelVersion: checkResult?.modelVersion ?? null,
        overridden: true,
        overrideReason: reasonLabel,
        // "Supervisor notified" has no real target in Phase 0 — no backend,
        // no supervisor session. This flag is what the handover reads to
        // show it as text. Not a toast: there's nothing on the other end
        // for a toast to honestly represent.
        supervisorNotified: true,
      })
    } else {
      finish({
        checkId: `ppe-${Date.now()}`,
        timestamp: localTimestamp(),
        status: 'skipped',
        // null when skipped straight from the notice (no check ever ran);
        // preserved when skipped from a failed result instead of retaking
        // or overriding — a check did run in that case, no reason to throw
        // away what it showed.
        items: checkResult?.items ?? null,
        modelVersion: checkResult?.modelVersion ?? null,
        overridden: false,
        overrideReason: reasonLabel,
        supervisorNotified: false,
      })
    }
  }

  if (step === 'notice') {
    return (
      <div className="space-y-4 p-4">
        <h1 className="text-2xl text-concrete-100">Shift start</h1>
        <p className="text-lg text-concrete-100">
          This checks for a helmet, vest and eye protection. The photo stays on this tablet and is not
          uploaded. Your supervisor sees whether the check passed, not the picture. You can skip it.
        </p>
        <button
          type="button"
          onClick={() => setStep('capture')}
          className="min-h-tap w-full rounded-lg border border-concrete-100 text-lg text-concrete-100"
        >
          Continue
        </button>
        <button
          type="button"
          onClick={() => goToReason('skip')}
          className="min-h-tap w-full rounded-lg border border-steel-600 text-body text-concrete-400"
        >
          Skip
        </button>
      </div>
    )
  }

  if (step === 'capture') {
    return (
      <div className="space-y-4 p-4">
        <h1 className="text-2xl text-concrete-100">Photograph yourself in your PPE</h1>
        <StubLabel />
        <PhotoCapture photos={photos} onChange={setPhotos} max={1} />
        <button
          type="button"
          onClick={() => goToReason('skip')}
          className="min-h-tap w-full rounded-lg border border-steel-600 text-body text-concrete-400"
        >
          Camera not working — skip instead
        </button>
      </div>
    )
  }

  if (step === 'checking') {
    return (
      <div className="space-y-4 p-4">
        <h1 className="text-2xl text-concrete-100">Checking…</h1>
        <StubLabel />
      </div>
    )
  }

  if (step === 'result' && checkResult) {
    const passed = checkResult.result === 'pass'
    return (
      <div className="space-y-4 p-4">
        <h1 className="text-2xl text-concrete-100">{passed ? "You're clear to start" : 'Missing equipment'}</h1>
        <StubLabel />

        <ul className="space-y-1">
          {GATING_CLASSES.map((cls) => (
            <li key={cls} className="text-body text-concrete-100">
              {checkResult.items[cls].present ? '✓' : '✗'} {ITEM_LABELS[cls]}
            </li>
          ))}
        </ul>
        <p className="text-label text-concrete-400">
          {ADVISORY_CLASSES.map((cls) => ITEM_LABELS[cls]).join(' and ')} are advisory only — often hidden by
          pose, not checked here.
        </p>

        {passed ? (
          <button
            type="button"
            onClick={completeFromResult}
            className="min-h-tap w-full rounded-lg border border-concrete-100 text-lg text-concrete-100"
          >
            Continue to Home
          </button>
        ) : (
          <div className="space-y-2">
            <button
              type="button"
              onClick={retake}
              className="min-h-tap w-full rounded-lg border border-steel-600 text-lg text-concrete-100"
            >
              Retake
            </button>
            {attempts >= 2 && (
              <button
                type="button"
                onClick={() => goToReason('override')}
                className="min-h-tap w-full rounded-lg border border-concrete-100 text-lg text-concrete-100"
              >
                Override
              </button>
            )}
            <button
              type="button"
              onClick={() => goToReason('skip')}
              className="min-h-tap w-full rounded-lg border border-steel-600 text-body text-concrete-400"
            >
              Skip instead
            </button>
          </div>
        )}
      </div>
    )
  }

  if (step === 'reason') {
    return (
      <div className="space-y-4 p-4">
        <h1 className="text-2xl text-concrete-100">
          {reasonContext === 'override' ? 'Why are you overriding?' : 'Why are you skipping?'}
        </h1>
        <div className="space-y-2">
          {REASONS.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => pickReason(r.id)}
              className="min-h-tap w-full rounded-lg border border-steel-600 bg-steel-800 text-lg text-concrete-100"
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return null
}
