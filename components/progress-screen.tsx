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

/** Done · Missed (no log, past) · Not completed (skipped + still to come) */
const PIE_COLORS = {
  done: "#22c55e",
  missed: "#f97316",
  notCompleted: "#ef4444",
} as const;

function weekPieGradient(slice: WeekVolumeSlice): string {
  const { completed, skipped, missed, upcoming, scheduled } = slice;
  if (scheduled <= 0) {
    return "conic-gradient(#1e293b 0deg 360deg)";
  }
  const notCompleted = skipped + upcoming;
  const parts: { value: number; color: string }[] = [
    { value: completed, color: PIE_COLORS.done },
    { value: missed, color: PIE_COLORS.missed },
    { value: notCompleted, color: PIE_COLORS.notCompleted },
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

function WeekVolumeCard({ slice }: { slice: WeekVolumeSlice }) {
  const g = weekPieGradient(slice);
  const notCompleted = slice.skipped + slice.upcoming;
  const pct = (n: number) =>
    slice.scheduled > 0
      ? Math.round((n / slice.scheduled) * 100)
      : 0;

  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-md">
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
        One pie per week: green = done, orange = missed (no log), red = not
        completed (skipped + still planned).
      </p>
      <div className="mt-4 flex w-full justify-center">
        <div className="w-full max-w-[160px] shrink-0">
          <div
            className="aspect-square w-full max-w-full rounded-full shadow-lg ring-2 ring-white/10"
            style={{ background: g }}
            role="img"
            aria-label={`${slice.label}: done, missed, not completed`}
          />
        </div>
      </div>
      <ul className="mt-4 flex flex-col gap-2 text-[11px] text-white/80">
        <li className="flex min-w-0 items-center gap-2">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ background: PIE_COLORS.done }}
          />
          <span className="min-w-0">
            Done {slice.completed}{" "}
            <span className="text-white/45">({pct(slice.completed)}%)</span>
          </span>
        </li>
        <li className="flex min-w-0 items-center gap-2">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ background: PIE_COLORS.missed }}
          />
          <span className="min-w-0">
            Missed {slice.missed}{" "}
            <span className="text-white/45">({pct(slice.missed)}%)</span>
          </span>
        </li>
        <li className="flex min-w-0 items-center gap-2">
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ background: PIE_COLORS.notCompleted }}
          />
          <span className="min-w-0">
            Not completed {notCompleted}{" "}
            <span className="text-white/45">
              ({pct(notCompleted)}%) — skipped {slice.skipped}, upcoming{" "}
              {slice.upcoming}
            </span>
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
            Every week since your first log (up to 52 weeks), newest first.
            Each card shows scheduled days, logs, and one pie: done (green),
            missed (orange), not completed (red).
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

      <div className="grid min-w-0 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 [&>*]:min-w-0">
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
