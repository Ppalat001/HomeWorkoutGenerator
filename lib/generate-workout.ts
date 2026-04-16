import { computeAdaptiveLevel, labelForLevel } from "@/lib/adaptive";
import { EXERCISES } from "@/lib/exercises";
import type {
  AdaptiveLevel,
  Exercise,
  PlannedExercise,
  UserPreferences,
  WorkoutHistoryEntry,
} from "@/lib/workout-types";

const WEEKDAY_KEYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

export type DayPlan = {
  weekdayKey: string;
  label: string;
  isTrainingDay: boolean;
  exercises: PlannedExercise[];
};

export type GeneratedWorkoutPlan = {
  adaptiveLevel: AdaptiveLevel;
  displayLevel: ReturnType<typeof labelForLevel>;
  isReturnWorkout: boolean;
  explanation: string;
  today: DayPlan;
  week: DayPlan[];
};

function levelRank(level: AdaptiveLevel): number {
  switch (level) {
    case "expert":
      return 2;
    case "intermediate":
      return 1;
    default:
      return 0;
  }
}

function filterPool(
  preferences: UserPreferences,
  sessionLevel: AdaptiveLevel,
  isReturnWorkout: boolean
): Exercise[] {
  const targetRank = isReturnWorkout ? 0 : levelRank(sessionLevel);

  return EXERCISES.filter((ex) => {
    if (preferences.wantsLowImpact && !ex.lowImpact) return false;
    if (
      preferences.preferredExerciseTypes.length > 0 &&
      !preferences.preferredExerciseTypes.includes(ex.type)
    ) {
      return false;
    }
    const exRank = levelRank(ex.level);
    if (isReturnWorkout) {
      return ex.level === "beginner" && ex.lowImpact;
    }
    return exRank === targetRank;
  });
}

function goalSort(preferences: UserPreferences, a: Exercise, b: Exercise): number {
  if (preferences.goal === "weight_loss") {
    const ac = a.type === "cardio" ? 0 : 1;
    const bc = b.type === "cardio" ? 0 : 1;
    if (ac !== bc) return ac - bc;
  }
  if (preferences.goal === "muscle_gain") {
    const as = a.type === "strength" ? 0 : 1;
    const bs = b.type === "strength" ? 0 : 1;
    if (as !== bs) return as - bs;
  }
  return a.name.localeCompare(b.name);
}

function pickSession(
  preferences: UserPreferences,
  pool: Exercise[],
  seed: number,
  durationCap: number
): PlannedExercise[] {
  if (pool.length === 0) return [];

  const sorted = [...pool].sort((a, b) => {
    const g = goalSort(preferences, a, b);
    if (g !== 0) return g;
    return (a.id.charCodeAt(0) ^ seed) - (b.id.charCodeAt(0) ^ seed);
  });

  const planned: PlannedExercise[] = [];
  let used = 0;
  let i = seed % sorted.length;

  while (used < durationCap && sorted.length > 0) {
    const ex = sorted[i % sorted.length];
    const minutes = ex.duration ?? 4;
    if (used + minutes > durationCap + 2 && planned.length >= 3) break;

    const sets = preferences.goal === "muscle_gain" ? 4 : 3;
    const repsDisplay = ex.reps ? `${ex.reps}` : "30–45s";

    planned.push({
      ...ex,
      sets,
      repsDisplay,
      minutes,
    });

    used += minutes;
    i += 1;

    if (planned.length >= 8) break;
  }

  return planned;
}

function startOfWeekMonday(d: Date): Date {
  const copy = new Date(d);
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function weekdayKeyForDate(d: Date): string {
  return WEEKDAY_KEYS[d.getDay()];
}

function labelForDate(d: Date): string {
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

/**
 * Builds a personalized weekly grid and today's session from preferences and history.
 */
export function generateWorkout(
  preferences: UserPreferences,
  history: WorkoutHistoryEntry[]
): GeneratedWorkoutPlan {
  const { adaptiveLevel, isReturnWorkout, explanationParts } =
    computeAdaptiveLevel(preferences, history);

  const sessionLevel: AdaptiveLevel = isReturnWorkout ? "beginner" : adaptiveLevel;
  let pool = filterPool(preferences, sessionLevel, isReturnWorkout);
  if (pool.length === 0) {
    pool = EXERCISES.filter((ex) => ex.level === "beginner" && ex.lowImpact);
  }

  const weekStart = startOfWeekMonday(new Date());
  const week: DayPlan[] = [];
  const preferred = preferences.preferredTrainingDays.map((x) =>
    x.toLowerCase()
  );
  const maxDays = Math.min(
    preferences.trainingDaysPerWeek,
    preferred.length || preferences.trainingDaysPerWeek
  );

  for (let i = 0; i < 7; i += 1) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    const key = weekdayKeyForDate(d);
    const scheduledSoFar = week.filter((x) => x.isTrainingDay).length;
    const isTrainingDay =
      preferred.includes(key) && scheduledSoFar < maxDays;

    let exercises: PlannedExercise[] = [];
    if (isTrainingDay) {
      const seed =
        (preferences.userId.length + i + weekStart.getTime()) % 1000;
      exercises = pickSession(
        preferences,
        pool,
        seed,
        preferences.workoutDurationMinutes
      );
    }

    week.push({
      weekdayKey: key,
      label: labelForDate(d),
      isTrainingDay,
      exercises,
    });
  }

  const todayKey = weekdayKeyForDate(new Date());
  const todayPlan =
    week.find((d) => d.weekdayKey === todayKey) ??
    week.find((d) => d.isTrainingDay) ??
    week[0];

  const explanation = explanationParts.join("\n\n");

  return {
    adaptiveLevel,
    displayLevel: labelForLevel(adaptiveLevel),
    isReturnWorkout,
    explanation,
    today: todayPlan,
    week,
  };
}
