import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import LogoutButton from "@/components/logout-button";
import { buildHighStrainExerciseSummary } from "@/lib/heart-health-alerts";
import { getUserPreferences } from "@/lib/preferences";
import { getWorkoutHistory } from "@/lib/workout-history";

export default async function HighStrainExercisesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (!(await getUserPreferences(session.user.id))) {
    redirect("/onboarding");
  }

  const history = await getWorkoutHistory(session.user.id);
  const rows = buildHighStrainExerciseSummary(history);

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#020617] via-[#0b1b4d] to-[#152a68] text-white">
      <header className="border-b border-white/10 bg-[#07142f]/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-white/70">Past training · high strain</p>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              Exercises with high heart rate
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard/history"
              className="rounded-xl border border-cyan-400/40 bg-cyan-500/15 px-4 py-2 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-500/25"
            >
              Session history
            </Link>
            <Link
              href="/dashboard"
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white/85 transition hover:bg-white/10"
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
            These are exercises from <strong className="text-white/90">past</strong>{" "}
            logged sessions where heart rate met the app&apos;s &quot;high strain&quot;
            rules (see <code className="rounded bg-white/10 px-1">lib/heart-rate-strain.ts</code>
            ).
          </p>

          {rows.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-sm text-white/70 backdrop-blur-md">
              No high-strain exercises found in your past heart-rate logs yet.
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-white/10 bg-[#07142f]/80 text-xs uppercase tracking-wide text-white/55">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Exercise</th>
                    <th className="px-4 py-3 font-semibold">Times flagged</th>
                    <th className="px-4 py-3 font-semibold">Last logged</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {rows.map((r) => (
                    <tr key={r.exerciseId} className="text-white/90">
                      <td className="px-4 py-3 font-medium text-white">
                        {r.displayName}
                      </td>
                      <td className="px-4 py-3 text-rose-200/95">{r.occurrences}</td>
                      <td className="px-4 py-3 text-white/70">
                        {r.lastAt.toLocaleDateString(undefined, {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
