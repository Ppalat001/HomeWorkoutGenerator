import type { WorkoutHistoryEntry } from "@/lib/workout-types";

export type HeartRateInsight = {
  avgBpm6Week: number;
  maxBpm6Week: number;
  bpmSeries: number[];
  /** Whether values come from `workout_history` or a deterministic demo fallback. */
  source: "history" | "demo";
};

/** ~60 days so a full 6-week training block (Mon-start aligned) stays in window. */
const HEART_RATE_HISTORY_WINDOW_MS = 60 * 24 * 60 * 60 * 1000;

/**
 * Builds per-exercise heart-rate insights from recent history (default window ~60 days).
 * Uses the most recent session's `bpmSeries` for the chart; averages `avgBpm` / `maxBpm` across sessions.
 */
export function buildHeartRateInsightsMap(
  history: WorkoutHistoryEntry[],
  exerciseIds: string[]
): Record<string, HeartRateInsight> {
  const now = Date.now();
  const recent = history.filter(
    (entry) => now - new Date(entry.date).getTime() <= HEART_RATE_HISTORY_WINDOW_MS
  );

  const out: Record<string, HeartRateInsight> = {};

  for (const exerciseId of exerciseIds) {
    const matchingEntries = recent
      .filter((entry) =>
        entry.exerciseHeartRates?.some((e) => e.exerciseId === exerciseId)
      )
      .sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

    if (matchingEntries.length === 0) continue;

    const slices = matchingEntries.flatMap((entry) =>
      (entry.exerciseHeartRates ?? []).filter((e) => e.exerciseId === exerciseId)
    );
    if (slices.length === 0) continue;

    const avgBpm6Week = Math.round(
      slices.reduce((s, m) => s + m.avgBpm, 0) / slices.length
    );
    const maxBpm6Week = Math.max(...slices.map((m) => m.maxBpm));

    const latest = matchingEntries[0].exerciseHeartRates?.find(
      (e) => e.exerciseId === exerciseId
    );
    const bpmSeries = latest?.bpmSeries?.length ? [...latest.bpmSeries] : [];

    out[exerciseId] = {
      avgBpm6Week,
      maxBpm6Week,
      bpmSeries,
      source: "history",
    };
  }

  return out;
}
