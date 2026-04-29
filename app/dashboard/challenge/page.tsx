import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import LogoutButton from "@/components/logout-button";
import { EXPERT_CHALLENGE_IDEAS, showExpertDashboardExtras } from "@/lib/dashboard-expert-extras";
import { getUserPreferences } from "@/lib/preferences";

export default async function DashboardChallengePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const preferences = await getUserPreferences(session.user.id);
  if (!preferences) {
    redirect("/onboarding");
  }

  if (!showExpertDashboardExtras(preferences.fitnessLevel)) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#020617] via-[#0b1b4d] to-[#152a68] text-white">
      <header className="border-b border-white/10 bg-[#07142f]/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-white/70">Expert · Challenge mode</p>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Challenge</h1>
            <p className="mt-1 text-sm text-white/60">
              Big events to build your year around—pick one and reverse-engineer your training.
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
              href="/dashboard/goals"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/85 transition hover:bg-white/10"
            >
              Goals
            </Link>
            <Link
              href="/dashboard/nutrition"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/85 transition hover:bg-white/10"
            >
              Nutrition plan
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
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.12),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(239,68,68,0.1),transparent_32%)]"
          aria-hidden
        />
        <div className="relative z-10 mx-auto max-w-3xl">
          <section className="rounded-2xl border border-orange-400/35 bg-orange-500/10 p-6 backdrop-blur-md md:p-8">
            <h2 className="text-lg font-semibold tracking-tight text-orange-50">
              Challenge ideas
            </h2>
            <p className="mt-1 text-sm text-white/65">
              Use these as north stars: add a realistic date, then align weekly volume and recovery with
              your app plan.
            </p>
            <ul className="mt-5 list-inside list-disc space-y-3 text-sm text-white/85 marker:text-orange-300/90">
              {EXPERT_CHALLENGE_IDEAS.map((item) => (
                <li key={item} className="pl-1">
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </section>
    </main>
  );
}
