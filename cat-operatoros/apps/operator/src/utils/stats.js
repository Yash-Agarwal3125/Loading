/**
 * Pure maths for the engines. mean, stdev, zScore, quartiles, correlation,
 * ridgeSolve. No side effects, no imports — every engine in services/
 * depends on this file being trustworthy in isolation.
 */

export function mean(xs) {
  if (!xs.length) return 0
  return xs.reduce((a, b) => a + b, 0) / xs.length
}

/** Sample standard deviation (n - 1). Returns 0 for fewer than 2 points. */
export function stdev(xs) {
  if (xs.length < 2) return 0
  const m = mean(xs)
  const variance = xs.reduce((a, b) => a + (b - m) ** 2, 0) / (xs.length - 1)
  return Math.sqrt(variance)
}

/** z-score of `value` against the distribution of `xs`. 0 if xs has no spread. */
export function zScore(value, xs) {
  const sd = stdev(xs)
  if (sd === 0) return 0
  return (value - mean(xs)) / sd
}

export function quartiles(xs) {
  const sorted = [...xs].sort((a, b) => a - b)
  const at = (p) => {
    const idx = (sorted.length - 1) * p
    const lo = Math.floor(idx)
    const hi = Math.ceil(idx)
    if (lo === hi) return sorted[lo]
    return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo)
  }
  const q1 = at(0.25)
  const q3 = at(0.75)
  return { q1, median: at(0.5), q3, iqr: q3 - q1 }
}

/** Pearson correlation coefficient. 0 if either series has no spread. */
export function correlation(xs, ys) {
  const n = Math.min(xs.length, ys.length)
  if (n < 2) return 0
  const mx = mean(xs)
  const my = mean(ys)
  let num = 0
  let dx2 = 0
  let dy2 = 0
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - mx
    const dy = ys[i] - my
    num += dx * dy
    dx2 += dx * dx
    dy2 += dy * dy
  }
  const denom = Math.sqrt(dx2 * dy2)
  return denom === 0 ? 0 : num / denom
}

/** Coefficient of determination for predictions against actuals. */
export function rSquared(actual, predicted) {
  const n = Math.min(actual.length, predicted.length)
  if (n < 2) return 0
  const m = mean(actual)
  let ssRes = 0
  let ssTot = 0
  for (let i = 0; i < n; i++) {
    ssRes += (actual[i] - predicted[i]) ** 2
    ssTot += (actual[i] - m) ** 2
  }
  return ssTot === 0 ? 0 : 1 - ssRes / ssTot
}

/**
 * Ridge regression via the normal equations: w = (XtX + λI)^-1 Xt y.
 * X is an array of feature rows (no intercept column — one is added here,
 * and it is never penalised). Small, dense matrices only — a closed-form
 * fit for a handful of columns, not a general linear-algebra library.
 *
 * Returns { intercept, weights } where `weights` aligns 1:1 with X's columns.
 */
export function ridgeSolve(X, y, lambda = 1) {
  const n = X.length
  const p = X[0].length + 1 // + intercept
  const Xb = X.map((row) => [1, ...row])

  const XtX = Array.from({ length: p }, () => new Array(p).fill(0))
  for (let i = 0; i < p; i++) {
    for (let j = 0; j < p; j++) {
      let s = 0
      for (let k = 0; k < n; k++) s += Xb[k][i] * Xb[k][j]
      XtX[i][j] = s + (i === j && i !== 0 ? lambda : 0) // never penalise the intercept
    }
  }

  const Xty = new Array(p).fill(0)
  for (let i = 0; i < p; i++) {
    let s = 0
    for (let k = 0; k < n; k++) s += Xb[k][i] * y[k]
    Xty[i] = s
  }

  const solved = solveLinearSystem(XtX, Xty)
  return { intercept: solved[0], weights: solved.slice(1) }
}

/** Gaussian elimination with partial pivoting. A is p x p, b is length p. */
function solveLinearSystem(A, b) {
  const n = A.length
  const M = A.map((row, i) => [...row, b[i]])

  for (let col = 0; col < n; col++) {
    let pivot = col
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(M[row][col]) > Math.abs(M[pivot][col])) pivot = row
    }
    ;[M[col], M[pivot]] = [M[pivot], M[col]]

    const pv = M[col][col]
    if (Math.abs(pv) < 1e-9) continue // singular-ish column; leave the row alone
    for (let row = 0; row < n; row++) {
      if (row === col) continue
      const factor = M[row][col] / pv
      for (let c = col; c <= n; c++) M[row][c] -= factor * M[col][c]
    }
  }

  return M.map((row, i) => (Math.abs(row[i]) < 1e-9 ? 0 : row[row.length - 1] / row[i]))
}

/**
 * Deterministic PRNG (mulberry32). Same seed -> same sequence, forever,
 * on every machine — this is what makes the seed dataset reproducible.
 */
export function createRng(seed) {
  let a = seed >>> 0
  return function rng() {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
