import { EXERCISES } from "@/lib/exercises";
import { isExcessiveHeartRateStrain } from "@/lib/heart-rate-strain";
import type { WorkoutHistoryEntry } from "@/lib/workout-types";

function exerciseDisplayName(
  exerciseId: string,
  exerciseName?: string
): string {
  if (exerciseName?.trim()) return exerciseName;
  const ex = EXERCISES.find((e) => e.id === exerciseId);
  return ex?.name ?? exerciseId;
}

function localDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function startOfLocalToday(): Date {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
}

export type PastHeartExerciseRow = {
  exerciseId: string;
  displayName: string;
  avgBpm: number;
  maxBpm: number;
  bpmSeries: number[];
  excessiveStrain: boolean;
};

export type PastHeartSessionRow = {
  historyId: string;
  at: Date;
  timeLabel: string;
  completionRate: number;
  trackingStatus?: string;
  exercises: PastHeartExerciseRow[];
};

export type PastHeartDayGroup = {
  dateIso: string;
  dateLabel: string;
  sessions: PastHeartSessionRow[];
};

function timeLabel(d: Date): string {
  return d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function dayHeadingLabel(dateIso: string): string {
  const [y, mo, day] = dateIso.split("-").map(Number);
  const d = new Date(y, mo - 1, day);
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Past calendar days (before local today) with at least one logged session
 * that includes `exerciseHeartRates`. Newest days first.
 */
export function buildPastHeartRateDayGroups(
  history: WorkoutHistoryEntry[]
): PastHeartDayGroup[] {
  const todayStart = startOfLocalToday();

  const eligible = history.filter((h) => {
    const at = new Date(h.date);
    if (at >= todayStart) return false;
    if (h.skipped) return false;
    const rates = h.exerciseHeartRates;
    return Array.isArray(rates) && rates.length > 0;
  });

  const dayMap = new Map<string, PastHeartSessionRow[]>();

  for (const h of eligible) {
    const at = new Date(h.date);
    const key = localDateKey(at);
    const exercises: PastHeartExerciseRow[] = (h.exerciseHeartRates ?? []).map(
      (e) => ({
        exerciseId: e.exerciseId,
        displayName: exerciseDisplayName(e.exerciseId, e.exerciseName),
        avgBpm: e.avgBpm,
        maxBpm: e.maxBpm,
        bpmSeries: [...e.bpmSeries],
        excessiveStrain: isExcessiveHeartRateStrain(e),
      })
    );

    const session: PastHeartSessionRow = {
      historyId: h._id ?? "",
      at,
      timeLabel: timeLabel(at),
      completionRate: h.completionRate,
      trackingStatus: h.trackingStatus,
      exercises,
    };

    const list = dayMap.get(key) ?? [];
    list.push(session);
    dayMap.set(key, list);
  }

  const keys = [...dayMap.keys()].sort((a, b) => (a < b ? 1 : a > b ? -1 : 0));

  return keys.map((dateIso) => ({
    dateIso,
    dateLabel: dayHeadingLabel(dateIso),
    sessions: (dayMap.get(dateIso) ?? []).sort(
      (a, b) => b.at.getTime() - a.at.getTime()
    ),
  }));
}
