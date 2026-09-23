import { createRng } from '../utils/stats.js'
import { localTimestamp } from '../utils/format.js'

/**
 * Seed telemetry.
 *
 * NON-NEGOTIABLE: the first four records are the judges' own sample rows,
 * verbatim. Everything after is synthetic. See docs/DATA_SCHEMA.md.
 *
 * GENERATION METHOD: rows are not randomised field-by-field. Each row is
 * derived from four latent variables — taskIntensity, fatigue,
 * groundDifficulty, proximityEvent — so the correlations between derived
 * fields are structural, not coincidental: payload tracks bucket fill,
 * RPM tracks throttle, hydraulic pressure tracks load, fuel tracks RPM and
 * duty cycle. See docs/DATA_SCHEMA.md's machine-derived tier for what each
 * field's plausible real source is.
 *
 * DETERMINISTIC: the RNG is seeded with a fixed constant (SEED). Every run
 * produces byte-identical rows — the demo must not vary between rehearsal
 * and judging.
 */
const SEED = 20250501

const TASK_TYPES = ['dig', 'load', 'grade', 'trench', 'haul']
const BASE_DURATION_MIN = { dig: 45, load: 30, grade: 60, trench: 75, haul: 40 }
const WEATHER = ['clear', 'clear', 'clear', 'overcast', 'overcast', 'dust', 'rain']
const ATTACHMENTS = ['bucket', 'bucket', 'bucket', 'bucket', 'breaker', 'grapple']
const MATERIALS = ['soil', 'soil', 'gravel', 'rock', 'sand']

export const JUDGE_SAMPLE_ROWS = [
  { timestamp: '2025-05-01T08:00:00', machineId: 'EXC001', operatorId: 'OP1001', engineHours: 1523.5, fuelUsedL: 5.2, loadCycles: 12, idlingTimeMin: 30, seatbelt: 'Fastened',   safetyAlert: false },
  { timestamp: '2025-05-01T10:00:00', machineId: 'EXC001', operatorId: 'OP1001', engineHours: 1524.8, fuelUsedL: 3.8, loadCycles: 2,  idlingTimeMin: 55, seatbelt: 'Unfastened', safetyAlert: true  },
  { timestamp: '2025-05-01T14:00:00', machineId: 'EXC001', operatorId: 'OP1001', engineHours: 1526.5, fuelUsedL: 6.1, loadCycles: 10, idlingTimeMin: 15, seatbelt: 'Fastened',   safetyAlert: false },
  { timestamp: '2025-05-02T09:00:00', machineId: 'EXC001', operatorId: 'OP1001', engineHours: 1530.2, fuelUsedL: 2.0, loadCycles: 1,  idlingTimeMin: 60, seatbelt: 'Unfastened', safetyAlert: true  },
]

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v))
}

function pick(rng, arr) {
  return arr[Math.floor(rng() * arr.length) % arr.length]
}

/** Symmetric noise in [-spread, +spread]. */
function jitter(rng, spread) {
  return (rng() * 2 - 1) * spread
}

function daylightLux(hour, weather) {
  const base = hour >= 6 && hour <= 18 ? clamp(1000 * Math.sin((Math.PI * (hour - 6)) / 12), 50, 1000) : 40
  const factor = { rain: 0.4, dust: 0.6, overcast: 0.7, clear: 1 }[weather] ?? 1
  return base * factor
}

function daylightTemp(hour, weather) {
  const base = 15 + 10 * Math.sin((Math.PI * (hour - 6)) / 12)
  const adj = { rain: -5, overcast: -2, dust: 0, clear: 0 }[weather] ?? 0
  return base + adj
}

function generateSyntheticRows() {
  const rng = createRng(SEED)
  const rows = []

  const startEngineHours = 1530.2
  const startDate = new Date('2025-05-02T13:00:00')
  const RECORDS_PER_DAY = 4
  const TOTAL_DAYS = 49 // ~196 records at 4/day
  const HOUR_OFFSETS = [7, 9.5, 12.5, 15]

  // Force five additional seatbelt violations in the synthetic portion
  // (the given rows already carry two, for seven total / 96.5% compliance
  // over 200 rows — see the evidence note in data/operator.js for why this
  // count, not the given sample's raw 50%, is what the baseline is built
  // from). Two of the five (121, 138) fall inside the inefficient stretch:
  // a tired operator is plausibly more likely to skip a safety step, not
  // just run slower. The rest are spread through normal operation, away
  // from the proximity cluster, so each requirement reads as its own thing
  // in the data.
  const FORCED_SEATBELT_VIOLATION_INDICES = new Set([35, 75, 121, 138, 168])

  // The last 7 days (28 records) are "this week" — the proximity cluster
  // lives here, in Zone C, satisfying the seed requirement.
  const PROXIMITY_EVENT_INDICES = new Set([176, 180, 184, 188, 191])

  // Inefficient stretch: idle climbing, cycle time drifting. A contiguous
  // block, days 30-37 (indices 120-151).
  const INEFFICIENT_START = 120
  const INEFFICIENT_END = 151

  let engineHours = startEngineHours
  let idx = 0

  for (let day = 0; day < TOTAL_DAYS; day++) {
    for (let r = 0; r < RECORDS_PER_DAY; r++) {
      const hour = HOUR_OFFSETS[r] + jitter(rng, 0.4)
      const timestamp = new Date(startDate)
      timestamp.setDate(timestamp.getDate() + day)
      timestamp.setHours(Math.floor(hour), Math.round((hour % 1) * 60), 0, 0)

      const inefficient = idx >= INEFFICIENT_START && idx <= INEFFICIENT_END
      const isProximityEvent = PROXIMITY_EVENT_INDICES.has(idx)
      const isForcedSeatbeltViolation = FORCED_SEATBELT_VIOLATION_INDICES.has(idx)

      // --- latent variables ---
      const taskIntensity = clamp(0.25 + rng() * 0.65, 0.15, 0.97)
      const groundDifficulty = clamp(rng() * (0.7 + (r === 1 ? 0.2 : 0)), 0, 1)
      let fatigue = clamp(r / RECORDS_PER_DAY + jitter(rng, 0.15), 0, 1)
      if (inefficient) fatigue = clamp(fatigue + 0.35, 0, 1)
      // Independent per-cycle "how full did the bucket end up" — a real
      // excavator holds engine RPM near a working setpoint for the task,
      // but what actually lands in the bucket varies cycle to cycle
      // regardless of that setpoint. Payload must NOT be mostly a function
      // of the same latent that drives RPM, or the two become a near-
      // duplicate pair that adds no information to a model.
      const payloadFactor = rng()
      // Independent driver for how many cycles a segment fits in, beyond
      // what idle time and task intensity already explain — cycle count
      // depends on things idle time doesn't capture (task size, operator
      // pacing), not idle time alone.
      const cycleIndependence = rng()

      // --- categoricals ---
      const taskType = pick(rng, TASK_TYPES)
      const weather = pick(rng, WEATHER)
      const groundCondition = groundDifficulty < 0.33 ? 'firm' : groundDifficulty < 0.66 ? 'loose' : 'wet'
      const materialType = pick(rng, MATERIALS)
      const attachmentType = pick(rng, ATTACHMENTS)

      const loadClassNum = taskIntensity < 0.4 ? 0 : taskIntensity < 0.75 ? 1 : 2
      const loadClass = ['light', 'medium', 'high'][loadClassNum]

      // --- engine / hydraulics: RPM drives throttle, pressure tracks load ---
      const engineRpm = clamp(900 + taskIntensity * 900 - fatigue * 60 + jitter(rng, 40), 750, 2050)
      const throttlePercent = clamp(((engineRpm - 800) / 1400) * 100 + jitter(rng, 4), 0, 100)
      const hydraulicPressureBar = clamp(80 + taskIntensity * 160 + groundDifficulty * 20 + jitter(rng, 10), 60, 280)
      const hydraulicTempC = clamp(45 + hydraulicPressureBar * 0.15 + fatigue * 5 + jitter(rng, 3), 35, 110)

      // --- payload tracks bucket fill, but only loosely tracks RPM ---
      const payloadKg = clamp(200 + (0.4 * taskIntensity + 0.6 * payloadFactor) * 2200 + jitter(rng, 150), 100, 2600)
      const bucketFillPercent = clamp(20 + (payloadKg / 2400) * 80 + jitter(rng, 6), 5, 100)

      const slopeDeg = clamp(groundDifficulty * 12 + jitter(rng, 1.5), 0, 15)
      const swingAngleDeg = clamp(60 + taskIntensity * 120 + jitter(rng, 15), 30, 220)
      const swingCount = Math.round(clamp(3 + taskIntensity * 9 + jitter(rng, 1), 1, 16))

      // --- idle / cycles: high idle, low cycle count, by construction ---
      let idlingTimeMin = clamp(12 + fatigue * 45 - taskIntensity * 15 + jitter(rng, 8), 2, 75)
      if (isForcedSeatbeltViolation) idlingTimeMin = clamp(idlingTimeMin + 10, 2, 75)
      const loadCycles = Math.round(
        clamp(11 - idlingTimeMin * 0.11 + taskIntensity * 5 + cycleIndependence * 5.5 + jitter(rng, 2), 1, 20),
      )
      // Centred so a typical (non-inefficient) row lands close to
      // baseline.cycleTimeSec (162s) — fatigue averages ~0.45 and
      // groundDifficulty ~0.4 outside the inefficient stretch, which is
      // what "normal" needs to mean for the anomaly detector's z-score
      // against that baseline to be honest. The +0.35 fatigue boost during
      // the inefficient stretch is what should actually stand out.
      const cycleTimeSec = clamp(130 + fatigue * 50 + groundDifficulty * 25 + jitter(rng, 12), 100, 280)

      // --- fuel tracks RPM and duty (non-idle fraction) ---
      // Base term set so normal-operation mean lands near
      // baseline.fuelPerCycleL (4.8 L/record) — see operator.js. The
      // fatigue term is real too: tired, sloppy throttle work burns more
      // fuel for the same duty cycle, which is what should make the
      // inefficient stretch stand out here, not just in idle and cycle time.
      const idleFraction = clamp(idlingTimeMin / 90, 0, 0.9)
      const duty = clamp(1 - idleFraction, 0.1, 0.95)
      const fuelUsedL = clamp(1.7 + (engineRpm / 1800) * 4 * duty + fatigue * 2.2 + jitter(rng, 0.4), 0.5, 11)

      const machineSpeed = clamp((1 - idleFraction) * (0.8 + taskIntensity * 1.8) + jitter(rng, 0.15), 0, 3)

      const travelMeters = clamp(20 + taskIntensity * 300 + jitter(rng, 30), 5, 380)
      // Irreducible noise: real task duration is not a deterministic
      // function of telemetry — crew coordination, ground surprises, minor
      // stoppages. Without this the ETA model explains the label almost
      // perfectly, which is not an honest claim to make about a real task.
      const taskDurationMin = clamp(
        BASE_DURATION_MIN[taskType] *
          (1 + slopeDeg * 0.02 + loadClassNum * 0.08 + travelMeters * 0.0006 + (weather === 'rain' ? 0.15 : weather === 'dust' ? 0.08 : 0)) +
          fatigue * 8 +
          jitter(rng, 4) +
          jitter(rng, 22), // irreducible noise
        8,
        160,
      )

      const ambientLux = Math.round(clamp(daylightLux(hour, weather) + jitter(rng, 30), 20, 1100))
      const temperatureC = Math.round((daylightTemp(hour, weather) + jitter(rng, 2)) * 10) / 10
      const headingDeg = Math.round(rng() * 360)
      const seatOccupied = rng() > 0.03

      // --- proximity / zone ---
      let zone = pick(rng, ['A', 'A', 'A', 'B', 'B', 'C'])
      let proximityM = null
      let vehicleCount = rng() < 0.1 ? 1 : 0
      let pedestrianNear = false
      let seatbelt = 'Fastened'
      let safetyAlert = false

      if (isProximityEvent) {
        zone = 'C'
        proximityM = Math.round(clamp(6 + rng() * 12, 5, 18))
        vehicleCount = 1 + (rng() < 0.3 ? 1 : 0)
        pedestrianNear = rng() < 0.25
        safetyAlert = true
      }

      if (isForcedSeatbeltViolation) {
        seatbelt = 'Unfastened'
        safetyAlert = true // both Unfastened rows in the sample carry safetyAlert = true
      }

      engineHours = Math.round((engineHours + 0.3 + taskIntensity * 1.3 + jitter(rng, 0.15)) * 10) / 10

      rows.push({
        timestamp: localTimestamp(timestamp),
        machineId: 'EXC001',
        operatorId: 'OP1001',
        engineHours,
        fuelUsedL: Math.round(fuelUsedL * 10) / 10,
        loadCycles,
        idlingTimeMin: Math.round(idlingTimeMin),
        seatbelt,
        safetyAlert,
        // machine-derived tier — docs/DATA_SCHEMA.md
        taskType,
        taskDurationMin: Math.round(taskDurationMin * 10) / 10,
        slopeDeg: Math.round(slopeDeg * 10) / 10,
        loadClass,
        proximityM,
        vehicleCount,
        pedestrianNear,
        machineSpeed: Math.round(machineSpeed * 100) / 100,
        cycleTimeSec: Math.round(cycleTimeSec),
        weather,
        temperatureC,
        travelMeters: Math.round(travelMeters),
        swingAngleDeg: Math.round(swingAngleDeg),
        swingCount,
        hydraulicPressureBar: Math.round(hydraulicPressureBar),
        hydraulicTempC: Math.round(hydraulicTempC * 10) / 10,
        attachmentType,
        materialType,
        groundCondition,
        ambientLux,
        engineRpm: Math.round(engineRpm),
        throttlePercent: Math.round(throttlePercent),
        payloadKg: Math.round(payloadKg),
        bucketFillPercent: Math.round(bucketFillPercent),
        headingDeg,
        seatOccupied,
        // app-generated tier
        zone,
      })

      idx++
    }
  }

  return rows
}

export const SEED_TELEMETRY = [...JUDGE_SAMPLE_ROWS, ...generateSyntheticRows()]
