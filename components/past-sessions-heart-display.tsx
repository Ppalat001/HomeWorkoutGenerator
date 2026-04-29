import type {
  PastHeartDayGroup,
  PastHeartExerciseRow,
} from "@/lib/past-heart-rate-sessions";

function Sparkline({ series }: { series: number[] }) {
  if (series.length === 0) return null;
  const w = 240;
  const h = 44;
  const pad = 3;
  const min = Math.min(...series);
  const max = Math.max(...series);
  const span = Math.max(1, max - min);
  const pts = series
    .map((v, i) => {
      const x = pad + (i / Math.max(1, series.length - 1)) * (w - pad * 2);
      const t = (v - min) / span;
      const y = pad + (1 - t) * (h - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <div className="mt-2 rounded-lg border border-white/10 bg-[#050d1a]/80 p-1.5">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="w-full max-w-xs text-cyan-300"
        role="img"
        aria-label={`Heart rate curve about ${min}–${max} BPM`}
      >
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          points={pts}
        />
      </svg>
    </div>
  );
}

function ExerciseBlock({ row }: { row: PastHeartExerciseRow }) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        row.excessiveStrain
          ? "border-rose-400/60 bg-rose-500/10"
          : "border-white/10 bg-[#07142f]/60"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-white">{row.displayName}</p>
          <p className="mt-1 text-xs text-white/65">
            Avg {row.avgBpm} BPM · Peak {row.maxBpm} BPM
          </p>
        </div>
        {row.excessiveStrain && (
          <span
            className="shrink-0 rounded-md border border-rose-400/70 bg-rose-600/30 px-2 py-1 text-[11px] font-semibold uppercase text-rose-100"
            title="High BPM sustained or peak in a risky range for a typical home session (see app rules)."
          >
            High strain
          </span>
        )}
      </div>
      <Sparkline series={row.bpmSeries} />
    </div>
  );
}

export default function PastSessionsHeartDisplay({
  days,
}: {
  days: PastHeartDayGroup[];
}) {
  if (days.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-sm text-white/70 backdrop-blur-md">
        <p className="font-medium text-white/90">No past heart-rate sessions</p>
        <p className="mt-2">
          Completed workouts with <span className="text-cyan-200">exerciseHeartRates</span>{" "}
          in MongoDB will show here for days before today.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {days.map((day) => (
        <section key={day.dateIso}>
          <h2 className="border-b border-white/10 pb-2 text-lg font-semibold text-cyan-100">
            {day.dateLabel}
          </h2>
          <div className="mt-4 space-y-6">
            {day.sessions.map((session) => (
              <article
                key={`${day.dateIso}-${session.historyId}-${session.at.toISOString()}`}
                className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm font-medium text-white/90">
                    Session · {session.timeLabel}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-white/55">
                    <span>
                      Completion{" "}
                      <span className="text-white/85">
                        {Math.round(session.completionRate * 100)}%
                      </span>
                    </span>
                    {session.trackingStatus && (
                      <span className="rounded border border-white/15 px-2 py-0.5 text-[11px] text-white/70">
                        {session.trackingStatus}
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {session.exercises.map((ex, i) => (
                    <ExerciseBlock
                      key={`${session.historyId}-${ex.exerciseId}-${i}`}
                      row={ex}
                    />
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
