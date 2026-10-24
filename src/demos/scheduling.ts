export type Slot = { day: string; start: number; end: number };
export function overlaps(a: Slot, b: Slot) {
  return a.day === b.day && a.start < b.end && b.start < a.end;
}
