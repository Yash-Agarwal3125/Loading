import { localTimestamp } from '../utils/format.js'

/**
 * Historical incidents. This is what makes Hazard Memory work — the site
 * knows things before the operator arrives.
 *
 * Cluster at least 3 vehicle-proximity events in Zone C dated this week.
 * That cluster is the moment the differentiator lands in the demo.
 *
 * Zones: A (clear), B (active work), C (repeat hazard).
 *
 * Dates are computed relative to `new Date()` at load time, not hardcoded
 * calendar dates — "this week" needs to mean this week whenever the demo
 * actually runs, not the week this file happened to be written.
 */
export const ZONES = [
  { id: 'A', label: 'Zone A', risk: 'low', polygon: [] },
  { id: 'B', label: 'Zone B', risk: 'medium', polygon: [] },
  { id: 'C', label: 'Zone C', risk: 'high', polygon: [] },
]

function daysAgo(n, hour = 10, minute = 0) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(hour, minute, 0, 0)
  return localTimestamp(d)
}

export const INCIDENTS = [
  {
    id: 'inc-c1',
    zone: 'C',
    type: 'proximity',
    severity: 'medium',
    timestamp: daysAgo(1, 9, 40),
    machineId: 'EXC001',
    operatorId: 'OP1001',
    task: 'trench',
    telemetrySnapshot: { zone: 'C', proximityM: 11, vehicleCount: 1, pedestrianNear: false, seatbelt: 'Fastened', safetyAlert: true },
    photos: [],
  },
  {
    id: 'inc-c2',
    zone: 'C',
    type: 'proximity',
    severity: 'high',
    timestamp: daysAgo(2, 14, 15),
    machineId: 'EXC001',
    operatorId: 'OP1001',
    task: 'trench',
    telemetrySnapshot: { zone: 'C', proximityM: 7, vehicleCount: 2, pedestrianNear: false, seatbelt: 'Fastened', safetyAlert: true },
    photos: [],
  },
  {
    id: 'inc-c3',
    zone: 'C',
    type: 'proximity',
    severity: 'medium',
    timestamp: daysAgo(3, 11, 5),
    machineId: 'EXC001',
    operatorId: 'OP1001',
    task: 'trench',
    telemetrySnapshot: { zone: 'C', proximityM: 13, vehicleCount: 1, pedestrianNear: true, seatbelt: 'Fastened', safetyAlert: true },
    photos: [],
  },
  {
    id: 'inc-b1',
    zone: 'B',
    type: 'near-miss',
    severity: 'low',
    timestamp: daysAgo(5, 8, 30),
    machineId: 'EXC001',
    operatorId: 'OP1001',
    task: 'load',
    telemetrySnapshot: { zone: 'B', proximityM: 22, vehicleCount: 1, pedestrianNear: false, seatbelt: 'Fastened', safetyAlert: false },
    photos: [],
  },
  {
    id: 'inc-a1',
    zone: 'A',
    type: 'equipment',
    severity: 'low',
    timestamp: daysAgo(6, 16, 0),
    machineId: 'EXC001',
    operatorId: 'OP1001',
    task: 'grade',
    telemetrySnapshot: { zone: 'A', proximityM: null, vehicleCount: 0, pedestrianNear: false, seatbelt: 'Fastened', safetyAlert: false },
    photos: [],
  },
]
