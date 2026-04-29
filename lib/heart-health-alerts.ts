import { EXERCISES } from "@/lib/exercises";
import { isExcessiveHeartRateStrain } from "@/lib/heart-rate-strain";
import { startOfLocalToday } from "@/lib/past-heart-rate-sessions";
import type { WorkoutHistoryEntry } from "@/lib/workout-types";

/** How far back we look for strain patterns (logged sessions with HR). */
const LOOKBACK_DAYS = 120;

export type HighStrainExerciseSummary = {
  exerciseId: string;
  displayName: string;
  occurrences: number;
  lastAt: Date;
};

function exerciseDisplayName(
  exerciseId: string,
  exerciseName?: string
): string {
  if (exerciseName?.trim()) return exerciseName;
  const ex = EXERCISES.find((e) => e.id === exerciseId);
  return ex?.name ?? exerciseId;
}

function sessionHasAnyStrain(h: WorkoutHistoryEntry): boolean {
  return (h.exerciseHeartRates ?? []).some((e) => isExcessiveHeartRateStrain(e));
}

/** Longest run of consecutive exercises (same session order) flagged as high strain. */
export function maxConsecutiveStrainedExercisesInSession(
  h: WorkoutHistoryEntry
): number {
  const rates = h.exerciseHeartRates ?? [];
  let maxRun = 0;
  let cur = 0;
  for (const e of rates) {
    if (isExcessiveHeartRateStrain(e)) {
      cur += 1;
      maxRun = Math.max(maxRun, cur);
    } else {
      cur = 0;
    }
  }
  return maxRun;
}

function pastSessionsWithHeartRate(
  history: WorkoutHistoryEntry[]
): WorkoutHistoryEntry[] {
  const today = startOfLocalToday();
  const cutoff = new Date(today);
  cutoff.setDate(cutoff.getDate() - LOOKBACK_DAYS);

  return history.filter((h) => {
    const d = new Date(h.date);
    if (d >= today || d < cutoff) return false;
    if (h.skipped) return false;
    return (h.exerciseHeartRates?.length ?? 0) > 0;
  });
}

/**
 * Aggregates exercises that ever logged excessive strain (past sessions only).
 */
export function buildHighStrainExerciseSummary(
  history: WorkoutHistoryEntry[]
): HighStrainExerciseSummary[] {
  const past = pastSessionsWithHeartRate(history);
  const map = new Map<
    string,
    { displayName: string; occurrences: number; lastAt: Date }
  >();

  for (const h of past) {
    const at = new Date(h.date);
    for (const e of h.exerciseHeartRates ?? []) {
      if (!isExcessiveHeartRateStrain(e)) continue;
      const id = e.exerciseId;
      const name = exerciseDisplayName(id, e.exerciseName);
      const prev = map.get(id);
      if (!prev) {
        map.set(id, { displayName: name, occurrences: 1, lastAt: at });
      } else {
        prev.occurrences += 1;
        if (at > prev.lastAt) prev.lastAt = at;
        prev.displayName = name;
      }
    }
  }

  return [...map.entries()]
    .map(([exerciseId, v]) => ({
      exerciseId,
      displayName: v.displayName,
      occurrences: v.occurrences,
      lastAt: v.lastAt,
    }))
    .sort((a, b) => b.occurrences - a.occurrences);
}

export type HeartDoctorSuggestion = {
  show: boolean;
  reasons: string[];
};

/**
 * Suggests a medical check when:
 * - More than four logged workouts show high strain (≥5 sessions), or
 * - Three or more consecutive such workouts (by date order), or
 * - Within one workout, three or more consecutive exercises (stored order) are high strain.
 */
export function evaluateHeartDoctorSuggestion(
  history: WorkoutHistoryEntry[]
): HeartDoctorSuggestion {
  const past = pastSessionsWithHeartRate(history);
  const strainedSessions = past.filter(sessionHasAnyStrain);

  const reasons: string[] = [];

  if (strainedSessions.length > 4) {
    reasons.push(
      `You have more than four recent logged workouts with very high heart-rate strain (${strainedSessions.length} sessions). Consider having your heart checked by a doctor, especially if this was not planned hard training.`
    );
  }

  const sorted = [...past].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  let maxSessionStreak = 0;
  let curStreak = 0;
  for (const h of sorted) {
    if (sessionHasAnyStrain(h)) {
      curStreak += 1;
      maxSessionStreak = Math.max(maxSessionStreak, curStreak);
    } else {
      curStreak = 0;
    }
  }
  if (maxSessionStreak >= 3) {
    reasons.push(
      `Several workouts in a row included high heart-rate strain (${maxSessionStreak} consecutive sessions). If you were not doing deliberate high-intensity blocks, consider discussing this pattern with a clinician.`
    );
  }

  const maxMoveStreak = Math.max(
    0,
    ...past.map((h) => maxConsecutiveStrainedExercisesInSession(h))
  );
  if (maxMoveStreak >= 3) {
    reasons.push(
      `In at least one session, heart rate stayed very high across ${maxMoveStreak} exercises in a row. Repeated long spikes can warrant a cardiovascular check-up.`
    );
  }

  return { show: reasons.length > 0, reasons };
}
