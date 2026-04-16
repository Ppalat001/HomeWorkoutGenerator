"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AdaptiveLevel, WorkoutFeedback } from "@/lib/workout-types";

type Props = {
  adaptiveLevel: AdaptiveLevel;
  showForm: boolean;
};

export default function WorkoutFeedback({ adaptiveLevel, showForm }: Props) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<WorkoutFeedback>("ok");
  const [completed, setCompleted] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  if (!showForm) {
    return null;
  }

  async function handleSubmit() {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/workout-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adaptiveLevel,
          completed,
          feedback: completed ? feedback : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not save");
        setLoading(false);
        return;
      }

      setMessage("Saved. Your next plan will use this.");
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-8 rounded-2xl border border-white/10 bg-[#07142f]/60 p-6">
      <h3 className="text-lg font-semibold">After your session</h3>
      <p className="mt-1 text-sm text-white/70">
        Log how it went so difficulty can adapt safely over time.
      </p>

      <div className="mt-4 space-y-4">
        <label className="flex items-center gap-3 text-sm text-white/85">
          <input
            type="checkbox"
            checked={completed}
            onChange={(e) => setCompleted(e.target.checked)}
            className="h-4 w-4 rounded border-white/20"
          />
          I completed this workout
        </label>

        {completed && (
          <div>
            <p className="mb-2 text-sm font-medium text-white/85">
              How did it feel?
            </p>
            <div className="flex flex-wrap gap-2">
              {(["easy", "ok", "hard"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFeedback(f)}
                  className={`rounded-lg border px-3 py-2 text-xs font-semibold capitalize transition ${
                    feedback === f
                      ? "border-cyan-300/60 bg-cyan-500/25 text-cyan-50"
                      : "border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        )}
        {message && (
          <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
            {message}
          </div>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save workout log"}
        </button>
      </div>
    </div>
  );
}
