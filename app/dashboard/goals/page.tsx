import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import LogoutButton from "@/components/logout-button";
import { goalsContentForLevel, showDashboardGoalsLink } from "@/lib/dashboard-goals";
import { getUserPreferences } from "@/lib/preferences";

export default async function DashboardGoalsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const preferences = await getUserPreferences(session.user.id);
  if (!preferences) {
    redirect("/onboarding");
  }

  if (!showDashboardGoalsLink(preferences.fitnessLevel)) {
    redirect("/dashboard");
  }

  const { tierLabel, bodyGoals, performanceGoals } = goalsContentForLevel(
    preferences.fitnessLevel
  );

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#020617] via-[#0b1b4d] to-[#152a68] text-white">
      <header className="border-b border-white/10 bg-[#07142f]/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-white/70">Dashboard</p>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              Your goals
            </h1>
            <p className="mt-1 text-sm text-white/60">
              Tailored for your <span className="text-emerald-200/90">{tierLabel}</span>{" "}
              program
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard"
              className="rounded-xl border border-cyan-400/45 bg-cyan-500/15 px-4 py-2 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-500/25"
            >
              Back to plan
            </Link>
            <Link
              href="/dashboard/progress"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/85 transition hover:bg-white/10"
            >
              Show progress
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
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(52,211,153,0.1),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.14),transparent_30%)]"
          aria-hidden
        />
        <div className="relative z-10 mx-auto max-w-3xl space-y-8">
          <section className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-6 backdrop-blur-md md:p-8">
            <h2 className="text-lg font-semibold tracking-tight text-emerald-50">
              Body goals
            </h2>
            <p className="mt-1 text-sm text-white/65">
              Composition, posture, and how you feel day to day.
            </p>
            <ul className="mt-5 list-inside list-disc space-y-2.5 text-sm text-white/85 marker:text-emerald-300/90">
              {bodyGoals.map((item) => (
                <li key={item} className="pl-1">
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {performanceGoals && (
            <section className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-6 backdrop-blur-md md:p-8">
              <h2 className="text-lg font-semibold tracking-tight text-amber-50">
                Performance goals
              </h2>
              <p className="mt-1 text-sm text-white/65">
                Measurable strength and endurance targets for advanced training.
              </p>
              <ul className="mt-5 list-inside list-disc space-y-2.5 text-sm text-white/85 marker:text-amber-300/90">
                {performanceGoals.map((item) => (
                  <li key={item} className="pl-1">
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </section>
    </main>
  );
}
