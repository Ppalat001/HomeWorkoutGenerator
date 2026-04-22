"use client";

import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import type { ConsistencyPlan, DayPlan } from "@/lib/generate-workout";
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
  consistency: ConsistencyPlan;
  adaptiveLevel: AdaptiveLevel;
  displayLevel: string;
  isReturnWorkout: boolean;
  explanation: string;
};

const LEVEL_OPTIONS: { value: AdaptiveLevel; label: string }[] = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "expert", label: "Expert" },
];

export default function DashboardInteractive({
  initialWeek,
  consistency,
  adaptiveLevel,
  displayLevel,
  isReturnWorkout,
  explanation,
}: Props) {
  const router = useRouter();
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
  const [level, setLevel] = useState<AdaptiveLevel>(adaptiveLevel);
  const [isUpdatingLevel, setIsUpdatingLevel] = useState(false);
  const [isUpdatingSessions, setIsUpdatingSessions] = useState(false);
  const [levelError, setLevelError] = useState("");
  const [sessionsError, setSessionsError] = useState("");
  const [sessionsMessage, setSessionsMessage] = useState("");
  const [promptEveryDays, setPromptEveryDays] = useState(
    consistency.sessionIncreasePromptEveryDays
  );
  const [levelPromptEveryDays, setLevelPromptEveryDays] = useState(
    consistency.levelIncreasePromptEveryDays
  );
  const [isSavingReminderSettings, setIsSavingReminderSettings] = useState(false);
  const [isUpdatingLevelPrompt, setIsUpdatingLevelPrompt] = useState(false);
  const [isSavingLevelReminderSettings, setIsSavingLevelReminderSettings] =
    useState(false);
  const [levelPromptError, setLevelPromptError] = useState("");
  const [levelPromptMessage, setLevelPromptMessage] = useState("");
  const [rescheduleMessage, setRescheduleMessage] = useState("");
  const pendingScrollRestore = useRef<number | null>(null);
  useEffect(() => {
    setLevel(adaptiveLevel);
    setLevelError("");
  }, [adaptiveLevel]);
  useEffect(() => {
    setWeek(
      initialWeek.map((d) => ({
        ...d,
        exercises: d.exercises.map((ex) => ({ ...ex })),
      }))
    );
  }, [initialWeek]);
  useEffect(() => {
    setPromptEveryDays(consistency.sessionIncreasePromptEveryDays);
  }, [consistency.sessionIncreasePromptEveryDays]);
  useEffect(() => {
    setLevelPromptEveryDays(consistency.levelIncreasePromptEveryDays);
  }, [consistency.levelIncreasePromptEveryDays]);

  const selectDay = useCallback((idx: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof window !== "undefined") {
      pendingScrollRestore.current = window.scrollY;
    }
    setSelectedIndex(idx);
  }, []);

  useLayoutEffect(() => {
    const y = pendingScrollRestore.current;
    if (y != null) {
      window.scrollTo(0, y);
      pendingScrollRestore.current = null;
    }
  }, [selectedIndex]);

  const selected = week[selectedIndex] ?? week[0];
  const isViewingCalendarToday = selected.dateIso === todayIso;

  const showFeedback =
    isViewingCalendarToday &&
    selected.isTrainingDay &&
    selected.exercises.length > 0;
  const levelLabel =
    LEVEL_OPTIONS.find((option) => option.value === level)?.label ?? displayLevel;

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

  const handleLevelChange = useCallback(
    async (nextLevel: AdaptiveLevel) => {
      if (nextLevel === level || isUpdatingLevel) return;
      const prevLevel = level;
      setLevel(nextLevel);
      setIsUpdatingLevel(true);
      setLevelError("");

      try {
        const res = await fetch("/api/preferences", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fitnessLevel: nextLevel }),
        });

        const data = await res.json();
        if (!res.ok) {
          setLevel(prevLevel);
          setLevelError(data.error || "Could not update level");
          return;
        }

        router.refresh();
      } catch {
        setLevel(prevLevel);
        setLevelError("Could not update level");
      } finally {
        setIsUpdatingLevel(false);
      }
    },
    [isUpdatingLevel, level, router]
  );

  const applySuggestedSwap = useCallback(() => {
    const suggestion = consistency.suggestedSwap;
    if (!suggestion) return;
    const fromIdx = week.findIndex((d) => d.dateIso === suggestion.fromDateIso);
    const toIdx = week.findIndex((d) => d.dateIso === suggestion.toDateIso);
    if (fromIdx < 0 || toIdx < 0) return;
    setWeek((prev) => relocateTrainingRest(prev, fromIdx, toIdx));
    setSelectedIndex(toIdx);
    setRescheduleMessage("Workout moved. Keep your consistency streak going.");
  }, [consistency.suggestedSwap, week]);

  const handleSessionIncreaseRequest = useCallback(async () => {
    if (!consistency.suggestedTrainingDaysPerWeek || isUpdatingSessions) return;
    setIsUpdatingSessions(true);
    setSessionsError("");
    setSessionsMessage("");
    try {
      const res = await fetch("/api/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          manualTrainingDaysPerWeek: consistency.suggestedTrainingDaysPerWeek,
          sessionIncreasePromptNextAt: null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSessionsError(data.error || "Could not update weekly sessions");
        return;
      }
      setSessionsMessage("Weekly sessions increased. Your plan has been refreshed.");
      router.refresh();
    } catch {
      setSessionsError("Could not update weekly sessions");
    } finally {
      setIsUpdatingSessions(false);
    }
  }, [consistency.suggestedTrainingDaysPerWeek, isUpdatingSessions, router]);

  const postponeSessionIncreasePrompt = useCallback(async () => {
    if (isUpdatingSessions) return;
    setIsUpdatingSessions(true);
    setSessionsError("");
    setSessionsMessage("");
    const nextAt = new Date();
    nextAt.setDate(nextAt.getDate() + promptEveryDays);
    try {
      const res = await fetch("/api/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionIncreasePromptEveryDays: promptEveryDays,
          sessionIncreasePromptNever: false,
          sessionIncreasePromptNextAt: nextAt.toISOString(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSessionsError(data.error || "Could not update reminder timing");
        return;
      }
      setSessionsMessage(`Okay, I will remind you again in ${promptEveryDays} days.`);
      router.refresh();
    } catch {
      setSessionsError("Could not update reminder timing");
    } finally {
      setIsUpdatingSessions(false);
    }
  }, [isUpdatingSessions, promptEveryDays, router]);

  const disableSessionIncreasePrompt = useCallback(async () => {
    if (isUpdatingSessions) return;
    setIsUpdatingSessions(true);
    setSessionsError("");
    setSessionsMessage("");
    try {
      const res = await fetch("/api/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionIncreasePromptNever: true,
          sessionIncreasePromptNextAt: null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSessionsError(data.error || "Could not disable reminders");
        return;
      }
      setSessionsMessage("Session increase reminders are turned off.");
      router.refresh();
    } catch {
      setSessionsError("Could not disable reminders");
    } finally {
      setIsUpdatingSessions(false);
    }
  }, [isUpdatingSessions, router]);

  const restoreSessionIncreasePrompt = useCallback(async () => {
    if (isUpdatingSessions) return;
    setIsUpdatingSessions(true);
    setSessionsError("");
    setSessionsMessage("");
    try {
      const res = await fetch("/api/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionIncreasePromptNever: false,
          sessionIncreasePromptNextAt: new Date().toISOString(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSessionsError(data.error || "Could not re-enable reminders");
        return;
      }
      setSessionsMessage("Session increase reminders are on again.");
      router.refresh();
    } catch {
      setSessionsError("Could not re-enable reminders");
    } finally {
      setIsUpdatingSessions(false);
    }
  }, [isUpdatingSessions, router]);

  const saveReminderCadence = useCallback(async () => {
    if (isSavingReminderSettings) return;
    setIsSavingReminderSettings(true);
    setSessionsError("");
    setSessionsMessage("");
    try {
      const res = await fetch("/api/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionIncreasePromptEveryDays: promptEveryDays,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSessionsError(data.error || "Could not save reminder cadence");
        return;
      }
      setSessionsMessage(`Reminder cadence saved: every ${promptEveryDays} days.`);
      router.refresh();
    } catch {
      setSessionsError("Could not save reminder cadence");
    } finally {
      setIsSavingReminderSettings(false);
    }
  }, [isSavingReminderSettings, promptEveryDays, router]);

  const showSessionIncreasePromptNow = useCallback(async () => {
    if (isSavingReminderSettings) return;
    setIsSavingReminderSettings(true);
    setSessionsError("");
    setSessionsMessage("");
    try {
      const res = await fetch("/api/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionIncreasePromptNever: false,
          sessionIncreasePromptNextAt: new Date().toISOString(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSessionsError(data.error || "Could not show prompt now");
        return;
      }
      setSessionsMessage("Prompt is available again now.");
      router.refresh();
    } catch {
      setSessionsError("Could not show prompt now");
    } finally {
      setIsSavingReminderSettings(false);
    }
  }, [isSavingReminderSettings, router]);

  const decreaseSessionsByOne = useCallback(async () => {
    if (isSavingReminderSettings) return;
    const next = Math.max(2, consistency.baseTrainingDaysPerWeek - 1);
    if (next === consistency.baseTrainingDaysPerWeek) return;
    setIsSavingReminderSettings(true);
    setSessionsError("");
    setSessionsMessage("");
    try {
      const res = await fetch("/api/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          manualTrainingDaysPerWeek: next,
          sessionIncreasePromptNextAt: null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSessionsError(data.error || "Could not decrease weekly sessions");
        return;
      }
      setSessionsMessage(`Weekly sessions decreased to ${next}.`);
      router.refresh();
    } catch {
      setSessionsError("Could not decrease weekly sessions");
    } finally {
      setIsSavingReminderSettings(false);
    }
  }, [consistency.baseTrainingDaysPerWeek, isSavingReminderSettings, router]);

  const suggestedLevelIncreaseLabel = useMemo(() => {
    const v = consistency.suggestedLevelIncrease;
    if (!v) return "";
    return LEVEL_OPTIONS.find((o) => o.value === v)?.label ?? v;
  }, [consistency.suggestedLevelIncrease]);

  const handleLevelIncreaseAccept = useCallback(async () => {
    const next = consistency.suggestedLevelIncrease;
    if (!next || isUpdatingLevelPrompt || isUpdatingLevel) return;
    const prevLevel = level;
    setLevel(next);
    setIsUpdatingLevelPrompt(true);
    setLevelPromptError("");
    setLevelPromptMessage("");
    try {
      const res = await fetch("/api/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fitnessLevel: next,
          levelIncreasePromptNextAt: null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLevel(prevLevel);
        setLevelPromptError(data.error || "Could not update level");
        return;
      }
      setLevelPromptMessage(`Level updated to ${suggestedLevelIncreaseLabel}.`);
      router.refresh();
    } catch {
      setLevel(prevLevel);
      setLevelPromptError("Could not update level");
    } finally {
      setIsUpdatingLevelPrompt(false);
    }
  }, [
    consistency.suggestedLevelIncrease,
    isUpdatingLevel,
    isUpdatingLevelPrompt,
    level,
    router,
    suggestedLevelIncreaseLabel,
  ]);

  const postponeLevelIncreasePrompt = useCallback(async () => {
    if (isUpdatingLevelPrompt) return;
    setIsUpdatingLevelPrompt(true);
    setLevelPromptError("");
    setLevelPromptMessage("");
    const nextAt = new Date();
    nextAt.setDate(nextAt.getDate() + levelPromptEveryDays);
    try {
      const res = await fetch("/api/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          levelIncreasePromptEveryDays: levelPromptEveryDays,
          levelIncreasePromptNever: false,
          levelIncreasePromptNextAt: nextAt.toISOString(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLevelPromptError(data.error || "Could not update reminder timing");
        return;
      }
      const cadence =
        levelPromptEveryDays === 1
          ? "1 day"
          : levelPromptEveryDays === 7
            ? "1 week"
            : "1 month";
      setLevelPromptMessage(`Okay — we will ask again in about ${cadence}.`);
      router.refresh();
    } catch {
      setLevelPromptError("Could not update reminder timing");
    } finally {
      setIsUpdatingLevelPrompt(false);
    }
  }, [isUpdatingLevelPrompt, levelPromptEveryDays, router]);

  const disableLevelIncreasePrompt = useCallback(async () => {
    if (isUpdatingLevelPrompt) return;
    setIsUpdatingLevelPrompt(true);
    setLevelPromptError("");
    setLevelPromptMessage("");
    try {
      const res = await fetch("/api/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          levelIncreasePromptNever: true,
          levelIncreasePromptNextAt: null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLevelPromptError(data.error || "Could not disable reminders");
        return;
      }
      setLevelPromptMessage("Level increase reminders are turned off.");
      router.refresh();
    } catch {
      setLevelPromptError("Could not disable reminders");
    } finally {
      setIsUpdatingLevelPrompt(false);
    }
  }, [isUpdatingLevelPrompt, router]);

  const restoreLevelIncreasePrompt = useCallback(async () => {
    if (isUpdatingLevelPrompt) return;
    setIsUpdatingLevelPrompt(true);
    setLevelPromptError("");
    setLevelPromptMessage("");
    try {
      const res = await fetch("/api/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          levelIncreasePromptNever: false,
          levelIncreasePromptNextAt: new Date().toISOString(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLevelPromptError(data.error || "Could not re-enable reminders");
        return;
      }
      setLevelPromptMessage("Level increase reminders are on again.");
      router.refresh();
    } catch {
      setLevelPromptError("Could not re-enable reminders");
    } finally {
      setIsUpdatingLevelPrompt(false);
    }
  }, [isUpdatingLevelPrompt, router]);

  const saveLevelReminderCadence = useCallback(async () => {
    if (isSavingLevelReminderSettings) return;
    setIsSavingLevelReminderSettings(true);
    setLevelPromptError("");
    setLevelPromptMessage("");
    try {
      const res = await fetch("/api/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          levelIncreasePromptEveryDays: levelPromptEveryDays,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLevelPromptError(data.error || "Could not save reminder cadence");
        return;
      }
      setLevelPromptMessage("Level reminder cadence saved.");
      router.refresh();
    } catch {
      setLevelPromptError("Could not save reminder cadence");
    } finally {
      setIsSavingLevelReminderSettings(false);
    }
  }, [isSavingLevelReminderSettings, levelPromptEveryDays, router]);

  const showLevelIncreasePromptNow = useCallback(async () => {
    if (isSavingLevelReminderSettings) return;
    setIsSavingLevelReminderSettings(true);
    setLevelPromptError("");
    setLevelPromptMessage("");
    try {
      const res = await fetch("/api/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          levelIncreasePromptNever: false,
          levelIncreasePromptNextAt: new Date().toISOString(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLevelPromptError(data.error || "Could not show prompt now");
        return;
      }
      setLevelPromptMessage("Level prompt is available again now.");
      router.refresh();
    } catch {
      setLevelPromptError("Could not show prompt now");
    } finally {
      setIsSavingLevelReminderSettings(false);
    }
  }, [isSavingLevelReminderSettings, router]);

  const resetSessionsToOnboarding = useCallback(async () => {
    if (isSavingReminderSettings) return;
    setIsSavingReminderSettings(true);
    setSessionsError("");
    setSessionsMessage("");
    try {
      const res = await fetch("/api/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          manualTrainingDaysPerWeek: consistency.onboardingTrainingDaysPerWeek,
          sessionIncreasePromptNextAt: null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSessionsError(data.error || "Could not reset weekly sessions");
        return;
      }
      setSessionsMessage(
        `Weekly sessions reset to your onboarding value (${consistency.onboardingTrainingDaysPerWeek}).`
      );
      router.refresh();
    } catch {
      setSessionsError("Could not reset weekly sessions");
    } finally {
      setIsSavingReminderSettings(false);
    }
  }, [
    consistency.onboardingTrainingDaysPerWeek,
    isSavingReminderSettings,
    router,
  ]);

  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-cyan-200/90">
                Consistency goal
              </p>
              <p className="mt-2 text-2xl font-bold">
                {consistency.completedThisWeek} / {consistency.weeklyTarget} workouts
              </p>
              <p className="mt-2 text-sm text-white/75">{consistency.reminder}</p>
              {consistency.hasFourWeeksWorkoutHistory && (
                <>
              {consistency.showSessionIncreasePrompt &&
                consistency.suggestedTrainingDaysPerWeek && (
                  <div className="mt-3 rounded-xl border border-emerald-300/30 bg-emerald-500/10 p-3">
                    <p className="text-xs text-emerald-100">
                      You have completed over 90% of sessions for 4 consecutive
                      weeks. Increase weekly sessions from{" "}
                      {consistency.baseTrainingDaysPerWeek} to{" "}
                      {consistency.suggestedTrainingDaysPerWeek}?
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSessionIncreaseRequest}
                        disabled={isUpdatingSessions}
                        className="rounded-lg border border-emerald-300/50 bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-50 transition hover:bg-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {isUpdatingSessions ? "Updating..." : "Yes, increase sessions"}
                      </button>
                      <select
                        value={promptEveryDays}
                        disabled={isUpdatingSessions}
                        onChange={(e) => setPromptEveryDays(Number(e.target.value))}
                        className="rounded-lg border border-white/20 bg-[#0b1535] px-2 py-1.5 text-xs text-slate-100 outline-none [color-scheme:dark]"
                      >
                        <option value={7}>Remind every 7 days</option>
                        <option value={14}>Remind every 14 days</option>
                        <option value={30}>Remind every 30 days</option>
                      </select>
                      <button
                        type="button"
                        onClick={postponeSessionIncreasePrompt}
                        disabled={isUpdatingSessions}
                        className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90 transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        Remind me later
                      </button>
                      <button
                        type="button"
                        onClick={disableSessionIncreasePrompt}
                        disabled={isUpdatingSessions}
                        className="rounded-lg border border-white/20 bg-transparent px-3 py-1.5 text-xs font-semibold text-white/80 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        Never show again
                      </button>
                    </div>
                  </div>
                )}
              {consistency.canRequestSessionIncrease &&
                consistency.sessionIncreasePromptNever && (
                  <div className="mt-3 rounded-xl border border-white/15 bg-white/5 p-3">
                    <p className="text-xs text-white/75">
                      Session increase reminders are off.
                    </p>
                    <button
                      type="button"
                      onClick={restoreSessionIncreasePrompt}
                      disabled={isUpdatingSessions}
                      className="mt-2 rounded-lg border border-cyan-300/40 bg-cyan-500/15 px-3 py-1.5 text-xs font-semibold text-cyan-50 transition hover:bg-cyan-500/25 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      Turn reminders back on
                    </button>
                  </div>
                )}
              {sessionsError && (
                <p className="mt-2 text-xs text-red-200">{sessionsError}</p>
              )}
              {sessionsMessage && (
                <p className="mt-2 text-xs text-emerald-200">{sessionsMessage}</p>
              )}
              <div className="mt-3 rounded-xl border border-white/15 bg-white/5 p-3">
                <p className="text-xs text-white/75">
                  Session increase reminder settings
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <select
                    value={promptEveryDays}
                    disabled={isSavingReminderSettings}
                    onChange={(e) => setPromptEveryDays(Number(e.target.value))}
                    className="rounded-lg border border-white/20 bg-[#0b1535] px-2 py-1.5 text-xs text-slate-100 outline-none [color-scheme:dark]"
                  >
                    <option value={7}>Every 7 days</option>
                    <option value={14}>Every 14 days</option>
                    <option value={30}>Every 30 days</option>
                  </select>
                  <button
                    type="button"
                    onClick={saveReminderCadence}
                    disabled={isSavingReminderSettings}
                    className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90 transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSavingReminderSettings ? "Saving..." : "Save cadence"}
                  </button>
                  <button
                    type="button"
                    onClick={showSessionIncreasePromptNow}
                    disabled={isSavingReminderSettings}
                    className="rounded-lg border border-cyan-300/40 bg-cyan-500/15 px-3 py-1.5 text-xs font-semibold text-cyan-50 transition hover:bg-cyan-500/25 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    Show prompt now
                  </button>
                  <button
                    type="button"
                    onClick={decreaseSessionsByOne}
                    disabled={isSavingReminderSettings || consistency.baseTrainingDaysPerWeek <= 2}
                    className="rounded-lg border border-amber-300/40 bg-amber-500/15 px-3 py-1.5 text-xs font-semibold text-amber-50 transition hover:bg-amber-500/25 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Decrease by 1
                  </button>
                  {consistency.hasManualTrainingDaysOverride &&
                    consistency.baseTrainingDaysPerWeek !==
                      consistency.onboardingTrainingDaysPerWeek && (
                      <button
                        type="button"
                        onClick={resetSessionsToOnboarding}
                        disabled={isSavingReminderSettings}
                        className="rounded-lg border border-white/20 bg-transparent px-3 py-1.5 text-xs font-semibold text-white/80 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Reset to onboarding ({consistency.onboardingTrainingDaysPerWeek})
                      </button>
                    )}
                </div>
              </div>
                </>
              )}
            </div>
            <div className="rounded-xl border border-white/10 bg-[#07142f]/50 px-4 py-3 text-right">
              <p className="text-xs uppercase tracking-wide text-white/55">Current streak</p>
              <p className="text-xl font-semibold">{consistency.streakCount}</p>
            </div>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
            <div
              className={`h-full ${
                consistency.atRisk ? "bg-amber-400" : "bg-cyan-400"
              }`}
              style={{
                width: `${Math.min(100, Math.round(consistency.completionRate * 100))}%`,
              }}
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {consistency.dayStatuses.map((day) => {
              const tone =
                day.status === "completed"
                  ? "border-emerald-300/50 bg-emerald-500/25 text-emerald-100"
                  : day.status === "skipped"
                    ? "border-rose-300/50 bg-rose-500/25 text-rose-100"
                    : day.status === "planned"
                      ? "border-cyan-300/50 bg-cyan-500/20 text-cyan-100"
                      : "border-white/10 bg-white/5 text-white/55";
              return (
                <span
                  key={day.dateIso}
                  className={`rounded-lg border px-2 py-1 text-[11px] font-semibold uppercase tracking-wide ${tone}`}
                  title={day.dateIso}
                >
                  {day.weekdayKey.slice(0, 3)} · {day.status}
                </span>
              );
            })}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
          <p className="text-xs font-semibold uppercase tracking-wide text-cyan-200/90">
            Adaptive duration
          </p>
          <p className="mt-2 text-3xl font-bold">
            {consistency.suggestedDurationMinutes} min
          </p>
          <p className="mt-2 text-sm text-white/75">
            {consistency.durationDeltaMinutes === 0
              ? "Session length stays stable this week."
              : consistency.durationDeltaMinutes > 0
                ? `Increased by ${consistency.durationDeltaMinutes} min for progress momentum.`
                : `Reduced by ${Math.abs(consistency.durationDeltaMinutes)} min to rebuild adherence.`}
          </p>
          {consistency.suggestedSwap && (
            <button
              type="button"
              onClick={applySuggestedSwap}
              className="mt-4 rounded-xl border border-cyan-300/50 bg-cyan-500/20 px-3 py-2 text-xs font-semibold text-cyan-50 transition hover:bg-cyan-500/30"
            >
              Move skipped workout to suggested rest day
            </button>
          )}
          {rescheduleMessage && (
            <p className="mt-3 text-xs text-emerald-200">{rescheduleMessage}</p>
          )}
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md lg:col-span-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-cyan-200/90">
            Current adaptive level
          </p>
          <p className="mt-2 text-3xl font-bold">{levelLabel}</p>
          <div className="mt-4">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/70">
              Change level
            </label>
            <select
              value={level}
              disabled={isUpdatingLevel}
              onChange={(e) => handleLevelChange(e.target.value as AdaptiveLevel)}
              className="w-full rounded-xl border border-white/20 bg-[#0b1535] px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-70 [color-scheme:dark]"
            >
              {LEVEL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {isUpdatingLevel && (
              <p className="mt-2 text-xs text-cyan-200">Updating level...</p>
            )}
            {levelError && (
              <p className="mt-2 text-xs text-red-200">{levelError}</p>
            )}
          </div>

          {consistency.showLevelIncreasePrompt &&
            consistency.suggestedLevelIncrease && (
              <div className="mt-4 rounded-xl border border-violet-300/35 bg-violet-500/10 p-3">
                <p className="text-xs text-violet-100">
                  You have completed at least 85% of planned sessions for 6
                  consecutive weeks. Increase difficulty from{" "}
                  <span className="font-semibold text-white">{levelLabel}</span>{" "}
                  to{" "}
                  <span className="font-semibold text-white">
                    {suggestedLevelIncreaseLabel}
                  </span>
                  , or keep your current level?
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleLevelIncreaseAccept}
                    disabled={isUpdatingLevelPrompt}
                    className="rounded-lg border border-violet-300/50 bg-violet-500/25 px-3 py-1.5 text-xs font-semibold text-violet-50 transition hover:bg-violet-500/35 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isUpdatingLevelPrompt ? "Updating..." : `Yes, go to ${suggestedLevelIncreaseLabel}`}
                  </button>
                  <select
                    value={levelPromptEveryDays}
                    disabled={isUpdatingLevelPrompt}
                    onChange={(e) =>
                      setLevelPromptEveryDays(Number(e.target.value))
                    }
                    className="rounded-lg border border-white/20 bg-[#0b1535] px-2 py-1.5 text-xs text-slate-100 outline-none [color-scheme:dark]"
                  >
                    <option value={1}>Remind every day</option>
                    <option value={7}>Remind every week</option>
                    <option value={30}>Remind every month</option>
                  </select>
                  <button
                    type="button"
                    onClick={postponeLevelIncreasePrompt}
                    disabled={isUpdatingLevelPrompt}
                    className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90 transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    Stay on {levelLabel} — remind me later
                  </button>
                  <button
                    type="button"
                    onClick={disableLevelIncreasePrompt}
                    disabled={isUpdatingLevelPrompt}
                    className="rounded-lg border border-white/20 bg-transparent px-3 py-1.5 text-xs font-semibold text-white/80 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    Never show again
                  </button>
                </div>
              </div>
            )}

          {consistency.canSuggestLevelIncrease &&
            consistency.levelIncreasePromptNever && (
              <div className="mt-4 rounded-xl border border-white/15 bg-white/5 p-3">
                <p className="text-xs text-white/75">
                  Level increase reminders are off. You can turn them back on if
                  you change your mind.
                </p>
                <button
                  type="button"
                  onClick={restoreLevelIncreasePrompt}
                  disabled={isUpdatingLevelPrompt}
                  className="mt-2 rounded-lg border border-violet-300/40 bg-violet-500/15 px-3 py-1.5 text-xs font-semibold text-violet-50 transition hover:bg-violet-500/25 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Revert choice — show level prompts again
                </button>
              </div>
            )}

          <div className="mt-4 rounded-xl border border-white/15 bg-white/5 p-3">
            <p className="text-xs text-white/75">
              Level increase reminder settings (after a 6-week strong streak)
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <select
                value={levelPromptEveryDays}
                disabled={isSavingLevelReminderSettings}
                onChange={(e) =>
                  setLevelPromptEveryDays(Number(e.target.value))
                }
                className="rounded-lg border border-white/20 bg-[#0b1535] px-2 py-1.5 text-xs text-slate-100 outline-none [color-scheme:dark]"
              >
                <option value={1}>Every day</option>
                <option value={7}>Every week</option>
                <option value={30}>Every month</option>
              </select>
              <button
                type="button"
                onClick={saveLevelReminderCadence}
                disabled={isSavingLevelReminderSettings}
                className="rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90 transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSavingLevelReminderSettings ? "Saving..." : "Save cadence"}
              </button>
              <button
                type="button"
                onClick={showLevelIncreasePromptNow}
                disabled={isSavingLevelReminderSettings}
                className="rounded-lg border border-violet-300/40 bg-violet-500/15 px-3 py-1.5 text-xs font-semibold text-violet-50 transition hover:bg-violet-500/25 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Show level prompt now
              </button>
              <button
                type="button"
                onClick={restoreLevelIncreasePrompt}
                disabled={isSavingLevelReminderSettings || isUpdatingLevelPrompt}
                className="rounded-lg border border-white/20 bg-transparent px-3 py-1.5 text-xs font-semibold text-white/80 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Revert &quot;never&quot; / snooze
              </button>
            </div>
          </div>

          {levelPromptError && (
            <p className="mt-2 text-xs text-red-200">{levelPromptError}</p>
          )}
          {levelPromptMessage && (
            <p className="mt-2 text-xs text-emerald-200">{levelPromptMessage}</p>
          )}

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
                  onClick={(e) => selectDay(idx, e)}
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
                  onClick={(e) => selectDay(idx, e)}
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
