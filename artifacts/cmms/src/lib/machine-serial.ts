type MachineForSerial = {
  id: number;
  machineNumber: string;
  machineName: string;
};

const normalizedNumber = (value: string) => value.replace(/\s/g, "").toUpperCase();
const normalizedName = (value: string) => value
  .trim()
  .replace(/\s*\(Fresh Air\)\s*$/i, "");

export function compareMachinesForSerial(left: MachineForSerial, right: MachineForSerial) {
  const leftNumber = normalizedNumber(left.machineNumber);
  const rightNumber = normalizedNumber(right.machineNumber);
  // Some imported equipment names contain invisible trailing spaces.  Ignore
  // them so AC-1 is sorted with AC-2 through AC-6 instead of in a separate
  // "Air Handling Unit " group.
  return normalizedName(left.machineName).localeCompare(normalizedName(right.machineName), "en", { numeric: true })
    || leftNumber.localeCompare(rightNumber, "en", { numeric: true });
}

export function machineSerialMap<T extends MachineForSerial>(machines: T[]) {
  return new Map(
    [...machines].sort(compareMachinesForSerial).map((machine, index) => [machine.id, index + 1]),
  );
}
