import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { addWorkoutHistoryEntry } from "@/lib/workout-history";
import type { AdaptiveLevel, WorkoutFeedback } from "@/lib/workout-types";

const LEVELS: AdaptiveLevel[] = ["beginner", "intermediate", "expert"];

function isAdaptiveLevel(v: unknown): v is AdaptiveLevel {
  return typeof v === "string" && LEVELS.includes(v as AdaptiveLevel);
}

function isFeedback(v: unknown): v is WorkoutFeedback {
  return v === "easy" || v === "ok" || v === "hard";
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

    await addWorkoutHistoryEntry({
      userId: session.user.id,
      date: new Date(),
      adaptiveLevel,
      completionRate,
      feedback,
      skipped,
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Could not save workout history";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
