/**
 * Fault / warning symbol reference for the camera lookup on the Machine
 * screen.
 *
 * HONESTY CONSTRAINT: the prototype does NOT classify the photo. The flow is
 * photo -> grid of candidate symbols -> operator taps the match -> plain
 * language meaning + urgency + action. Never claim recognition happened.
 * See docs/AI_GUIDELINES.md, "Do not fake a model".
 *
 * 12 entries. Generic ISO-style machine warnings, drawn as inline SVG using
 * plain geometric primitives. Do not copy Caterpillar artwork.
 */

const triangle = (inner) =>
  `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 3L22 20H2L12 3Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>${inner}</svg>`

export const FAULT_SYMBOLS = [
  {
    id: 'engine-temp-high',
    name: 'Engine temperature high',
    svg: triangle('<circle cx="12" cy="16.3" r="1.5" stroke="currentColor" stroke-width="1.3"/><line x1="12" y1="8.5" x2="12" y2="14.6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>'),
    urgency: 'stop-now',
    meaning: 'The engine is running hotter than its normal operating range.',
    action: 'Stop, idle to cool, and check the coolant level before continuing.',
    canEscalateToService: true,
  },
  {
    id: 'hydraulic-pressure-low',
    name: 'Hydraulic pressure low',
    svg: triangle('<path d="M12 8.5c-1.8 2.6-2.8 4.2-2.8 5.5a2.8 2.8 0 105.6 0c0-1.3-1-2.9-2.8-5.5Z" stroke="currentColor" stroke-width="1.3"/><line x1="9.5" y1="17.5" x2="14.5" y2="17.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>'),
    urgency: 'stop-now',
    meaning: 'Hydraulic system pressure has dropped below the safe operating threshold.',
    action: 'Stop the machine and do not operate attachments until checked.',
    canEscalateToService: true,
  },
  {
    id: 'engine-oil-pressure-low',
    name: 'Engine oil pressure low',
    svg: triangle('<path d="M8.5 12.5h7l-1 5h-5l-1-5Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><line x1="12" y1="8.5" x2="12" y2="12.5" stroke="currentColor" stroke-width="1.3"/>'),
    urgency: 'stop-now',
    meaning: 'Engine oil pressure is below the safe minimum.',
    action: 'Shut down the engine now and report before restarting.',
    canEscalateToService: true,
  },
  {
    id: 'battery-charge-fault',
    name: 'Battery / charging fault',
    svg: triangle('<rect x="8.5" y="12" width="7" height="5" rx="0.6" stroke="currentColor" stroke-width="1.3"/><line x1="10.5" y1="12" x2="10.5" y2="10.5" stroke="currentColor" stroke-width="1.3"/><line x1="13.5" y1="12" x2="13.5" y2="10.5" stroke="currentColor" stroke-width="1.3"/>'),
    urgency: 'soon',
    meaning: 'The charging system is not maintaining battery voltage.',
    action: 'Log it and have it checked before the next shift starts.',
    canEscalateToService: true,
  },
  {
    id: 'coolant-level-low',
    name: 'Coolant level low',
    svg: triangle('<path d="M12 9c-1.6 2.3-2.6 3.9-2.6 5.1a2.6 2.6 0 105.2 0c0-1.2-1-2.8-2.6-5.1Z" stroke="currentColor" stroke-width="1.3" stroke-dasharray="1.5 1.2"/>'),
    urgency: 'soon',
    meaning: 'Coolant is below the safe fill line.',
    action: 'Top up coolant at the next safe stop; avoid extended heavy load until then.',
    canEscalateToService: true,
  },
  {
    id: 'air-filter-restriction',
    name: 'Air filter restriction',
    svg: triangle('<circle cx="12" cy="15" r="3.2" stroke="currentColor" stroke-width="1.3"/><line x1="12" y1="15" x2="14" y2="13.3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>'),
    urgency: 'monitor',
    meaning: 'Airflow into the engine is more restricted than normal — usually a dirty filter.',
    action: 'No action needed mid-shift. Flag it for service at the next inspection.',
    canEscalateToService: false,
  },
  {
    id: 'fuel-level-low',
    name: 'Fuel level low',
    svg: triangle('<rect x="9" y="12" width="5.5" height="5.5" rx="0.5" stroke="currentColor" stroke-width="1.3"/><path d="M14.5 13.2h1a1 1 0 011 1v1.6a0.9 0.9 0 01-.9.9" stroke="currentColor" stroke-width="1.1"/>'),
    urgency: 'monitor',
    meaning: 'Fuel is running low.',
    action: 'Plan a refuel at the next natural break.',
    canEscalateToService: false,
  },
  {
    id: 'parking-brake-engaged',
    name: 'Parking brake engaged',
    svg: triangle('<circle cx="12" cy="15" r="3.2" stroke="currentColor" stroke-width="1.3"/><line x1="12" y1="12.4" x2="12" y2="15" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><line x1="12" y1="15" x2="13.8" y2="16.2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>'),
    urgency: 'soon',
    meaning: 'The parking brake is engaged while the machine is being asked to move.',
    action: 'Release the parking brake before continuing.',
    canEscalateToService: false,
  },
  {
    id: 'seatbelt-reminder',
    name: 'Seatbelt reminder',
    svg: triangle('<line x1="9" y1="10.5" x2="15" y2="17.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="9" cy="10.5" r="0.9" fill="currentColor"/><circle cx="15" cy="17.5" r="0.9" fill="currentColor"/>'),
    urgency: 'soon',
    meaning: 'The seatbelt is not fastened.',
    action: 'Fasten your seatbelt before operating.',
    canEscalateToService: false,
  },
  {
    id: 'check-engine',
    name: 'Check engine',
    svg: triangle('<line x1="12" y1="8.5" x2="12" y2="15" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><circle cx="12" cy="17.6" r="0.9" fill="currentColor"/>'),
    urgency: 'soon',
    meaning: 'The engine control module has logged a fault.',
    action: 'Continue with care and have it read out at the next service point.',
    canEscalateToService: true,
  },
  {
    id: 'transmission-fault',
    name: 'Transmission fault',
    svg: triangle('<circle cx="12" cy="15" r="3" stroke="currentColor" stroke-width="1.3"/><circle cx="12" cy="15" r="0.9" fill="currentColor"/><line x1="12" y1="11" x2="12" y2="12" stroke="currentColor" stroke-width="1.3"/><line x1="12" y1="18" x2="12" y2="19" stroke="currentColor" stroke-width="1.3"/><line x1="8" y1="15" x2="9" y2="15" stroke="currentColor" stroke-width="1.3"/><line x1="15" y1="15" x2="16" y2="15" stroke="currentColor" stroke-width="1.3"/>'),
    urgency: 'stop-now',
    meaning: 'The transmission control system has logged a fault.',
    action: 'Stop the machine and do not continue operating.',
    canEscalateToService: true,
  },
  {
    id: 'track-pressure-low',
    name: 'Track / tire pressure low',
    svg: triangle('<circle cx="12" cy="15" r="3.2" stroke="currentColor" stroke-width="1.3"/><line x1="12" y1="12.5" x2="12" y2="15.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><path d="M10.7 14.2l1.3 1.3 1.3-1.3" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/>'),
    urgency: 'monitor',
    meaning: 'Track or tire pressure is below the recommended range.',
    action: 'No immediate action. Have it checked at the next inspection.',
    canEscalateToService: false,
  },
]
