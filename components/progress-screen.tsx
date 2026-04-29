"use client";

import { useEffect, useRef } from "react";
import type {
  MotivationPopup,
  WeekVolumeSlice,
} from "@/lib/dashboard-progress";

type Props = {
  payload: {
    thisWeek: WeekVolumeSlice;
    lastWeek: WeekVolumeSlice;
    motivationPopup: MotivationPopup;
    weeklyTarget: number;
    streakCount: number;
    atRisk: boolean;
  };
};

const PIE_COLORS = {
  completed: "#22c55e",
  skipped: "#fb923c",
  missed: "#64748b",
  upcoming: "#38bdf8",
} as const;

function volumeConicGradient(slice: WeekVolumeSlice): string {
  const { completed, skipped, missed, upcoming, scheduled } = slice;
  if (scheduled <= 0) {
    return "conic-gradient(#1e293b 0deg 360deg)";
  }
  const parts: { value: number; color: string }[] = [
    { value: completed, color: PIE_COLORS.completed },
    { value: skipped, color: PIE_COLORS.skipped },
    { value: missed, color: PIE_COLORS.missed },
    { value: upcoming, color: PIE_COLORS.upcoming },
  ];
  let acc = 0;
  const segments: string[] = [];
  for (const p of parts) {
    if (p.value <= 0) continue;
    const deg = (p.value / scheduled) * 360;
    const start = acc;
    acc += deg;
    segments.push(`${p.color} ${start}deg ${acc}deg`);
  }
  if (segments.length === 0) {
    return "conic-gradient(#1e293b 0deg 360deg)";
  }
  return `conic-gradient(${segments.join(", ")})`;
}

function QualityDonut({ percent }: { percent: number | null }) {
  if (percent === null) {
    return (
      <div className="flex h-44 w-44 flex-col items-center justify-center rounded-full border border-white/15 bg-white/5 text-center text-xs text-white/55">
        No completed
        <br />
        sessions yet
      </div>
    );
  }
  const p = Math.min(100, Math.max(0, percent));
  const gradient = `conic-gradient(#22c55e 0deg ${(p / 100) * 360}deg, #1e293b ${(p / 100) * 360}deg 360deg)`;
  return (
    <div
      className="relative h-44 w-44 rounded-full p-3"
      style={{ background: gradient }}
      role="img"
      aria-label={`Average session completion ${p} percent`}
    >
      <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-[#0a1628] text-center">
        <span className="text-3xl font-bold text-emerald-300">{p}%</span>
        <span className="mt-1 text-[10px] uppercase tracking-wide text-white/45">
          Avg completion
        </span>
      </div>
    </div>
  );
}

function WeekVolumeCard({ slice }: { slice: WeekVolumeSlice }) {
  const g = volumeConicGradient(slice);
  const pct = (n: number) =>
    slice.scheduled > 0
      ? Math.round((n / slice.scheduled) * 100)
      : 0;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-md">
      <h3 className="text-lg font-semibold text-white">{slice.label}</h3>
      <p className="mt-1 text-xs text-white/55">
        Training days vs completed, skipped, missed, and still planned.
      </p>
      <div className="mt-6 flex flex-col items-center gap-8 md:flex-row md:items-start md:justify-center">
        <div className="flex flex-col items-center gap-3">
          <div
            className="h-44 w-44 rounded-full shadow-lg ring-2 ring-white/10"
            style={{ background: g }}
            role="img"
            aria-label={`${slice.label} volume breakdown`}
          />
          <span className="text-xs text-white/50">
            {slice.scheduled} scheduled day{slice.scheduled === 1 ? "" : "s"}
          </span>
        </div>
        <div className="flex flex-col items-center gap-3">
          <QualityDonut percent={slice.avgCompletionPercent} />
          <span className="text-xs text-white/50">Logged sessions only</span>
        </div>
      </div>
      <ul className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs">
        <li className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ background: PIE_COLORS.completed }}
          />
          <span className="text-white/80">
            Done {slice.completed}{" "}
            <span className="text-white/45">({pct(slice.completed)}%)</span>
          </span>
        </li>
        <li className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ background: PIE_COLORS.skipped }}
          />
          <span className="text-white/80">
            Skipped {slice.skipped}{" "}
            <span className="text-white/45">({pct(slice.skipped)}%)</span>
          </span>
        </li>
        <li className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ background: PIE_COLORS.missed }}
          />
          <span className="text-white/80">
            Missed {slice.missed}{" "}
            <span className="text-white/45">({pct(slice.missed)}%)</span>
          </span>
        </li>
        <li className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ background: PIE_COLORS.upcoming }}
          />
          <span className="text-white/80">
            Upcoming {slice.upcoming}{" "}
            <span className="text-white/45">({pct(slice.upcoming)}%)</span>
          </span>
        </li>
      </ul>
    </div>
  );
}

function variantStyles(variant: MotivationPopup["variant"]) {
  switch (variant) {
    case "comeback":
      return {
        ring: "border-amber-400/40 bg-amber-500/15",
        accent: "text-amber-100",
      };
    case "celebrate":
      return {
        ring: "border-emerald-400/45 bg-emerald-500/15",
        accent: "text-emerald-100",
      };
    default:
      return {
        ring: "border-sky-400/40 bg-sky-500/15",
        accent: "text-sky-100",
      };
  }
}

export default function ProgressScreen({ payload }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openedRef = useRef(false);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el || openedRef.current) return;
    openedRef.current = true;
    if (!el.open) {
      el.showModal();
    }
  }, []);

  const m = payload.motivationPopup;
  const vs = variantStyles(m.variant);

  return (
    <div className="space-y-8">
      <dialog
        ref={dialogRef}
        className={`max-w-md rounded-2xl border p-6 text-white shadow-2xl [&::backdrop]:bg-black/60 ${vs.ring}`}
      >
        <p className={`text-xs font-semibold uppercase tracking-wide ${vs.accent}`}>
          {m.variant === "comeback"
            ? "We noticed a dip"
            : m.variant === "celebrate"
              ? "You're on fire"
              : "Progress check-in"}
        </p>
        <h2 className="mt-2 text-xl font-bold tracking-tight">{m.title}</h2>
        <p className="mt-3 text-sm leading-relaxed text-white/85">{m.body}</p>
        <form method="dialog" className="mt-6 flex justify-end">
          <button
            type="submit"
            className="rounded-xl bg-white/15 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/25"
          >
            Got it
          </button>
        </form>
      </dialog>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Weekly overview</h2>
          <p className="mt-1 max-w-2xl text-sm text-white/65">
            Volume pie shows how your scheduled training days went. The donut
            is the average completion score from sessions you finished (
            {payload.thisWeek.label.toLowerCase()}).
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-xs">
          <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-white/75">
            Target:{" "}
            <strong className="text-white">{payload.weeklyTarget}</strong>{" "}
            sessions / wk
          </span>
          <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-white/75">
            Streak:{" "}
            <strong className="text-white">{payload.streakCount}</strong>{" "}
            completed logs
          </span>
          {payload.atRisk && (
            <span className="rounded-lg border border-amber-400/35 bg-amber-500/10 px-3 py-1.5 text-amber-100">
              Week needs attention
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <WeekVolumeCard slice={payload.thisWeek} />
        <WeekVolumeCard slice={payload.lastWeek} />
      </div>
      <p className="text-center text-xs text-white/45">
        Pies use the same weekly schedule template as your plan (Mon–Sun).
      </p>
    </div>
  );
}
