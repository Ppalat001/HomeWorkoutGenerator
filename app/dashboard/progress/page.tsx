import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import ProgressScreen from "@/components/progress-screen";
import LogoutButton from "@/components/logout-button";
import { buildProgressDashboardPayload } from "@/lib/dashboard-progress";
import { getUserPreferences } from "@/lib/preferences";
import { getWorkoutHistory } from "@/lib/workout-history";

export default async function DashboardProgressPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const preferences = await getUserPreferences(session.user.id);
  if (!preferences) {
    redirect("/onboarding");
  }

  const history = await getWorkoutHistory(session.user.id);
  const payload = buildProgressDashboardPayload(preferences, history);

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#020617] via-[#0b1b4d] to-[#152a68] text-white">
      <header className="border-b border-white/10 bg-[#07142f]/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-white/70">Dashboard</p>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              Show progress
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard"
              className="rounded-xl border border-cyan-400/45 bg-cyan-500/15 px-4 py-2 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-500/25"
            >
              Back to plan
            </Link>
            <Link
              href="/dashboard/history"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/85 transition hover:bg-white/10"
            >
              Past sessions
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
        <div className="relative z-10 mx-auto max-w-7xl">
          <ProgressScreen payload={payload} />
        </div>
      </section>
    </main>
  );
}
