import { generateWorkout } from "@/lib/generate-workout";
import type { ConsistencyPlan } from "@/lib/generate-workout";
import { defaultTrainingWeekdayKeys } from "@/lib/training-week";
import type { UserPreferences, WorkoutHistoryEntry } from "@/lib/workout-types";

const WEEKDAY_KEYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

function localDateIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
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

function buildLatestEntryByDate(
  history: WorkoutHistoryEntry[]
): Map<string, WorkoutHistoryEntry> {
  const byDate = new Map<string, WorkoutHistoryEntry>();
  const sorted = [...history].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  for (const item of sorted) {
    const key = localDateIso(new Date(item.date));
    if (!byDate.has(key)) byDate.set(key, item);
  }
  return byDate;
}

export type WeekVolumeSlice = {
  label: string;
  completed: number;
  skipped: number;
  missed: number;
  upcoming: number;
  scheduled: number;
  /** Mean `completionRate` of completed sessions this week, 0–100, or null if none. */
  avgCompletionPercent: number | null;
};

export type MotivationVariant = "comeback" | "celebrate" | "steady";

export type MotivationPopup = {
  title: string;
  body: string;
  variant: MotivationVariant;
};

function buildWeekVolumeSlice(
  weekStart: Date,
  consistency: Pick<ConsistencyPlan, "weeklyTarget" | "baseTrainingDaysPerWeek">,
  history: WorkoutHistoryEntry[],
  todayIso: string,
  label: string
): WeekVolumeSlice {
  const latestByDate = buildLatestEntryByDate(history);
  const preferred = defaultTrainingWeekdayKeys(consistency.baseTrainingDaysPerWeek);
  const maxDays = consistency.weeklyTarget;

  const days: { dateIso: string; isTrainingDay: boolean }[] = [];
  for (let i = 0; i < 7; i += 1) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    const key = weekdayKeyForDate(d);
    const scheduledSoFar = days.filter((x) => x.isTrainingDay).length;
    const isTrainingDay =
      preferred.includes(key) && scheduledSoFar < maxDays;
    days.push({ dateIso: localDateIso(d), isTrainingDay });
  }

  let completed = 0;
  let skipped = 0;
  let missed = 0;
  let upcoming = 0;
  let sumCompletion = 0;
  let completionSamples = 0;

  for (const day of days) {
    if (!day.isTrainingDay) continue;
    const entry = latestByDate.get(day.dateIso);
    if (entry && !entry.skipped) {
      completed += 1;
      sumCompletion += entry.completionRate;
      completionSamples += 1;
    } else if (entry?.skipped) {
      skipped += 1;
    } else if (day.dateIso < todayIso) {
      missed += 1;
    } else {
      upcoming += 1;
    }
  }

  const scheduled = days.filter((d) => d.isTrainingDay).length;
  const avgCompletionPercent =
    completionSamples > 0
      ? Math.round((sumCompletion / completionSamples) * 100)
      : null;

  return {
    label,
    completed,
    skipped,
    missed,
    upcoming,
    scheduled,
    avgCompletionPercent,
  };
}

const COMEBACK_TITLES = [
  "Let's get back on track",
  "Fresh start today",
  "You've got this",
];

const COMEBACK_BODIES = [
  "You were doing so well — one week doesn't define you. Let's build that muscle, one session at a time.",
  "Skipping happens. What matters is the next rep. Try a shorter session today and rebuild momentum.",
  "Low completion this week only means your body asked for a break. Ease back in — consistency beats perfection.",
];

const CELEBRATE_TITLES = [
  "Keep up the great work!",
  "You're crushing it",
  "Consistency champion",
];

const CELEBRATE_BODIES = [
  "Your training rhythm looks strong. Stay curious, stay moving — you're earning those gains.",
  "Solid week — your future self will thank you. Lock in the next session while motivation is high.",
  "This is what steady progress looks like. Enjoy the win, then show up again next time.",
];

const STEADY_TITLES = [
  "Stay in the game",
  "Nice momentum",
  "You're on the path",
];

const STEADY_BODIES = [
  "You're showing up more often than not. A small push this week could tip you into a new groove.",
  "Room to grow, and you're already moving. Book your next slot before the week fills up.",
  "Progress isn't always linear — you're still stacking wins. One more quality session goes a long way.",
];

function stablePick<T>(items: T[], seed: string): T {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) {
    h = (h * 31 + seed.charCodeAt(i)) | 0;
  }
  const idx = Math.abs(h) % items.length;
  return items[idx];
}

export function pickMotivationPopup(
  userId: string,
  atRisk: boolean,
  thisWeek: WeekVolumeSlice,
  lastWeek: WeekVolumeSlice,
  streakCount: number
): MotivationPopup {
  const seed = `${userId}-${thisWeek.label}`;
  const scheduled = thisWeek.scheduled;
  const doneRate =
    scheduled > 0 ? thisWeek.completed / scheduled : 0;
  const slipThisWeek = thisWeek.skipped + thisWeek.missed;
  const slipLastWeek = lastWeek.skipped + lastWeek.missed;

  const needsComeback =
    atRisk ||
    slipThisWeek >= 2 ||
    doneRate < 0.45 ||
    (scheduled >= 3 && thisWeek.completed === 0 && slipThisWeek > 0) ||
    (slipLastWeek >= 3 && doneRate < 0.7);

  const crushingIt =
    !needsComeback &&
    scheduled > 0 &&
    doneRate >= 0.85 &&
    streakCount >= 2 &&
    slipThisWeek <= 1;

  if (needsComeback) {
    return {
      title: stablePick(COMEBACK_TITLES, seed),
      body: stablePick(COMEBACK_BODIES, `${seed}-b`),
      variant: "comeback",
    };
  }
  if (crushingIt) {
    return {
      title: stablePick(CELEBRATE_TITLES, seed),
      body: stablePick(CELEBRATE_BODIES, `${seed}-b`),
      variant: "celebrate",
    };
  }
  return {
    title: stablePick(STEADY_TITLES, seed),
    body: stablePick(STEADY_BODIES, `${seed}-b`),
    variant: "steady",
  };
}

export type ProgressDashboardPayload = {
  thisWeek: WeekVolumeSlice;
  lastWeek: WeekVolumeSlice;
  motivationPopup: MotivationPopup;
  weeklyTarget: number;
  streakCount: number;
  atRisk: boolean;
};

export function buildProgressDashboardPayload(
  preferences: UserPreferences,
  history: WorkoutHistoryEntry[]
): ProgressDashboardPayload {
  const plan = generateWorkout(preferences, history);
  const { consistency } = plan;
  const todayIso = localDateIso(new Date());
  const weekStart = startOfWeekMonday(new Date());
  const lastWeekStart = new Date(weekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);

  const slicePick = {
    weeklyTarget: consistency.weeklyTarget,
    baseTrainingDaysPerWeek: consistency.baseTrainingDaysPerWeek,
  };

  const thisWeek = buildWeekVolumeSlice(
    weekStart,
    slicePick,
    history,
    todayIso,
    "This week"
  );
  const lastWeek = buildWeekVolumeSlice(
    lastWeekStart,
    slicePick,
    history,
    todayIso,
    "Last week"
  );

  const motivationPopup = pickMotivationPopup(
    preferences.userId,
    consistency.atRisk,
    thisWeek,
    lastWeek,
    consistency.streakCount
  );

  return {
    thisWeek,
    lastWeek,
    motivationPopup,
    weeklyTarget: consistency.weeklyTarget,
    streakCount: consistency.streakCount,
    atRisk: consistency.atRisk,
  };
}
