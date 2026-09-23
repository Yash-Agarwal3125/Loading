/**
 * localStorage mirror. Powers the "Offline ready" badge honestly.
 *
 * QUOTA WARNING — this has killed demos. localStorage is ~5 MB. Hazard
 * photos are base64 and a full-resolution phone photo is 3-8 MB on its own.
 * Downscale to 800 px via utils/image.js BEFORE storing, cap at 3 photos per
 * report, and wrap every write in try/catch. A QuotaExceededError thrown
 * mid-demo wipes the state you are presenting.
 *
 *   save(state), load(), clear()
 *   queueForSync(item) / getQueue()  -> drives "1 report queued"
 */
export function save(state) {
  // TODO(Block 12)
}

export function load() {
  // TODO(Block 12)
}
