import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { createUserPreferences } from "@/lib/preferences";
import type { AdaptiveLevel } from "@/lib/workout-types";

const LEVELS: AdaptiveLevel[] = ["beginner", "intermediate", "expert"];

function isAdaptiveLevel(v: unknown): v is AdaptiveLevel {
  return typeof v === "string" && LEVELS.includes(v as AdaptiveLevel);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    const goal = String(body.goal || "").trim();
    const fitnessLevel = body.fitnessLevel;
    const trainingDaysPerWeek = Number(body.trainingDaysPerWeek);
    const preferredTrainingDays: unknown = body.preferredTrainingDays;
    const workoutDurationMinutes = Number(body.workoutDurationMinutes);
    const preferredExerciseTypes: unknown = body.preferredExerciseTypes;
    const limitations = String(body.limitations || "").trim();
    const wantsLowImpact = Boolean(body.wantsLowImpact);

    if (!goal) {
      return NextResponse.json({ error: "Goal is required" }, { status: 400 });
    }

    if (!isAdaptiveLevel(fitnessLevel)) {
      return NextResponse.json({ error: "Invalid fitness level" }, { status: 400 });
    }

    if (
      !Number.isFinite(trainingDaysPerWeek) ||
      trainingDaysPerWeek < 2 ||
      trainingDaysPerWeek > 5
    ) {
      return NextResponse.json(
        { error: "Training days per week must be between 2 and 5" },
        { status: 400 }
      );
    }

    if (!Array.isArray(preferredTrainingDays) || preferredTrainingDays.length === 0) {
      return NextResponse.json(
        { error: "Select at least one available training day" },
        { status: 400 }
      );
    }

    const days = preferredTrainingDays.map((d: unknown) =>
      String(d).toLowerCase().trim()
    );

    if (days.length < trainingDaysPerWeek) {
      return NextResponse.json(
        {
          error:
            "Pick at least as many available days as your weekly training frequency",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(workoutDurationMinutes) ||
      workoutDurationMinutes < 10 ||
      workoutDurationMinutes > 90
    ) {
      return NextResponse.json(
        { error: "Workout duration looks invalid" },
        { status: 400 }
      );
    }

    if (!Array.isArray(preferredExerciseTypes) || preferredExerciseTypes.length === 0) {
      return NextResponse.json(
        { error: "Select at least one exercise type" },
        { status: 400 }
      );
    }

    const types = preferredExerciseTypes.map((t: unknown) => String(t).trim());

    await createUserPreferences(session.user.id, {
      goal,
      fitnessLevel,
      trainingDaysPerWeek,
      preferredTrainingDays: days,
      workoutDurationMinutes,
      preferredExerciseTypes: types,
      limitations,
      wantsLowImpact,
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not save preferences";
    if (message === "Preferences already exist") {
      return NextResponse.json({ error: message }, { status: 409 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
