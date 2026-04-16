const WEEKDAY_ORDER = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

/**
 * Spread `count` training sessions across the week (Mon→Sun) for calendar hints.
 * Does not lock the user to specific real-world days beyond this template.
 */
export function defaultTrainingWeekdayKeys(count: number): string[] {
  const n = Math.min(7, Math.max(2, Math.round(count)));
  if (n >= 7) {
    return [...WEEKDAY_ORDER];
  }
  const keys: string[] = [];
  for (let i = 0; i < n; i += 1) {
    const idx = Math.round((i * 6) / (n - 1));
    keys.push(WEEKDAY_ORDER[idx]);
  }
  return keys;
}
