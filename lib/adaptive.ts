import type {
  AdaptiveLevel,
  UserPreferences,
  WorkoutHistoryEntry,
} from "@/lib/workout-types";

const ORDER: AdaptiveLevel[] = ["beginner", "intermediate", "expert"];

function normalizeLevel(value: string | undefined): AdaptiveLevel {
  const v = (value || "beginner").toLowerCase();
  if (v === "intermediate") return "intermediate";
  if (v === "expert") return "expert";
  return "beginner";
}

function bumpUp(level: AdaptiveLevel): AdaptiveLevel {
  const i = ORDER.indexOf(level);
  return ORDER[Math.min(i + 1, ORDER.length - 1)];
}

function bumpDown(level: AdaptiveLevel): AdaptiveLevel {
  const i = ORDER.indexOf(level);
  return ORDER[Math.max(i - 1, 0)];
}

function sortHistoryDesc(history: WorkoutHistoryEntry[]): WorkoutHistoryEntry[] {
  return [...history].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export type AdaptiveComputation = {
  adaptiveLevel: AdaptiveLevel;
  isReturnWorkout: boolean;
  explanationParts: string[];
};

/**
 * Initial level follows onboarding fitness level, then adjusts from recent history.
 */
export function computeAdaptiveLevel(
  preferences: UserPreferences,
  history: WorkoutHistoryEntry[]
): AdaptiveComputation {
  const explanationParts: string[] = [];
  const sorted = sortHistoryDesc(history);

  let level = normalizeLevel(preferences.fitnessLevel);
  explanationParts.push(
    `Your baseline level is ${labelForLevel(level)} from onboarding.`
  );

  const recentWindow = sorted.slice(0, 10);
  const skipCount = recentWindow.filter((h) => h.skipped).length;
  const isReturnWorkout = skipCount >= 3;
  if (isReturnWorkout) {
    explanationParts.push(
      "You have several recent skipped sessions, so today uses a lighter return workout while keeping your level."
    );
  }

  const last2 = sorted.slice(0, 2);
  const shouldRegress =
    last2.length === 2 &&
    last2.every(
      (h) => h.completionRate < 0.4 || h.feedback === "hard"
    );

  const last3 = sorted.slice(0, 3);
  const shouldProgress =
    last3.length === 3 &&
    last3.every(
      (h) =>
        !h.skipped &&
        h.completionRate >= 0.8 &&
        h.feedback !== "hard"
    );

  if (shouldRegress) {
    level = bumpDown(level);
    explanationParts.push(
      "The last two sessions looked very difficult or incomplete, so difficulty steps down one level."
    );
  } else if (shouldProgress) {
    level = bumpUp(level);
    explanationParts.push(
      "Your last three sessions were completed strongly without feeling too hard, so difficulty steps up one level."
    );
  } else if (sorted.length > 0) {
    explanationParts.push(
      "Recent performance is steady, so your level stays put until a clear streak appears."
    );
  }

  if (preferences.wantsLowImpact) {
    explanationParts.push(
      "Low-impact preference is on, so high-impact moves are filtered out."
    );
  }

  if (preferences.goal === "weight_loss") {
    explanationParts.push(
      "Because your goal is weight loss, cardio-style work is emphasized when building sessions."
    );
  } else if (preferences.goal === "muscle_gain") {
    explanationParts.push(
      "Because your goal is muscle gain, strength work is emphasized when building sessions."
    );
  }

  return { adaptiveLevel: level, isReturnWorkout, explanationParts };
}

export function labelForLevel(level: AdaptiveLevel): "Beginner" | "Intermediate" | "Expert" {
  switch (level) {
    case "intermediate":
      return "Intermediate";
    case "expert":
      return "Expert";
    default:
      return "Beginner";
  }
}
