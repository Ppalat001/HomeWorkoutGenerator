export type AdaptiveLevel = "beginner" | "intermediate" | "expert";

export type WorkoutFeedback = "easy" | "ok" | "hard";

export type Exercise = {
  id: string;
  name: string;
  type: string;
  level: AdaptiveLevel;
  goals: string[];
  duration?: number;
  reps?: number;
  lowImpact: boolean;
  video?: string;
};

export type UserPreferences = {
  _id?: string;
  userId: string;
  goal: string;
  fitnessLevel: AdaptiveLevel;
  trainingDaysPerWeek: number;
  /** User-accepted override after sustained consistency streaks. */
  manualTrainingDaysPerWeek?: number;
  /** If true, hide session-increase prompt until user re-enables it. */
  sessionIncreasePromptNever?: boolean;
  /** Reminder cadence in days when user postpones prompt. */
  sessionIncreasePromptEveryDays?: number;
  /** Earliest date/time when prompt can show again. */
  sessionIncreasePromptNextAt?: Date | null;
  /** Template weekdays spread from frequency; scheduling uses `trainingDaysPerWeek`. */
  preferredTrainingDays: string[];
  workoutDurationMinutes: number;
  preferredExerciseTypes: string[];
  limitations: string;
  wantsLowImpact: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type WorkoutHistoryEntry = {
  _id?: string;
  userId: string;
  date: Date;
  adaptiveLevel: AdaptiveLevel;
  completionRate: number;
  feedback: WorkoutFeedback | null;
  skipped: boolean;
};

export type PlannedExercise = Exercise & {
  sets: number;
  repsDisplay: string;
  minutes: number;
};
