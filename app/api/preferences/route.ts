import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import {
  createUserPreferences,
  updateUserPreferencesPatch,
} from "@/lib/preferences";
import { defaultTrainingWeekdayKeys } from "@/lib/training-week";
import type { AdaptiveLevel } from "@/lib/workout-types";

const LEVELS: AdaptiveLevel[] = ["beginner", "intermediate", "expert"];

function isAdaptiveLevel(v: unknown): v is AdaptiveLevel {
  return typeof v === "string" && LEVELS.includes(v as AdaptiveLevel);
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const fitnessLevel = body.fitnessLevel;
    const manualTrainingDaysPerWeekRaw = body.manualTrainingDaysPerWeek;
    const sessionIncreasePromptNeverRaw = body.sessionIncreasePromptNever;
    const sessionIncreasePromptEveryDaysRaw = body.sessionIncreasePromptEveryDays;
    const sessionIncreasePromptNextAtRaw = body.sessionIncreasePromptNextAt;

    const patch: {
      fitnessLevel?: AdaptiveLevel;
      manualTrainingDaysPerWeek?: number;
      sessionIncreasePromptNever?: boolean;
      sessionIncreasePromptEveryDays?: number;
      sessionIncreasePromptNextAt?: Date | null;
    } = {};

    if (typeof fitnessLevel !== "undefined") {
      if (!isAdaptiveLevel(fitnessLevel)) {
        return NextResponse.json(
          { error: "Invalid fitness level" },
          { status: 400 }
        );
      }
      patch.fitnessLevel = fitnessLevel;
    }

    if (typeof manualTrainingDaysPerWeekRaw !== "undefined") {
      const manualTrainingDaysPerWeek = Number(manualTrainingDaysPerWeekRaw);
      if (
        !Number.isFinite(manualTrainingDaysPerWeek) ||
        manualTrainingDaysPerWeek < 2 ||
        manualTrainingDaysPerWeek > 5
      ) {
        return NextResponse.json(
          { error: "manualTrainingDaysPerWeek must be between 2 and 5" },
          { status: 400 }
        );
      }
      patch.manualTrainingDaysPerWeek = manualTrainingDaysPerWeek;
    }

    if (typeof sessionIncreasePromptNeverRaw !== "undefined") {
      patch.sessionIncreasePromptNever = Boolean(sessionIncreasePromptNeverRaw);
    }

    if (typeof sessionIncreasePromptEveryDaysRaw !== "undefined") {
      const sessionIncreasePromptEveryDays = Number(sessionIncreasePromptEveryDaysRaw);
      if (
        !Number.isFinite(sessionIncreasePromptEveryDays) ||
        ![7, 14, 30].includes(sessionIncreasePromptEveryDays)
      ) {
        return NextResponse.json(
          { error: "sessionIncreasePromptEveryDays must be one of 7, 14, or 30" },
          { status: 400 }
        );
      }
      patch.sessionIncreasePromptEveryDays = sessionIncreasePromptEveryDays;
    }

    if (typeof sessionIncreasePromptNextAtRaw !== "undefined") {
      if (sessionIncreasePromptNextAtRaw === null) {
        patch.sessionIncreasePromptNextAt = null;
      } else {
        const date = new Date(String(sessionIncreasePromptNextAtRaw));
        if (Number.isNaN(date.getTime())) {
          return NextResponse.json(
            { error: "Invalid sessionIncreasePromptNextAt" },
            { status: 400 }
          );
        }
        patch.sessionIncreasePromptNextAt = date;
      }
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json(
        { error: "No valid preference fields provided" },
        { status: 400 }
      );
    }

    const { matchedCount } = await updateUserPreferencesPatch(session.user.id, patch);

    if (matchedCount === 0) {
      return NextResponse.json(
        { error: "No preferences found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Could not update preferences";
    return NextResponse.json({ error: message }, { status: 500 });
  }
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

    const days = defaultTrainingWeekdayKeys(trainingDaysPerWeek);

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
