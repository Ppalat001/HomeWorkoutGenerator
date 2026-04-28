import type { HeartRateInsight } from "@/lib/heart-rate-insights";

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/** Deterministic demo curve when Mongo has no samples for this exercise yet. */
export function getDemoHeartRateInsight(exerciseId: string): HeartRateInsight {
  const h = hashString(exerciseId);
  const base = 88 + (h % 28);
  const len = 16;
  const bpmSeries: number[] = [];
  for (let i = 0; i < len; i++) {
    const wave = Math.sin(i / 2.4 + h * 0.01) * 12;
    const drift = (i / len) * 8;
    const noise = ((h + i * 17) % 9) - 4;
    bpmSeries.push(Math.round(base + wave + drift + noise));
  }
  const maxBpm6Week = Math.max(...bpmSeries);
  const avgBpm6Week = Math.round(
    bpmSeries.reduce((a, b) => a + b, 0) / bpmSeries.length
  );
  return {
    avgBpm6Week,
    maxBpm6Week,
    bpmSeries,
    source: "demo",
  };
}
