import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

type Program = {
  title: string;
  description: string;
  duration: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  focus: string[];
  resources: { label: string; href: string }[];
};

const PROGRAMS: Program[] = [
  {
    title: "Beginner Full-Body (No Equipment)",
    description:
      "Build a consistent habit with simple full-body sessions you can repeat 3x/week.",
    duration: "25–35 min",
    level: "Beginner",
    focus: ["Full body", "Form", "Consistency"],
    resources: [
      { label: "NHS: Strength exercises", href: "https://www.nhs.uk/live-well/exercise/strength-and-flex-exercise-plan/" },
      { label: "ACE: Bodyweight exercises", href: "https://www.acefitness.org/resources/everyone/exercise-library/" },
      { label: "Nerd Fitness: Beginner bodyweight", href: "https://www.nerdfitness.com/blog/beginner-body-weight-workout-burn-fat-build-muscle/" },
    ],
  },
  {
    title: "HIIT (Apartment-Friendly)",
    description:
      "Short, sweaty intervals with low-impact options to keep noise and joint stress down.",
    duration: "15–25 min",
    level: "Intermediate",
    focus: ["Cardio", "Conditioning", "Low-impact"],
    resources: [
      { label: "Mayo Clinic: HIIT basics", href: "https://www.mayoclinic.org/healthy-lifestyle/fitness/in-depth/high-intensity-interval-training/art-20046377" },
      { label: "NHS: Home workouts", href: "https://www.nhs.uk/live-well/exercise/free-fitness-ideas/" },
      { label: "SELF: HIIT workouts", href: "https://www.self.com/fitness/workouts" },
    ],
  },
  {
    title: "Core & Posture",
    description:
      "Strengthen your trunk and improve posture with controlled, spine-friendly movements.",
    duration: "15–30 min",
    level: "Beginner",
    focus: ["Core", "Posture", "Stability"],
    resources: [
      { label: "Cleveland Clinic: Core exercises", href: "https://health.clevelandclinic.org/core-exercises" },
      { label: "Harvard: Core workouts", href: "https://www.health.harvard.edu/staying-healthy/the-best-core-exercises-for-older-adults" },
      { label: "ACE: Plank variations", href: "https://www.acefitness.org/resources/everyone/exercise-library/" },
    ],
  },
  {
    title: "Mobility & Flexibility Reset",
    description:
      "Loosen hips, shoulders, and back with a simple daily mobility sequence.",
    duration: "10–20 min",
    level: "Beginner",
    focus: ["Mobility", "Recovery", "Range of motion"],
    resources: [
      { label: "NHS: Flexibility exercises", href: "https://www.nhs.uk/live-well/exercise/flexibility-exercises/" },
      { label: "GMB: Mobility routines", href: "https://gmb.io/mobility/" },
      { label: "Yoga With Adriene", href: "https://yogawithadriene.com/" },
    ],
  },
  {
    title: "Strength (Dumbbells Optional)",
    description:
      "Progressive strength sessions with easy substitutions if you don’t have weights.",
    duration: "30–45 min",
    level: "Intermediate",
    focus: ["Strength", "Progression", "Full body"],
    resources: [
      { label: "ACE: Exercise library", href: "https://www.acefitness.org/resources/everyone/exercise-library/" },
      { label: "ExRx: Exercise directory", href: "https://exrx.net/Lists/Directory" },
      { label: "StrongLifts: Strength basics", href: "https://stronglifts.com/5x5/" },
    ],
  },
  {
    title: "Low-Impact Cardio (Knees-Friendly)",
    description:
      "Gentle cardio choices that still raise your heart rate without jumping.",
    duration: "20–35 min",
    level: "Beginner",
    focus: ["Cardio", "Low-impact", "Joint-friendly"],
    resources: [
      { label: "Arthritis Foundation: Low-impact cardio", href: "https://www.arthritis.org/health-wellness/healthy-living/physical-activity/getting-started/low-impact-exercises" },
      { label: "NHS: Fitness studio videos", href: "https://www.nhs.uk/conditions/nhs-fitness-studio/" },
      { label: "Verywell Fit: Low-impact cardio", href: "https://www.verywellfit.com/low-impact-cardio-workouts-1231300" },
    ],
  },
];

function levelBadgeClass(level: Program["level"]) {
  switch (level) {
    case "Beginner":
      return "bg-emerald-500/15 text-emerald-200 border-emerald-400/20";
    case "Intermediate":
      return "bg-cyan-500/15 text-cyan-200 border-cyan-400/20";
    case "Advanced":
      return "bg-fuchsia-500/15 text-fuchsia-200 border-fuchsia-400/20";
    default:
      return "bg-white/10 text-white/70 border-white/15";
  }
}

export default async function HomePage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#020617] via-[#0b1b4d] to-[#152a68] text-white">
      <header className="border-b border-white/10 bg-[#07142f]/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-white/70">Welcome back</p>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              {session.user?.name || session.user?.email}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/workout"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/85 transition hover:bg-white/10"
            >
              Today&apos;s Workout
            </Link>
            <Link
              href="/history"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/85 transition hover:bg-white/10"
            >
              History
            </Link>
          </div>
        </div>
      </header>

      <section className="relative px-6 py-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.12),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.14),transparent_30%)]" />

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="mb-8 max-w-3xl">
            <h2 className="text-3xl font-bold leading-tight md:text-4xl">
              Home exercise programs
            </h2>
            <p className="mt-3 text-sm text-white/70 md:text-base">
              Pick a program to follow, then use the curated exercise resources to
              learn movements and build your routine at home.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {PROGRAMS.map((program) => (
              <div
                key={program.title}
                className="group rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-md transition hover:bg-white/7"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold leading-snug">
                      {program.title}
                    </h3>
                    <p className="mt-2 text-sm text-white/70">
                      {program.description}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${levelBadgeClass(
                      program.level
                    )}`}
                  >
                    {program.level}
                  </span>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-white/70">
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                    {program.duration}
                  </span>
                  {program.focus.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-6">
                  <p className="text-sm font-medium text-white/85">
                    Exercise websites
                  </p>
                  <ul className="mt-3 space-y-2">
                    {program.resources.map((r) => (
                      <li key={r.href}>
                        <a
                          href={r.href}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-cyan-300 transition hover:text-cyan-200"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-cyan-300/80" />
                          {r.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}