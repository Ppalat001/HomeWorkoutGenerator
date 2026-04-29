import { buildSessionExercisePool, plannedFromExercise } from "@/lib/generate-workout";
import type { DayPlan } from "@/lib/generate-workout";
import type {
  AdaptiveLevel,
  Exercise,
  ExercisePoolPreferences,
  PlannedExercise,
} from "@/lib/workout-types";

function scoreExerciseId(id: string, salt: number): number {
  let h = salt | 0;
  for (let i = 0; i < id.length; i += 1) {
    h = (h * 31 + id.charCodeAt(i)) | 0;
  }
  return h;
}

function pickDeterministic(candidates: Exercise[], salt: number): Exercise | null {
  if (candidates.length === 0) return null;
  const sorted = [...candidates].sort((a, b) => {
    const da = scoreExerciseId(a.id, salt);
    const db = scoreExerciseId(b.id, salt);
    if (da !== db) return da - db;
    return a.name.localeCompare(b.name);
  });
  return sorted[0] ?? null;
}

/**
 * Picks a replacement exercise for the current session level and filters,
 * excluding disliked ids and exercises already used in this session.
 */
export function pickReplacementPlannedExercise(
  preferences: ExercisePoolPreferences,
  sessionLevel: AdaptiveLevel,
  isReturnWorkout: boolean,
  dislikedIds: ReadonlySet<string>,
  alreadyUsedIds: ReadonlySet<string>,
  replaced: PlannedExercise,
  shuffleSalt: number
): PlannedExercise | null {
  const pool = buildSessionExercisePool(preferences, sessionLevel, isReturnWorkout);
  const eligible = pool.filter(
    (e) => !dislikedIds.has(e.id) && !alreadyUsedIds.has(e.id) && e.id !== replaced.id
  );
  if (eligible.length === 0) return null;

  const sameType = eligible.filter((e) => e.type === replaced.type);
  const candidates = sameType.length > 0 ? sameType : eligible;
  const chosen = pickDeterministic(candidates, shuffleSalt);
  if (!chosen) return null;
  return plannedFromExercise(chosen, preferences);
}

/** Replaces any disliked exercises in the week grid with valid alternatives. */
export function applyDislikesToWeek(
  week: DayPlan[],
  preferences: ExercisePoolPreferences,
  sessionLevel: AdaptiveLevel,
  isReturnWorkout: boolean,
  dislikedIds: ReadonlySet<string>
): DayPlan[] {
  return week.map((day) => {
    if (!day.isTrainingDay || day.exercises.length === 0) return day;
    const exercises = [...day.exercises];
    for (let guard = 0; guard < 64; guard += 1) {
      const badIdx = exercises.findIndex((e) => dislikedIds.has(e.id));
      if (badIdx < 0) break;
      const current = exercises[badIdx]!;
      const used = new Set(exercises.map((e) => e.id));
      used.delete(current.id);
      const rep = pickReplacementPlannedExercise(
        preferences,
        sessionLevel,
        isReturnWorkout,
        dislikedIds,
        used,
        current,
        guard + day.dateIso.charCodeAt(0) + badIdx * 17
      );
      if (!rep) break;
      exercises[badIdx] = rep;
    }
    return { ...day, exercises };
  });
}
