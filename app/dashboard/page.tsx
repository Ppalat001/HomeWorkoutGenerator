import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import DashboardInteractive from "@/components/dashboard-interactive";
import LogoutButton from "@/components/logout-button";
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
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.12),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.14),transparent_30%)]"
          aria-hidden
        />
        <div className="relative z-10 mx-auto max-w-7xl">
          <DashboardInteractive
            initialWeek={plan.week}
            adaptiveLevel={plan.adaptiveLevel}
            displayLevel={plan.displayLevel}
            isReturnWorkout={plan.isReturnWorkout}
            explanation={plan.explanation}
          />

          {preferences.limitations.trim().length > 0 && (
            <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/75 backdrop-blur-md">
              <p className="font-semibold text-white">Your notes</p>
              <p className="mt-2">{preferences.limitations}</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
