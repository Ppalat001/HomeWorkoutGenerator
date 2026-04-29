import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import LogoutButton from "@/components/logout-button";
import {
  showExpertDashboardExtras,
  WEEKLY_NUTRITION_PLAN_RIPPED,
} from "@/lib/dashboard-expert-extras";
import { getUserPreferences } from "@/lib/preferences";

export default async function DashboardNutritionPage() {
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
            <p className="text-sm text-white/70">Expert · Nutrition</p>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              Nutrition plan
            </h1>
            <p className="mt-1 text-sm text-white/60">
              One generic week focused on protein, vegetables, and steady energy—not a medical diet.
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
              href="/dashboard/challenge"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/85 transition hover:bg-white/10"
            >
              Challenge
            </Link>
            <Link
              href="/dashboard/goals"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/85 transition hover:bg-white/10"
            >
              Goals
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
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.1),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(74,222,128,0.1),transparent_32%)]"
          aria-hidden
        />
        <div className="relative z-10 mx-auto max-w-3xl space-y-6">
          <p className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs leading-relaxed text-white/65">
            This is a reusable weekly template for a leaner look (“get ripped” style): emphasis on
            protein, fiber, and whole foods. Adjust portions to your size, activity, and any medical
            guidance you already follow.
          </p>

          {WEEKLY_NUTRITION_PLAN_RIPPED.map((day) => (
            <section
              key={day.label}
              className="rounded-2xl border border-cyan-400/25 bg-cyan-500/10 p-5 backdrop-blur-md md:p-6"
            >
              <h2 className="text-base font-semibold tracking-tight text-cyan-50">{day.label}</h2>
              <ul className="mt-3 space-y-2 text-sm text-white/82">
                {day.meals.map((line) => (
                  <li key={line} className="border-l-2 border-cyan-400/40 pl-3">
                    {line}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}
