import type { AdaptiveLevel } from "@/lib/workout-types";

/** Body-focused targets for intermediate trainees (onboarding fitness level). */
export const INTERMEDIATE_BODY_GOALS: string[] = [
  "Reach 14%–20% body fat",
  "Improve posture and body alignment",
  "Build a stronger, more defined core",
  "Feel more confident in your body",
  "Improve mobility and joint resilience",
  "Develop balanced muscle tone across upper and lower body",
];

/** Stricter body composition range for expert trainees; shown with performance goals. */
export const EXPERT_BODY_GOALS: string[] = [
  "Reach 8%–14% body fat",
  "Improve posture and body alignment",
  "Build a stronger, more defined core",
  "Feel more confident in your body",
  "Increase lean muscle while staying athletic",
  "Improve recovery: sleep, hydration, and intentional rest days",
];

export const EXPERT_PERFORMANCE_GOALS: string[] = [
  "Do 50 push-ups consecutively",
  "Do 100 ab repetitions consecutively",
  "Hold a plank for 2 minutes",
  "Reduce rest time between exercises while keeping good form",
  "Complete 10 unbroken pull-ups (or steady progression toward them)",
];

export function showDashboardGoalsLink(level: AdaptiveLevel): boolean {
  return level === "intermediate" || level === "expert";
}

export function goalsContentForLevel(level: AdaptiveLevel): {
  tierLabel: string;
  bodyGoals: string[];
  performanceGoals: string[] | null;
} {
  if (level === "expert") {
    return {
      tierLabel: "Expert",
      bodyGoals: EXPERT_BODY_GOALS,
      performanceGoals: EXPERT_PERFORMANCE_GOALS,
    };
  }
  return {
    tierLabel: "Intermediate",
    bodyGoals: INTERMEDIATE_BODY_GOALS,
    performanceGoals: null,
  };
}
