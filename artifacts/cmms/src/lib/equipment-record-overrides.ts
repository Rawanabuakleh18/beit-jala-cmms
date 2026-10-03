// PDM-01-053, original equipment record: power supply and air pressure only.
export function hasPowerAndAirUtilities(machineId: number, recordNumber = 1) {
  return [55, 109].includes(machineId) && recordNumber === 1;
}

// Verified master record: Roll Compactor, PDM-01-088.
// Scope this template exception to its original equipment record only.
export function hasRollSizeUtility(machineId: number, recordNumber = 1) {
  return machineId === 57 && recordNumber === 1;
}

// Karnavati Tablet Press Machine, PDM-01-089, original equipment record.
export function hasTabletPressUtilities(machineId: number, recordNumber = 1) {
  return machineId === 5 && recordNumber === 1;
}

// ROTARY TABLET PRESS, PDM-01-056: these fields describe pressing specifications.
export function hasRotaryTabletPressUtilities(machineId: number, recordNumber = 1) {
  return machineId === 56 && recordNumber === 1;
}

// PDM-01-097, first equipment record: Fluid Bed Processor.
export function hasProductContainerCapacity(machineId: number, recordNumber = 1) {
  return machineId === 58 && recordNumber === 1;
}

// PDM-01-097, second equipment record: RMG 600L (Rapid Shear Mixer).
export function hasPowlCapacity(machineId: number, recordNumber = 1) {
  return machineId === 58 && recordNumber === 2;
}

export function hasBlenderRpm(machineId: number, recordNumber = 1) {
  return machineId === 58 && recordNumber === 3;
}

// PDM-01-097, fourth equipment record: Tipper.
export function hasLifterCapacity(machineId: number, recordNumber = 1) {
  return machineId === 58 && recordNumber === 4;
}

// PDM-01-097, fifth equipment record: Dry CO-Mill 5HP.
export function hasCoMillCapacity(machineId: number, recordNumber = 1) {
  return machineId === 58 && recordNumber === 5;
}

// PDM-01-097, sixth equipment record: Wash In Place System 200L.
export function hasWaterConnection(machineId: number, recordNumber = 1) {
  return machineId === 58 && recordNumber === 6;
}
