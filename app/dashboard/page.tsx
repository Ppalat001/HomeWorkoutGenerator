import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import LogoutButton from "@/components/logout-button";
import WorkoutFeedback from "@/components/workout-feedback";
import { generateWorkout } from "@/lib/generate-workout";
import { getUserPreferences } from "@/lib/preferences";
import { getWorkoutHistory } from "@/lib/workout-history";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const preferences = await getUserPreferences(session.user.id);
  if (!preferences) {
    redirect("/onboarding");
  }

  const history = await getWorkoutHistory(session.user.id);
  const plan = generateWorkout(preferences, history);

  const showFeedback =
    plan.today.isTrainingDay && plan.today.exercises.length > 0;

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#020617] via-[#0b1b4d] to-[#152a68] text-white">
      <header className="border-b border-white/10 bg-[#07142f]/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-white/70">Adaptive training</p>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              {session.user?.name || session.user?.email}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/85 transition hover:bg-white/10"
            >
              Home
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      <section className="relative px-6 py-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.12),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.14),transparent_30%)]" />
        <div className="relative z-10 mx-auto max-w-7xl space-y-8">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md lg:col-span-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-cyan-200/90">
                Current adaptive level
              </p>
              <p className="mt-2 text-3xl font-bold">{plan.displayLevel}</p>
              {plan.isReturnWorkout && (
                <p className="mt-3 rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
                  Return mode: today&apos;s session is intentionally lighter while
                  you rebuild consistency.
                </p>
              )}
              <div className="mt-6 border-t border-white/10 pt-4 text-sm text-white/75">
                <p className="font-semibold text-white/90">Why this plan</p>
                <p className="mt-2 whitespace-pre-line leading-relaxed">
                  {plan.explanation}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md lg:col-span-2">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-semibold">Today</h2>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                  {plan.today.label}
                </span>
              </div>

              {!plan.today.isTrainingDay && (
                <p className="mt-4 text-sm text-white/75">
                  Scheduled rest day. Your next session is on one of your
                  available training days this week.
                </p>
              )}

              {plan.today.isTrainingDay && plan.today.exercises.length === 0 && (
                <p className="mt-4 text-sm text-white/75">
                  No exercises matched your filters. Loosen exercise types or low
                  impact settings in onboarding.
                </p>
              )}

              <div className="mt-4 space-y-4">
                {plan.today.exercises.map((ex) => (
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
                          {ex.sets} sets · {ex.repsDisplay} reps · ~{ex.minutes}{" "}
                          min
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
                adaptiveLevel={plan.adaptiveLevel}
                showForm={showFeedback}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
            <h2 className="text-xl font-semibold">This week</h2>
            <p className="mt-1 text-sm text-white/70">
              Built from your available days, weekly frequency, and session
              length.
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {plan.week.map((d) => (
                <div
                  key={d.label}
                  className="rounded-xl border border-white/10 bg-[#07142f]/40 p-4"
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
              ))}
            </div>
          </div>

          {preferences.limitations.trim().length > 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/75 backdrop-blur-md">
              <p className="font-semibold text-white">Your notes</p>
              <p className="mt-2">{preferences.limitations}</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
