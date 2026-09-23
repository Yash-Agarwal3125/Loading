/** Display formatters. Keep every number formatted in exactly one place. */

/**
 * "YYYY-MM-DDTHH:mm:ss" from LOCAL date components — not
 * `date.toISOString().slice(0, 19)`, which converts to UTC first and then
 * strips the 'Z' that would have told a re-parser that. The result looks
 * like a local-time ISO string but holds UTC values; `new Date(thatString)`
 * has no offset to go on, so it reinterprets the UTC values as local time
 * and silently shifts by the zone offset (5.5h in IST — a 16:00 incident
 * would come back as 10:30). This is the one place in the codebase that
 * generates a timestamp string; every other file should call this rather
 * than reintroduce the same bug.
 */
export function localTimestamp(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

/** Seconds or minutes-as-float -> "2:51". Treats input under 20 as minutes. */
export function duration(value, { unit = 'sec' } = {}) {
  const totalSec = Math.max(0, Math.round(unit === 'min' ? value * 60 : value))
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export function clock(date) {
  const d = date instanceof Date ? date : new Date(date)
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

export function percent(n, { decimals = 0 } = {}) {
  return `${n.toFixed(decimals)}%`
}

export function meters(n) {
  return `${Math.round(n)} m`
}

// Time-aware greeting: judging usually happens in the afternoon, so
// "Good morning" hardcoded is an easy own goal.
export function greeting(date = new Date()) {
  const h = date.getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}
