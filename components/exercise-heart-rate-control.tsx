"use client";

import { useMemo, useState } from "react";
import { Activity } from "lucide-react";
import { getDemoHeartRateInsight } from "@/lib/demo-heart-rate";
import type { HeartRateInsight } from "@/lib/heart-rate-insights";

type Props = {
  exerciseId: string;
  exerciseName: string;
  insight: HeartRateInsight | undefined;
  variant?: "card" | "inline";
};

function HeartRateSparkline({ series }: { series: number[] }) {
  const path = useMemo(() => {
    if (series.length === 0) return null;
    const w = 264;
    const h = 52;
    const pad = 4;
    const min = Math.min(...series);
    const max = Math.max(...series);
    const span = Math.max(1, max - min);
    return {
      pts: series
        .map((v, i) => {
          const x = pad + (i / Math.max(1, series.length - 1)) * (w - pad * 2);
          const t = (v - min) / span;
          const y = pad + (1 - t) * (h - pad * 2);
          return `${x.toFixed(1)},${y.toFixed(1)}`;
        })
        .join(" "),
      min,
      max,
    };
  }, [series]);

  if (!path) {
    return null;
  }

  return (
    <div className="mt-2 rounded-lg border border-white/10 bg-[#050d1a]/90 p-1.5">
      <svg
        viewBox="0 0 272 60"
        className="w-full max-w-md text-cyan-300"
        role="img"
        aria-label={`Heart rate curve from about ${path.min} to ${path.max} BPM`}
      >
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          points={path.pts}
        />
      </svg>
      <div className="mt-1 flex justify-between text-[10px] text-white/45">
        <span>start</span>
        <span>end</span>
      </div>
    </div>
  );
}

export default function ExerciseHeartRateControl({
  exerciseId,
  exerciseName,
  insight,
  variant = "card",
}: Props) {
  const [open, setOpen] = useState(false);

  const effective: HeartRateInsight = useMemo(() => {
    if (insight && insight.bpmSeries.length > 0) return insight;
    if (insight && insight.bpmSeries.length === 0) {
      const demo = getDemoHeartRateInsight(exerciseId);
      return {
        ...demo,
        avgBpm6Week: insight.avgBpm6Week,
        maxBpm6Week: insight.maxBpm6Week,
        source: "history",
      };
    }
    return getDemoHeartRateInsight(exerciseId);
  }, [exerciseId, insight]);

  const panel = open && (
    <div
      className={
        variant === "inline"
          ? "absolute right-0 top-full z-30 mt-1 w-[min(calc(100vw-2rem),18rem)] rounded-xl border border-white/15 bg-[#07142f] p-3 shadow-xl shadow-black/50"
          : "mt-3 rounded-xl border border-cyan-400/25 bg-[#050d1a]/95 p-4"
      }
    >
      <p className="text-xs font-semibold text-cyan-100/90">{exerciseName}</p>
      <p className="mt-1 text-[11px] text-white/55">
        Recent avg{" "}
        <span className="font-semibold text-white/90">
          {effective.avgBpm6Week} BPM
        </span>
        {" · "}
        peak{" "}
        <span className="font-semibold text-white/90">
          {effective.maxBpm6Week} BPM
        </span>
        {effective.source === "demo" && (
          <span className="ml-1 rounded border border-amber-400/30 px-1 py-0.5 text-[10px] text-amber-100/90">
            demo
          </span>
        )}
      </p>
      <HeartRateSparkline series={effective.bpmSeries} />
    </div>
  );

  const btnClass =
    variant === "inline"
      ? "inline-flex items-center justify-center rounded-md border border-white/15 bg-white/5 p-1 text-cyan-200/90 transition hover:bg-white/10"
      : "inline-flex items-center gap-1.5 rounded-lg border border-cyan-400/40 bg-cyan-500/15 px-3 py-1.5 text-xs font-semibold text-cyan-50 transition hover:bg-cyan-500/25";

  const shell =
    variant === "inline" ? (
      <span className="relative inline-flex shrink-0">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={btnClass}
          aria-expanded={open}
          title="Heart rate (recent sessions)"
        >
          <Activity className="h-3.5 w-3.5" aria-hidden />
        </button>
        {panel}
      </span>
    ) : (
      <div className="flex w-full min-w-0 flex-col items-stretch">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={btnClass}
          aria-expanded={open}
          title="Heart rate (recent sessions)"
        >
          <Activity className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span>Heart rate</span>
        </button>
        {panel}
      </div>
    );

  return shell;
}
