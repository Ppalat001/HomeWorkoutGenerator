import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { addWorkoutHistoryEntry } from "@/lib/workout-history";
import type {
  AdaptiveLevel,
  ExerciseHeartRateEntry,
  WorkoutFeedback,
} from "@/lib/workout-types";

const LEVELS: AdaptiveLevel[] = ["beginner", "intermediate", "expert"];

function isAdaptiveLevel(v: unknown): v is AdaptiveLevel {
  return typeof v === "string" && LEVELS.includes(v as AdaptiveLevel);
}

function isFeedback(v: unknown): v is WorkoutFeedback {
  return v === "easy" || v === "ok" || v === "hard";
}

function isNumberArray(v: unknown): v is number[] {
  return (
    Array.isArray(v) &&
    v.length > 0 &&
    v.every((x) => typeof x === "number" && Number.isFinite(x))
  );
}

function parseExerciseHeartRates(raw: unknown): ExerciseHeartRateEntry[] | null {
  if (raw === undefined || raw === null) return null;
  if (!Array.isArray(raw)) return null;
  const out: ExerciseHeartRateEntry[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") return null;
    const o = item as Record<string, unknown>;
    if (typeof o.exerciseId !== "string" || o.exerciseId.length === 0) {
      return null;
    }
    if (typeof o.avgBpm !== "number" || typeof o.maxBpm !== "number") {
      return null;
    }
    if (!isNumberArray(o.bpmSeries)) return null;
    const entry: ExerciseHeartRateEntry = {
      exerciseId: o.exerciseId,
      avgBpm: Math.round(o.avgBpm),
      maxBpm: Math.round(o.maxBpm),
      bpmSeries: o.bpmSeries.map((n) => Math.round(n)),
    };
    if (typeof o.exerciseName === "string" && o.exerciseName.length > 0) {
      entry.exerciseName = o.exerciseName;
    }
    out.push(entry);
  }
  return out;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const completed = Boolean(body.completed);
    const feedbackRaw = body.feedback;
    const adaptiveLevel = body.adaptiveLevel;

    if (!isAdaptiveLevel(adaptiveLevel)) {
      return NextResponse.json({ error: "Invalid adaptive level" }, { status: 400 });
    }

    let feedback: WorkoutFeedback | null = null;
    if (completed) {
      if (!isFeedback(feedbackRaw)) {
        return NextResponse.json(
          { error: "Select how the workout felt" },
          { status: 400 }
        );
      }
      feedback = feedbackRaw;
    }

    const skipped = !completed;
    const completionRate = completed ? 1 : 0;

    const heartParsed = parseExerciseHeartRates(body.exerciseHeartRates);
    if (body.exerciseHeartRates != null && heartParsed === null) {
      return NextResponse.json(
        { error: "Invalid exerciseHeartRates payload" },
        { status: 400 }
      );
    }

    await addWorkoutHistoryEntry({
      userId: session.user.id,
      date: new Date(),
      adaptiveLevel,
      completionRate,
      feedback,
      skipped,
      exerciseHeartRates: heartParsed ?? undefined,
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Could not save workout history";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
