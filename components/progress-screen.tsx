"use client";

import { useEffect, useRef } from "react";
import type {
  MotivationPopup,
  WeekVolumeSlice,
} from "@/lib/dashboard-progress";

type Props = {
  payload: {
    weeks: WeekVolumeSlice[];
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
      <div className="flex h-36 w-36 flex-col items-center justify-center rounded-full border border-white/15 bg-white/5 text-center text-[11px] text-white/55 sm:h-40 sm:w-40">
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
      className="relative h-36 w-36 rounded-full p-2.5 sm:h-40 sm:w-40 sm:p-3"
      style={{ background: gradient }}
      role="img"
      aria-label={`Average session completion ${p} percent`}
    >
      <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-[#0a1628] text-center">
        <span className="text-2xl font-bold text-emerald-300 sm:text-3xl">
          {p}%
        </span>
        <span className="mt-0.5 text-[9px] uppercase tracking-wide text-white/45">
          Avg
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
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-md">
      <h3 className="text-base font-semibold leading-snug text-white">
        {slice.label}
      </h3>
      <p className="mt-2 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-[11px] leading-relaxed text-white/70">
        <span className="font-semibold text-white/90">Scheduled</span>{" "}
        training days:{" "}
        <strong className="text-cyan-200/95">{slice.scheduled}</strong>
        <span className="mx-2 text-white/35">·</span>
        <span className="font-semibold text-white/90">Logged</span> on those
        days:{" "}
        <strong className="text-emerald-200/95">{slice.sessionsLogged}</strong>{" "}
        <span className="text-white/45">
          (completed {slice.completed}, skipped {slice.skipped})
        </span>
      </p>
      <p className="mt-2 text-[11px] text-white/50">
        Pie: volume on scheduled days. Donut: average completion rate on{" "}
        <span className="text-white/70">completed</span> sessions only.
      </p>
      <div className="mt-5 flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-center">
        <div className="flex flex-col items-center gap-2">
          <div
            className="h-36 w-36 rounded-full shadow-lg ring-2 ring-white/10 sm:h-40 sm:w-40"
            style={{ background: g }}
            role="img"
            aria-label={`${slice.label} volume breakdown`}
          />
          <span className="text-[11px] text-white/50">Volume pie</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <QualityDonut percent={slice.avgCompletionPercent} />
          <span className="max-w-[10rem] text-center text-[11px] text-white/50">
            Avg completion (completed only)
          </span>
        </div>
      </div>
      <ul className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 text-[11px]">
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
            Every week since your first log (up to 52 weeks), newest first. Each
            card shows scheduled training days, how many you logged on those
            days, and average completion on finished sessions.
          </p>
          <p className="mt-2 text-xs text-white/45">
            Showing <strong className="text-white/70">{payload.weeks.length}</strong>{" "}
            week{payload.weeks.length === 1 ? "" : "s"}.
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

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {payload.weeks.map((slice) => (
          <WeekVolumeCard key={slice.weekStartIso} slice={slice} />
        ))}
      </div>
      <p className="text-center text-xs text-white/45">
        Weeks run Monday–Sunday, using the same training-day template as your
        adaptive plan.
      </p>
    </div>
  );
}
