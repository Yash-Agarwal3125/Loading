/**
 * Primary demo machine. Engine hours MUST chain from the judges' sample
 * table (1523.5 -> 1524.8 -> 1526.5 -> 1530.2). Say this out loud in the
 * pitch: "this is your dataset, extended."
 */
export const MACHINE = {
  id: 'EXC001',
  model: 'CAT Excavator 320',
  engineHours: 1530.2,
  nextServiceInHours: 18,
  systems: {
    engine: 'normal',
    hydraulic: 'normal',
    fuel: 38, // percent
    coolant: 'normal',
    attachment: 'normal',
  },
}
