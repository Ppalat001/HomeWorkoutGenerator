import { computeAdaptiveLevel, labelForLevel, nextAdaptiveLevelUp } from "@/lib/adaptive";
import { EXERCISES } from "@/lib/exercises";
import { defaultTrainingWeekdayKeys } from "@/lib/training-week";
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
  /** Long label e.g. "Monday, Jan 15" in the user's locale. */
  label: string;
  /** Local calendar date `YYYY-MM-DD` for this column. */
  dateIso: string;
  isTrainingDay: boolean;
  exercises: PlannedExercise[];
};

export type GeneratedWorkoutPlan = {
  adaptiveLevel: AdaptiveLevel;
  displayLevel: ReturnType<typeof labelForLevel>;
  isReturnWorkout: boolean;
  explanation: string;
  consistency: ConsistencyPlan;
  today: DayPlan;
  week: DayPlan[];
};

export type ConsistencyDayStatus = "completed" | "skipped" | "planned" | "rest";

export type ConsistencyPlan = {
  weeklyTarget: number;
  onboardingTrainingDaysPerWeek: number;
  baseTrainingDaysPerWeek: number;
  hasManualTrainingDaysOverride: boolean;
  completedThisWeek: number;
  scheduledThisWeek: number;
  completionRate: number;
  streakCount: number;
  reminder: string | null;
  atRisk: boolean;
  suggestedDurationMinutes: number;
  durationDeltaMinutes: number;
  dayStatuses: { dateIso: string; weekdayKey: string; status: ConsistencyDayStatus }[];
  suggestedSwap: { fromDateIso: string; toDateIso: string } | null;
  canRequestSessionIncrease: boolean;
  showSessionIncreasePrompt: boolean;
  suggestedTrainingDaysPerWeek: number | null;
  sessionIncreasePromptEveryDays: number;
  sessionIncreasePromptNever: boolean;
  /** True when history spans long enough to evaluate the 4-week / 90% session rule. */
  hasFourWeeksWorkoutHistory: boolean;
  canSuggestLevelIncrease: boolean;
  showLevelIncreasePrompt: boolean;
  suggestedLevelIncrease: AdaptiveLevel | null;
  levelIncreasePromptEveryDays: number;
  levelIncreasePromptNever: boolean;
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

function localDateIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function weekWindowMonday(weeksAgo: number): { start: Date; endExclusive: Date } {
  const start = startOfWeekMonday(new Date());
  start.setDate(start.getDate() - weeksAgo * 7);
  const endExclusive = new Date(start);
  endExclusive.setDate(endExclusive.getDate() + 7);
  return { start, endExclusive };
}

function isoFromUnknownDate(input: Date): string {
  const d = new Date(input);
  return localDateIso(d);
}

function buildLatestEntryByDate(history: WorkoutHistoryEntry[]): Map<string, WorkoutHistoryEntry> {
  const byDate = new Map<string, WorkoutHistoryEntry>();
  const sorted = [...history].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  for (const item of sorted) {
    const key = isoFromUnknownDate(item.date);
    if (!byDate.has(key)) byDate.set(key, item);
  }
  return byDate;
}

function completedCountInRange(
  history: WorkoutHistoryEntry[],
  start: Date,
  endExclusive: Date
): number {
  return history.filter((h) => {
    const t = new Date(h.date).getTime();
    return t >= start.getTime() && t < endExclusive.getTime() && !h.skipped;
  }).length;
}

function weeklyCompletions(history: WorkoutHistoryEntry[], weeks: number): number[] {
  const counts: number[] = [];
  for (let w = 1; w <= weeks; w += 1) {
    const window = weekWindowMonday(w);
    counts.push(completedCountInRange(history, window.start, window.endExclusive));
  }
  return counts;
}

const MS_PER_DAY = 86_400_000;

/** Earliest workout at least `minDays` ago (vs now), so we have enough timeline for multi-week rules. */
function hasWorkoutHistorySpanningAtLeastDays(
  history: WorkoutHistoryEntry[],
  minDays: number
): boolean {
  if (history.length === 0) return false;
  const earliestMs = Math.min(
    ...history.map((h) => new Date(h.date).getTime())
  );
  return Date.now() - earliestMs >= minDays * MS_PER_DAY;
}

function hasFourConsecutiveHighCompletionWeeks(
  history: WorkoutHistoryEntry[],
  weeklyTarget: number
): boolean {
  if (weeklyTarget <= 0) return false;
  const last4Weeks = weeklyCompletions(history, 4);
  if (last4Weeks.length < 4) return false;
  return last4Weeks.every((completed) => completed / weeklyTarget > 0.9);
}

/**
 * True when some block of six consecutive Monday-based weeks (each week
 * ending after the user's first log) all have completed (non-skipped)
 * sessions ≥ 85% of `weeklyPlanDays`. Sliding window handles accounts
 * whose history does not align with "weeks 1–6 ago from today".
 */
function hasSixConsecutiveStrongCompletionWeeks(
  history: WorkoutHistoryEntry[],
  weeklyPlanDays: number
): boolean {
  if (weeklyPlanDays <= 0 || history.length === 0) return false;
  const earliestMs = Math.min(
    ...history.map((h) => new Date(h.date).getTime())
  );

  const maxStart = 24;
  for (let startW = 1; startW <= maxStart; startW += 1) {
    let blockOk = true;
    for (let j = 0; j < 6; j += 1) {
      const w = startW + j;
      const { start, endExclusive } = weekWindowMonday(w);
      if (endExclusive.getTime() <= earliestMs) {
        blockOk = false;
        break;
      }
      const completed = completedCountInRange(history, start, endExclusive);
      if (completed / weeklyPlanDays < 0.85) {
        blockOk = false;
        break;
      }
    }
    if (blockOk) return true;
  }
  return false;
}

function computeWeeklyTarget(
  history: WorkoutHistoryEntry[],
  baseline: number
): { target: number; delta: number } {
  const last6Weeks = weeklyCompletions(history, 6);
  const c1 = last6Weeks[0] ?? 0;
  const c2 = last6Weeks[1] ?? 0;
  const recent4 = last6Weeks.slice(0, 4);
  const weeksWithAnyCompletion = recent4.filter((c) => c > 0).length;
  const avg4 =
    recent4.length > 0
      ? recent4.reduce((sum, c) => sum + c, 0) / recent4.length
      : baseline;

  // Long-run adaptation: wait for broader trend before changing target.
  if (weeksWithAnyCompletion < 2) return { target: baseline, delta: 0 };
  if (c1 >= baseline && c2 >= baseline) return { target: baseline, delta: 0 };
  if (c1 < baseline && c2 < baseline && avg4 <= baseline - 0.75) {
    return { target: Math.max(2, baseline - 1), delta: -1 };
  }
  return { target: baseline, delta: 0 };
}

function computeStreak(history: WorkoutHistoryEntry[]): number {
  const sorted = [...history].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  let streak = 0;
  for (const h of sorted) {
    if (h.skipped) break;
    streak += 1;
  }
  return streak;
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
  const latestByDate = buildLatestEntryByDate(history);
  const baseTrainingDaysPerWeek =
    preferences.manualTrainingDaysPerWeek ?? preferences.trainingDaysPerWeek;
  const weeklyTargetResult = computeWeeklyTarget(
    history,
    baseTrainingDaysPerWeek
  );
  const streakCount = computeStreak(history);
  const weekStart = startOfWeekMonday(new Date());
  const todayIso = localDateIso(new Date());

  const suggestedDurationMinutes = Math.max(
    15,
    Math.min(
      90,
      preferences.workoutDurationMinutes +
        (streakCount >= 3 ? 5 : 0) +
        (weeklyTargetResult.delta < 0 || isReturnWorkout ? -10 : 0)
    )
  );
  const durationDeltaMinutes =
    suggestedDurationMinutes - preferences.workoutDurationMinutes;

  const sessionLevel: AdaptiveLevel = isReturnWorkout ? "beginner" : adaptiveLevel;
  let pool = filterPool(preferences, sessionLevel, isReturnWorkout);
  if (pool.length === 0) {
    pool = EXERCISES.filter((ex) => ex.level === "beginner" && ex.lowImpact);
  }

  const week: DayPlan[] = [];
  const preferred = defaultTrainingWeekdayKeys(
    baseTrainingDaysPerWeek
  );
  const maxDays = weeklyTargetResult.target;

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
        suggestedDurationMinutes
      );
    }

    week.push({
      weekdayKey: key,
      label: labelForDate(d),
      dateIso: localDateIso(d),
      isTrainingDay,
      exercises,
    });
  }

  const todayPlan =
    week.find((d) => d.dateIso === todayIso) ??
    week.find((d) => d.weekdayKey === weekdayKeyForDate(new Date())) ??
    week.find((d) => d.isTrainingDay) ??
    week[0];

  const explanation = explanationParts.join("\n\n");
  const completedThisWeek = week.filter((d) => {
    if (!d.isTrainingDay) return false;
    const entry = latestByDate.get(d.dateIso);
    return Boolean(entry && !entry.skipped);
  }).length;
  const scheduledThisWeek = week.filter((d) => d.isTrainingDay).length;
  const completionRate =
    scheduledThisWeek > 0 ? completedThisWeek / scheduledThisWeek : 0;
  const skippedPlannedBeforeToday = week.filter((d) => {
    if (!d.isTrainingDay || d.dateIso >= todayIso) return false;
    const entry = latestByDate.get(d.dateIso);
    return !entry || entry.skipped;
  }).length;
  const atRisk = skippedPlannedBeforeToday >= 2;
  const reminder = atRisk
    ? "You missed two planned sessions this week. Try a shorter session today to protect your streak."
    : completedThisWeek >= weeklyTargetResult.target
      ? "Great consistency. Keep momentum by booking your next training day now."
      : `Aim for ${weeklyTargetResult.target} completed workouts this week.`;

  const dayStatuses = week.map((d) => {
    const entry = latestByDate.get(d.dateIso);
    let status: ConsistencyDayStatus = "rest";
    if (d.isTrainingDay) {
      status = entry ? (entry.skipped ? "skipped" : "completed") : "planned";
    }
    return { dateIso: d.dateIso, weekdayKey: d.weekdayKey, status };
  });

  const todayEntry = latestByDate.get(todayIso);
  let suggestedSwap: { fromDateIso: string; toDateIso: string } | null = null;
  if (todayPlan.isTrainingDay && todayEntry?.skipped) {
    const fromIdx = week.findIndex((d) => d.dateIso === todayIso);
    if (fromIdx >= 0) {
      const after = week.find((d, idx) => idx > fromIdx && !d.isTrainingDay);
      const before = week
        .slice(0, fromIdx)
        .reverse()
        .find((d) => !d.isTrainingDay);
      const restDay = after ?? before ?? null;
      if (restDay) {
        suggestedSwap = { fromDateIso: todayIso, toDateIso: restDay.dateIso };
      }
    }
  }
  const hasFourWeeksWorkoutHistory = hasWorkoutHistorySpanningAtLeastDays(
    history,
    28
  );
  const canRequestSessionIncrease =
    hasFourWeeksWorkoutHistory &&
    hasFourConsecutiveHighCompletionWeeks(history, weeklyTargetResult.target) &&
    baseTrainingDaysPerWeek < 5;
  const sessionIncreasePromptNever = preferences.sessionIncreasePromptNever ?? false;
  const sessionIncreasePromptEveryDays =
    preferences.sessionIncreasePromptEveryDays ?? 7;
  const nextPromptAt = preferences.sessionIncreasePromptNextAt
    ? new Date(preferences.sessionIncreasePromptNextAt)
    : null;
  const showSessionIncreasePrompt =
    canRequestSessionIncrease &&
    !sessionIncreasePromptNever &&
    (!nextPromptAt || nextPromptAt.getTime() <= Date.now());
  const suggestedTrainingDaysPerWeek = canRequestSessionIncrease
    ? Math.min(5, baseTrainingDaysPerWeek + 1)
    : null;

  const suggestedLevelIncrease = nextAdaptiveLevelUp(adaptiveLevel);
  const canSuggestLevelIncrease =
    Boolean(suggestedLevelIncrease) &&
    hasSixConsecutiveStrongCompletionWeeks(
      history,
      baseTrainingDaysPerWeek
    );
  const levelIncreasePromptNever = preferences.levelIncreasePromptNever ?? false;
  const levelIncreasePromptEveryDays =
    preferences.levelIncreasePromptEveryDays ?? 7;
  const nextLevelPromptAt = preferences.levelIncreasePromptNextAt
    ? new Date(preferences.levelIncreasePromptNextAt)
    : null;
  const showLevelIncreasePrompt =
    canSuggestLevelIncrease &&
    !levelIncreasePromptNever &&
    (!nextLevelPromptAt || nextLevelPromptAt.getTime() <= Date.now());

  return {
    adaptiveLevel,
    displayLevel: labelForLevel(adaptiveLevel),
    isReturnWorkout,
    explanation,
    consistency: {
      weeklyTarget: weeklyTargetResult.target,
      onboardingTrainingDaysPerWeek: preferences.trainingDaysPerWeek,
      baseTrainingDaysPerWeek,
      hasManualTrainingDaysOverride:
        typeof preferences.manualTrainingDaysPerWeek === "number",
      completedThisWeek,
      scheduledThisWeek,
      completionRate,
      streakCount,
      reminder,
      atRisk,
      suggestedDurationMinutes,
      durationDeltaMinutes,
      dayStatuses,
      suggestedSwap,
      canRequestSessionIncrease,
      showSessionIncreasePrompt,
      suggestedTrainingDaysPerWeek,
      sessionIncreasePromptEveryDays,
      sessionIncreasePromptNever,
      hasFourWeeksWorkoutHistory,
      canSuggestLevelIncrease,
      showLevelIncreasePrompt,
      suggestedLevelIncrease,
      levelIncreasePromptEveryDays,
      levelIncreasePromptNever,
    },
    today: todayPlan,
    week,
  };
}
