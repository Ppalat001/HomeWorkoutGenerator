import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

type MuscleGroup =
  | "Chest"
  | "Back"
  | "Bicep"
  | "Tricep"
  | "Shoulders"
  | "Legs"
  | "Abs";

type Exercise = {
  name: string;
  sets: string;
  reps: string;
  video: string;
};

type DailyPlan = {
  day: string;
  exercises: Record<MuscleGroup, Exercise>;
};

type WeeklyProgram = {
  frequency: "2x/week" | "3x/week" | "4x/week" | "5x/week";
  goal: string;
  days: DailyPlan[];
};

type DifficultyProgramPageProps = {
  level: "Beginner" | "Intermediate" | "Expert";
  levelPath: "/beginner" | "/intermediate" | "/expert";
  programs: WeeklyProgram[];
};

const DIFFICULTY_LINKS: Array<{
  label: "Beginner" | "Intermediate" | "Expert";
  href: "/beginner" | "/intermediate" | "/expert";
}> = [
  { label: "Beginner", href: "/beginner" },
  { label: "Intermediate", href: "/intermediate" },
  { label: "Expert", href: "/expert" },
];

export default async function DifficultyProgramPage({
  level,
  levelPath,
  programs,
}: DifficultyProgramPageProps) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#020617] via-[#0b1b4d] to-[#152a68] text-white">
      <header className="border-b border-white/10 bg-[#07142f]/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-white/70">Logged in as</p>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              {session.user?.name || session.user?.email}
            </h1>
          </div>
          <nav className="flex flex-wrap gap-2">
            {DIFFICULTY_LINKS.map((link) => {
              const isActive = link.href === levelPath;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? "border-cyan-300/60 bg-cyan-500/20 text-cyan-100"
                      : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <section className="relative px-6 py-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.12),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.14),transparent_30%)]" />
        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="mb-8 max-w-3xl">
            <h2 className="text-3xl font-bold leading-tight md:text-4xl">
              {level} weekly training plans
            </h2>
            <p className="mt-3 text-sm text-white/70 md:text-base">
              Four structured options based on weekly availability. Every daily
              plan includes chest, back, bicep, tricep, shoulders, legs, and abs
              work.
            </p>
          </div>

          <div className="space-y-8">
            {programs.map((program) => (
              <div
                key={program.frequency}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-md"
              >
                <div className="mb-5 flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-cyan-300/30 bg-cyan-500/15 px-3 py-1 text-xs font-semibold text-cyan-100">
                    {program.frequency}
                  </span>
                  <p className="text-sm text-white/80">{program.goal}</p>
                </div>

                <div className="space-y-5">
                  {program.days.map((dayPlan) => (
                    <div
                      key={dayPlan.day}
                      className="rounded-xl border border-white/10 bg-[#07142f]/50 p-4"
                    >
                      <h3 className="mb-3 text-base font-semibold">{dayPlan.day}</h3>
                      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {(
                          Object.entries(dayPlan.exercises) as Array<
                            [MuscleGroup, Exercise]
                          >
                        ).map(([group, exercise]) => (
                          <div
                            key={`${dayPlan.day}-${group}`}
                            className="rounded-lg border border-white/10 bg-white/5 p-3"
                          >
                            <p className="text-sm font-semibold text-cyan-100">
                              {group}
                            </p>
                            <p className="mt-1 text-sm text-white/90">{exercise.name}</p>
                            <p className="text-xs text-white/70">
                              {exercise.sets} sets x {exercise.reps}
                            </p>
                            <video
                              controls
                              preload="metadata"
                              className="mt-2 aspect-video w-full rounded-md border border-white/10 bg-black/40"
                            >
                              <source src={exercise.video} type="video/mp4" />
                              Your browser does not support the video tag.
                            </video>
                            <a
                              href={exercise.video}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-2 inline-block text-xs text-cyan-300 underline underline-offset-2 hover:text-cyan-200"
                            >
                              Open video
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
