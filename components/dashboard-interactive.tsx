"use client";

import { useCallback, useMemo, useState } from "react";
import type { DayPlan } from "@/lib/generate-workout";
import type { AdaptiveLevel } from "@/lib/workout-types";
import WorkoutFeedback from "@/components/workout-feedback";

function localTodayIso(): string {
  const n = new Date();
  const y = n.getFullYear();
  const m = String(n.getMonth() + 1).padStart(2, "0");
  const d = String(n.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function chipLabel(d: DayPlan): string {
  const [y, mo, day] = d.dateIso.split("-").map(Number);
  const date = new Date(y, mo - 1, day);
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
  });
}

function pillDateLabel(d: DayPlan): string {
  const [y, mo, day] = d.dateIso.split("-").map(Number);
  const date = new Date(y, mo - 1, day);
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function relocateTrainingRest(
  week: DayPlan[],
  dragIdx: number,
  dropIdx: number
): DayPlan[] {
  if (dragIdx === dropIdx) return week;
  const drag = week[dragIdx];
  const drop = week[dropIdx];
  if (drag.isTrainingDay === drop.isTrainingDay) return week;

  const next = week.map((w) => ({ ...w, exercises: [...w.exercises] }));

  if (drag.isTrainingDay && !drop.isTrainingDay) {
    next[dropIdx] = {
      ...drop,
      isTrainingDay: true,
      exercises: [...drag.exercises],
    };
    next[dragIdx] = {
      ...drag,
      isTrainingDay: false,
      exercises: [],
    };
  } else {
    next[dragIdx] = {
      ...drag,
      isTrainingDay: true,
      exercises: [...drop.exercises],
    };
    next[dropIdx] = {
      ...drop,
      isTrainingDay: false,
      exercises: [],
    };
  }

  return next;
}

type Props = {
  initialWeek: DayPlan[];
  adaptiveLevel: AdaptiveLevel;
  displayLevel: string;
  isReturnWorkout: boolean;
  explanation: string;
};

export default function DashboardInteractive({
  initialWeek,
  adaptiveLevel,
  displayLevel,
  isReturnWorkout,
  explanation,
}: Props) {
  const todayIso = useMemo(() => localTodayIso(), []);

  const [week, setWeek] = useState<DayPlan[]>(() =>
    initialWeek.map((d) => ({
      ...d,
      exercises: d.exercises.map((ex) => ({ ...ex })),
    }))
  );

  const initialSelected = useMemo(() => {
    const idx = initialWeek.findIndex((d) => d.dateIso === todayIso);
    return idx >= 0 ? idx : 0;
  }, [initialWeek, todayIso]);

  const [selectedIndex, setSelectedIndex] = useState(initialSelected);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const selected = week[selectedIndex] ?? week[0];
  const isViewingCalendarToday = selected.dateIso === todayIso;

  const showFeedback =
    isViewingCalendarToday &&
    selected.isTrainingDay &&
    selected.exercises.length > 0;

  const handleDrop = useCallback(
    (dropIdx: number, e: React.DragEvent) => {
      e.preventDefault();
      const raw = e.dataTransfer.getData("text/plain");
      const dragIdx = Number.parseInt(raw, 10);
      setDragIndex(null);
      if (Number.isNaN(dragIdx)) return;
      setWeek((prev) => relocateTrainingRest(prev, dragIdx, dropIdx));
    },
    []
  );

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md lg:col-span-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-cyan-200/90">
            Current adaptive level
          </p>
          <p className="mt-2 text-3xl font-bold">{displayLevel}</p>
          {isReturnWorkout && (
            <p className="mt-3 rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
              Return mode: your session can run lighter while you rebuild
              consistency.
            </p>
          )}
          <div className="mt-6 border-t border-white/10 pt-4 text-sm text-white/75">
            <p className="font-semibold text-white/90">Why this plan</p>
            <p className="mt-2 whitespace-pre-line leading-relaxed">
              {explanation}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-semibold">
              {isViewingCalendarToday ? "Today" : selected.label}
            </h2>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
              {pillDateLabel(selected)}
            </span>
          </div>

          {!selected.isTrainingDay && (
            <p className="mt-6 text-sm text-white/70">
              Rest day — no session scheduled for this date in your current week
              layout.
            </p>
          )}

          {selected.isTrainingDay && selected.exercises.length === 0 && (
            <p className="mt-4 text-sm text-white/75">
              No exercises matched your filters. Loosen exercise types or low
              impact settings in onboarding.
            </p>
          )}

          <div className="mt-4 space-y-4">
            {selected.isTrainingDay &&
              selected.exercises.map((ex) => (
                <div
                  key={ex.id}
                  className="rounded-xl border border-white/10 bg-[#07142f]/50 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-cyan-100">
                        {ex.type}
                      </p>
                      <p className="text-base font-semibold">{ex.name}</p>
                      <p className="mt-1 text-xs text-white/70">
                        {ex.sets} sets · {ex.repsDisplay} reps · ~{ex.minutes} min
                      </p>
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] uppercase tracking-wide text-white/60">
                      {ex.level}
                    </span>
                  </div>
                  {ex.video && (
                    <video
                      controls
                      preload="metadata"
                      className="mt-3 aspect-video w-full max-w-md rounded-md border border-white/10 bg-black/40"
                    >
                      <source src={ex.video} type="video/mp4" />
                    </video>
                  )}
                </div>
              ))}
          </div>

          <WorkoutFeedback
            adaptiveLevel={adaptiveLevel}
            showForm={showFeedback}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
        <h2 className="text-xl font-semibold">This week</h2>
        <p className="mt-1 text-sm text-white/70">
          Click a day&apos;s <span className="text-white/90">title (date line)</span>{" "}
          to load that program. Drag the <span className="text-cyan-200">block</span>{" "}
          below it onto another day&apos;s block to swap a{" "}
          <span className="text-cyan-200">training</span> session with a{" "}
          <span className="text-white/90">rest</span> day. Use the chips below to
          jump days too.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {week.map((d, idx) => {
            const isDragging = dragIndex === idx;
            const isSwapTarget =
              dragIndex !== null &&
              dragIndex !== idx &&
              week[dragIndex].isTrainingDay !== d.isTrainingDay;

            const outerRing = isSwapTarget
              ? "border-cyan-400/80 bg-cyan-500/25 shadow-lg shadow-cyan-500/30 ring-2 ring-cyan-300/70"
              : "border-white/10";

            const outerDragGlow = isDragging
              ? "ring-2 ring-amber-300/90 border-amber-400/80 bg-amber-500/20 shadow-lg shadow-amber-400/25"
              : "";

            return (
              <div
                key={d.dateIso}
                onDragOver={(e) => {
                  if (
                    dragIndex !== null &&
                    dragIndex !== idx &&
                    week[dragIndex].isTrainingDay !== d.isTrainingDay
                  ) {
                    e.preventDefault();
                  }
                }}
                onDrop={(e) => handleDrop(idx, e)}
                className={`overflow-hidden rounded-xl border bg-[#07142f]/50 transition ${outerRing} ${outerDragGlow}`}
              >
                <button
                  type="button"
                  onClick={() => setSelectedIndex(idx)}
                  className="w-full px-4 pt-4 pb-3 text-left transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
                >
                  <span className="block text-sm font-semibold text-white">
                    {d.label}
                  </span>
                </button>
                <div
                  draggable
                  title="Drag onto another day to move this workout"
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/plain", String(idx));
                    e.dataTransfer.effectAllowed = "move";
                    setDragIndex(idx);
                  }}
                  onDragEnd={() => setDragIndex(null)}
                  className={`cursor-grab select-none border-t border-white/10 px-4 pb-4 pt-3 active:cursor-grabbing ${
                    isDragging
                      ? "border-t-cyan-300/80 bg-cyan-500/40 shadow-[inset_0_0_32px_rgba(34,211,238,0.35)]"
                      : "bg-[#050d1a]/90"
                  }`}
                >
                  <p className="text-xs text-white/55 capitalize">{d.weekdayKey}</p>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-cyan-100">
                    {d.isTrainingDay ? "Training" : "Rest"}
                  </p>
                  {d.isTrainingDay && (
                    <ul className="mt-2 space-y-1 text-xs text-white/80">
                      {d.exercises.map((ex) => (
                        <li key={ex.id}>• {ex.name}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 border-t border-white/10 pt-6">
          <p className="text-sm font-medium text-white/85">View program for</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {week.map((d, idx) => {
              const active = idx === selectedIndex;
              return (
                <button
                  key={d.dateIso}
                  type="button"
                  onClick={() => setSelectedIndex(idx)}
                  className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                    active
                      ? "border-cyan-300/60 bg-cyan-500/25 text-cyan-50"
                      : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                  }`}
                >
                  {chipLabel(d)}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
