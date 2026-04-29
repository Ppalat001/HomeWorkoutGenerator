import type { ExerciseHeartRateEntry } from "@/lib/workout-types";

/**
 * Flags unusually high / sustained strain for a typical home workout (no age on file).
 * Conservative but sensitive enough to catch hard cardio blocks in logged data.
 * - Critical peak: max BPM ≥ 175.
 * - Sustained load: ≥50% of samples ≥ 158 BPM and max ≥ 168.
 * - Long streak: 9 consecutive samples ≥ 158 BPM.
 */
export function isExcessiveHeartRateStrain(entry: ExerciseHeartRateEntry): boolean {
  const CRITICAL_MAX = 175;
  const HIGH = 158;
  const sustainedRatio = 0.5;
  const streakNeed = 9;

  if (entry.maxBpm >= CRITICAL_MAX) return true;

  const series = entry.bpmSeries;
  if (!series.length) {
    return entry.avgBpm >= 155 && entry.maxBpm >= 170;
  }

  const highCount = series.filter((v) => v >= HIGH).length;
  if (highCount / series.length >= sustainedRatio && entry.maxBpm >= 168) {
    return true;
  }

  let streak = 0;
  for (const v of series) {
    if (v >= HIGH) {
      streak += 1;
      if (streak >= streakNeed) return true;
    } else {
      streak = 0;
    }
  }

  return false;
}
