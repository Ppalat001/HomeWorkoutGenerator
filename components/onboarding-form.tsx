"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Dumbbell } from "lucide-react";
import type { AdaptiveLevel } from "@/lib/workout-types";

const DAY_OPTIONS = [
  { key: "monday", label: "Mon" },
  { key: "tuesday", label: "Tue" },
  { key: "wednesday", label: "Wed" },
  { key: "thursday", label: "Thu" },
  { key: "friday", label: "Fri" },
  { key: "saturday", label: "Sat" },
  { key: "sunday", label: "Sun" },
] as const;

const TYPE_OPTIONS = [
  { key: "strength", label: "Strength" },
  { key: "cardio", label: "Cardio" },
  { key: "core", label: "Core" },
  { key: "mobility", label: "Mobility" },
  { key: "flexibility", label: "Flexibility" },
] as const;

export default function OnboardingForm() {
  const router = useRouter();
  const [goal, setGoal] = useState("general_fitness");
  const [fitnessLevel, setFitnessLevel] = useState<AdaptiveLevel>("beginner");
  const [trainingDaysPerWeek, setTrainingDaysPerWeek] = useState(3);
  const [days, setDays] = useState<string[]>(["monday", "wednesday", "friday"]);
  const [workoutDurationMinutes, setWorkoutDurationMinutes] = useState(30);
  const [types, setTypes] = useState<string[]>(["strength", "core"]);
  const [limitations, setLimitations] = useState("");
  const [wantsLowImpact, setWantsLowImpact] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function toggleDay(key: string) {
    setDays((prev) =>
      prev.includes(key) ? prev.filter((d) => d !== key) : [...prev, key]
    );
  }

  function toggleType(key: string) {
    setTypes((prev) =>
      prev.includes(key) ? prev.filter((t) => t !== key) : [...prev, key]
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal,
          fitnessLevel,
          trainingDaysPerWeek,
          preferredTrainingDays: days,
          workoutDurationMinutes,
          preferredExerciseTypes: types,
          limitations,
          wantsLowImpact,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not save");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#020617] via-[#0b1b4d] to-[#152a68] text-white">
      <header className="border-b border-white/10 bg-[#07142f]/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 shadow-lg">
              <Dumbbell className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold tracking-tight">
              Smart Workout
            </span>
          </Link>
        </div>
      </header>

      <section className="relative px-6 py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.12),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.14),transparent_30%)]" />
        <div className="relative z-10 mx-auto max-w-2xl rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-md">
          <h1 className="text-2xl font-bold md:text-3xl">Personalize your plan</h1>
          <p className="mt-2 text-sm text-white/70">
            Answer once. Your dashboard will build adaptive workouts from this
            profile and how you train over time.
          </p>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-medium text-white/85">
                Primary goal
              </label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
              >
                <option value="weight_loss">Weight loss</option>
                <option value="muscle_gain">Muscle gain</option>
                <option value="general_fitness">General fitness</option>
                <option value="flexibility">Flexibility / mobility</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-white/85">
                Current fitness level
              </label>
              <select
                value={fitnessLevel}
                onChange={(e) =>
                  setFitnessLevel(e.target.value as AdaptiveLevel)
                }
                className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="expert">Expert</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-white/85">
                Training days per week ({trainingDaysPerWeek})
              </label>
              <input
                type="range"
                min={2}
                max={5}
                value={trainingDaysPerWeek}
                onChange={(e) =>
                  setTrainingDaysPerWeek(Number(e.target.value))
                }
                className="w-full accent-cyan-400"
              />
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-white/85">
                Available days (pick at least as many as training days)
              </p>
              <div className="flex flex-wrap gap-2">
                {DAY_OPTIONS.map((d) => {
                  const active = days.includes(d.key);
                  return (
                    <button
                      key={d.key}
                      type="button"
                      onClick={() => toggleDay(d.key)}
                      className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                        active
                          ? "border-cyan-300/60 bg-cyan-500/25 text-cyan-50"
                          : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                      }`}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-white/85">
                Typical workout length (minutes)
              </label>
              <select
                value={workoutDurationMinutes}
                onChange={(e) =>
                  setWorkoutDurationMinutes(Number(e.target.value))
                }
                className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
              >
                <option value={15}>15</option>
                <option value={20}>20</option>
                <option value={30}>30</option>
                <option value={45}>45</option>
              </select>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-white/85">
                Preferred exercise types
              </p>
              <div className="flex flex-wrap gap-2">
                {TYPE_OPTIONS.map((t) => {
                  const active = types.includes(t.key);
                  return (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => toggleType(t.key)}
                      className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                        active
                          ? "border-cyan-300/60 bg-cyan-500/25 text-cyan-50"
                          : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                      }`}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-white/85">
                Limitations or notes (optional)
              </label>
              <textarea
                value={limitations}
                onChange={(e) => setLimitations(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-cyan-400"
                placeholder="e.g. sensitive knees, lower back tightness..."
              />
            </div>

            <label className="flex items-center gap-3 text-sm text-white/80">
              <input
                type="checkbox"
                checked={wantsLowImpact}
                onChange={(e) => setWantsLowImpact(e.target.checked)}
                className="h-4 w-4 rounded border-white/20"
              />
              Prefer low-impact sessions (filters jumping and similar work)
            </label>

            {error && (
              <div className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-4 py-3 font-semibold text-white shadow-lg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Saving..." : "Save and open dashboard"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
