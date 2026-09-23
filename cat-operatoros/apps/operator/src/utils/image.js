/**
 * Camera capture helpers, shared by hazard photos and fault lookup.
 *
 * USE <input type="file" accept="image/*" capture="environment">, NOT
 * getUserMedia. It opens the native camera on mobile, falls back to a file
 * picker on a laptop, needs no permission prompt, and cannot fail on stage.
 *
 *   downscale(file, maxPx = 800) -> Promise<dataUrl>   // canvas, jpeg q0.7
 *   thumbnail(dataUrl) -> dataUrl
 *
 * Reused by Block 7 (PPE check) and Block 11 (fault symbol lookup) — this
 * is the one place the downscale path gets built; get it right here.
 */

const JPEG_QUALITY = 0.7

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Could not read image'))
    img.src = src
  })
}

function drawScaled(img, maxPx) {
  const scale = Math.min(1, maxPx / Math.max(img.width, img.height))
  const w = Math.max(1, Math.round(img.width * scale))
  const h = Math.max(1, Math.round(img.height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  canvas.getContext('2d').drawImage(img, 0, 0, w, h)
  return canvas.toDataURL('image/jpeg', JPEG_QUALITY)
}

/** File from <input type="file"> -> a JPEG data URL no larger than maxPx on its longest side. */
export async function downscale(file, maxPx = 800) {
  const objectUrl = URL.createObjectURL(file)
  try {
    const img = await loadImage(objectUrl)
    return drawScaled(img, maxPx)
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

/** An already-downscaled data URL -> a smaller one still (256px default). */
export async function thumbnail(dataUrl, maxPx = 256) {
  const img = await loadImage(dataUrl)
  return drawScaled(img, maxPx)
}
