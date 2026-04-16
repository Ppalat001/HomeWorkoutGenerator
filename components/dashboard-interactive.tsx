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
          Drag a <span className="text-cyan-200">training</span> day onto a{" "}
          <span className="text-white/90">rest</span> day to move that workout
          when your schedule shifts. Pick a day below to preview its program.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {week.map((d, idx) => {
            const isDragging = dragIndex === idx;
            const isSwapTarget =
              dragIndex !== null &&
              dragIndex !== idx &&
              week[dragIndex].isTrainingDay !== d.isTrainingDay;

            return (
              <div
                key={d.dateIso}
                draggable={canDrag}
                onDragStart={(e) => {
                  e.dataTransfer.setData("text/plain", String(idx));
                  e.dataTransfer.effectAllowed = "move";
                  setDragIndex(idx);
                }}
                onDragEnd={() => setDragIndex(null)}
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
                className={`rounded-xl border bg-[#07142f]/40 p-4 transition ${
                  isDragging
                    ? "border-cyan-400/50 opacity-70"
                    : isSwapTarget
                      ? "border-cyan-300/40 ring-1 ring-cyan-400/30"
                      : "border-white/10"
                } cursor-grab active:cursor-grabbing`}
              >
                <p className="text-sm font-semibold">{d.label}</p>
                <p className="mt-1 text-xs text-white/60 capitalize">
                  {d.weekdayKey}
                </p>
                <p className="mt-3 text-xs font-medium uppercase tracking-wide text-cyan-200/80">
                  {d.isTrainingDay ? "Training" : "Rest"}
                </p>
                {d.isTrainingDay && (
                  <ul className="mt-2 space-y-1 text-xs text-white/75">
                    {d.exercises.map((ex) => (
                      <li key={ex.id}>• {ex.name}</li>
                    ))}
                  </ul>
                )}
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
