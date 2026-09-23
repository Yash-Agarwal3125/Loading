import { useRef, useState } from 'react'
import { downscale } from '../utils/image.js'

/**
 * PhotoCapture
 * Shared camera input. Wraps <input capture='environment'>, downscales via utils/image.js, returns dataUrls. Used by report flow and fault lookup.
 *
 * Controlled: `photos` (array of data URLs) and `onChange` live in the
 * caller, same pattern as every other input in this app. No state colour —
 * an error here is a capture failure, not a safety verdict.
 *
 * Also mirrors the in-progress photo set to a scoped localStorage draft key
 * on every add, wrapped in try/catch — localStorage is ~5MB and one
 * full-resolution phone photo, even downscaled, can push a set of three
 * over that. This is a best-effort local cache, not the report itself: the
 * in-memory `photos` array (via onChange) is what actually gets submitted,
 * so a quota failure here degrades the cache, not the capture. services/
 * persistence.js (Block 13) owns mirroring full app state; this is just
 * the one write this block needs to demonstrate the failure mode on.
 */
const DRAFT_KEY = 'hazardPhotoDraft'

export default function PhotoCapture({ photos, onChange, max = 3 }) {
  const inputRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [cacheFull, setCacheFull] = useState(false)

  async function handleFile(e) {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-selecting the same file later
    if (!file) return

    setBusy(true)
    setError(null)
    try {
      const dataUrl = await downscale(file)
      const next = [...photos, dataUrl].slice(0, max)
      onChange(next)

      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(next))
        setCacheFull(false)
      } catch {
        // Quota exceeded on the local cache mirror. The photo is already
        // in `next` / onChange above — the capture succeeded regardless.
        setCacheFull(true)
      }
    } catch {
      setError('Could not use that photo. Try again.')
    } finally {
      setBusy(false)
    }
  }

  function removePhoto(index) {
    const next = photos.filter((_, i) => i !== index)
    onChange(next)
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(next))
    } catch {
      // Same best-effort cache as above; removal always succeeds in memory
      // regardless of whether the mirror does.
    }
  }

  return (
    <div>
      {photos.length > 0 && (
        <div className="flex gap-2">
          {photos.map((src, i) => (
            <div key={i} className="relative h-20 w-20 overflow-hidden rounded-lg border border-steel-600">
              <img src={src} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removePhoto(i)}
                aria-label={`Remove photo ${i + 1}`}
                className="absolute right-0 top-0 flex min-h-tap min-w-tap items-center justify-center bg-steel-900/80 text-concrete-100"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {photos.length < max && (
        <>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="mt-3 min-h-tap w-full rounded-lg border border-steel-600 text-body text-concrete-100"
          >
            {busy ? 'Processing…' : `Add photo (${photos.length}/${max})`}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFile}
            className="hidden"
          />
        </>
      )}

      {error && <p className="mt-2 text-label text-concrete-100">{error}</p>}
      {cacheFull && !error && (
        <p className="mt-2 text-label text-concrete-400">
          Photo added. Local storage is full, so it won't be cached for offline recovery, but it will still submit
          with this report.
        </p>
      )}
    </div>
  )
}
