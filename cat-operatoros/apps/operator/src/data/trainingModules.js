/**
 * Training Hub content. Three formats, because the problem statement asks
 * for "e-learning videos, instructor booking or simulation module".
 *
 *   scenario   - 30-second decision question (the adaptive one)
 *   video      - poster tile + duration. NO real playback; do not ship a
 *                play button that does nothing, label it as a module card.
 *   instructor - one slot picker, one confirmation screen
 *
 * Every module carries `triggeredBy`: the observed behaviour that caused it
 * to be assigned. A module with no provenance line is a generic e-learning
 * app and scores nothing.
 */
export const TRAINING_MODULES = [
  {
    id: 'mod-proximity-scenario',
    format: 'scenario',
    skill: 'Proximity awareness',
    title: 'Vehicles in the swing radius',
    durationSec: 30,
    triggeredBy: 'Proximity alerts this week in Zone C',
    question: 'A dump truck is backing toward your swing radius while you are mid-cycle. What do you do first?',
    options: [
      { id: 'stop-and-signal', text: 'Stop the swing and signal the driver' },
      { id: 'finish-cycle', text: 'Finish the current cycle, then stop' },
      { id: 'speed-up', text: 'Speed up to clear the radius first' },
    ],
    correctId: 'stop-and-signal',
    explanation: 'Stopping the swing removes the hazard immediately. Finishing the cycle or speeding up both keep the machine moving toward the truck while it closes distance.',
  },
  {
    id: 'mod-fuel-video',
    format: 'video',
    skill: 'Fuel efficiency',
    title: 'Smooth throttle, better burn',
    durationSec: 150,
    triggeredBy: 'Fuel used per cycle trending above your normal baseline',
  },
  {
    id: 'mod-loading-scenario',
    format: 'scenario',
    skill: 'Safe loading',
    title: 'Loading near a slope edge',
    durationSec: 30,
    triggeredBy: 'Heavy loads recorded close to a graded edge',
    question: 'You are loading a full bucket on a slope that drops away on one side. Where do you position the swing?',
    options: [
      { id: 'swing-uphill', text: 'Swing and dump toward the uphill side' },
      { id: 'swing-downhill', text: 'Swing toward the drop for a shorter cycle' },
      { id: 'either-fine', text: 'Either side is fine at this load' },
    ],
    correctId: 'swing-uphill',
    explanation: 'A full bucket shifts the centre of gravity. Swinging toward the drop adds tipping risk exactly when the load is heaviest.',
  },
  {
    id: 'mod-slope-instructor',
    format: 'instructor',
    skill: 'Slope operation',
    title: 'Loaded operation on grade',
    durationSec: null,
    triggeredBy: 'Heavy-load-plus-slope safety alerts this week',
  },
  {
    id: 'mod-smooth-scenario',
    format: 'scenario',
    skill: 'Smooth operation',
    title: 'Cycle time under pressure',
    durationSec: 30,
    triggeredBy: 'Cycle time drifting above your normal pace',
    question: 'You are behind schedule and cycle time is climbing. What actually gets you back on pace?',
    options: [
      { id: 'smooth-arcs', text: 'Smoother swing arcs and less over-travel' },
      { id: 'rush-each-cycle', text: 'Rush each individual movement' },
      { id: 'skip-checks', text: 'Skip the load-check pause each cycle' },
    ],
    correctId: 'smooth-arcs',
    explanation: 'Rushed, jerky movements cost more time correcting overshoot than they save. Smoother arcs are consistently faster over a full cycle.',
  },
  {
    id: 'mod-idle-video',
    format: 'video',
    skill: 'Idle reduction',
    title: 'Cutting idle time',
    durationSec: 180,
    triggeredBy: 'Idle time trending above your normal baseline',
  },
  {
    id: 'mod-hazard-video',
    format: 'video',
    skill: 'Hazard awareness',
    title: 'Reading site hazard zones',
    durationSec: 120,
    triggeredBy: 'Approaching a zone with prior reported incidents',
  },
]

export const SKILLS = [
  'Proximity awareness',
  'Fuel efficiency',
  'Safe loading',
  'Slope operation',
  'Smooth operation',
  'Idle reduction',
  'Hazard awareness',
]
