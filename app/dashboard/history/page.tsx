import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import PastSessionsHeartDisplay from "@/components/past-sessions-heart-display";
import LogoutButton from "@/components/logout-button";
import { buildPastHeartRateDayGroups } from "@/lib/past-heart-rate-sessions";
import { getUserPreferences } from "@/lib/preferences";
import { getWorkoutHistory } from "@/lib/workout-history";

export default async function DashboardHeartHistoryPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (!(await getUserPreferences(session.user.id))) {
    redirect("/onboarding");
  }

  const history = await getWorkoutHistory(session.user.id);
  const days = buildPastHeartRateDayGroups(history);

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#020617] via-[#0b1b4d] to-[#152a68] text-white">
      <header className="border-b border-white/10 bg-[#07142f]/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-white/70">Past training · heart rate</p>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              Logged sessions
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard/history/exercises"
              className="rounded-xl border border-rose-400/40 bg-rose-500/15 px-4 py-2 text-sm font-semibold text-rose-50 transition hover:bg-rose-500/25"
            >
              Which exercises had high HR?
            </Link>
            <Link
              href="/dashboard"
              className="rounded-xl border border-cyan-400/40 bg-cyan-500/15 px-4 py-2 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-500/25"
            >
              Back to plan
            </Link>
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
        <div className="relative z-10 mx-auto max-w-7xl space-y-6">
          <p className="max-w-3xl text-sm text-white/75">
            Only <strong className="text-white/90">past</strong> days (before today, your
            local date) with stored per-exercise heart rate appear here. Planned or future
            workouts are not listed.
          </p>
          <p className="max-w-3xl text-xs text-white/55">
            <span className="font-semibold text-rose-200/90">High strain</span> marks
            sessions where BPM stayed very high for much of the trace or hit a critical
            peak (see <code className="rounded bg-white/10 px-1">lib/heart-rate-strain.ts</code>
            ).
          </p>
          <PastSessionsHeartDisplay days={days} />
        </div>
      </section>
    </main>
  );
}
