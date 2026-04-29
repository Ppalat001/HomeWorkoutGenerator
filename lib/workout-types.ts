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
  /** If true, hide level-increase prompt until user re-enables it. */
  levelIncreasePromptNever?: boolean;
  /** Reminder cadence in days when user postpones level prompt (1 = daily, 7 = weekly, 30 = monthly). */
  levelIncreasePromptEveryDays?: number;
  /** Earliest date/time when level-increase prompt can show again. */
  levelIncreasePromptNextAt?: Date | null;
  /** Template weekdays spread from frequency; scheduling uses `trainingDaysPerWeek`. */
  preferredTrainingDays: string[];
  workoutDurationMinutes: number;
  preferredExerciseTypes: string[];
  limitations: string;
  wantsLowImpact: boolean;
  createdAt: Date;
  updatedAt: Date;
};

/** Per-exercise heart rate captured for a completed session (e.g. wearable samples). */
export type ExerciseHeartRateEntry = {
  exerciseId: string;
  exerciseName?: string;
  avgBpm: number;
  maxBpm: number;
  /** BPM samples during the exercise (e.g. one per 15–30s). */
  bpmSeries: number[];
};

export type WorkoutHistoryEntry = {
  _id?: string;
  userId: string;
  date: Date;
  adaptiveLevel: AdaptiveLevel;
  completionRate: number;
  feedback: WorkoutFeedback | null;
  skipped: boolean;
  exerciseHeartRates?: ExerciseHeartRateEntry[];
  /** Optional session tracking flag from wearables / imports (e.g. Mongo seed). */
  trackingStatus?: string;
};

export type PlannedExercise = Exercise & {
  sets: number;
  repsDisplay: string;
  minutes: number;
};

/** Serializable subset passed to the dashboard for dislike / swap logic. */
export type WorkoutPlanningPreferences = Pick<
  UserPreferences,
  "goal" | "wantsLowImpact" | "preferredExerciseTypes" | "workoutDurationMinutes"
>;

/** Fields required to build the leveled exercise pool (server or client). */
export type ExercisePoolPreferences = Pick<
  UserPreferences,
  "goal" | "wantsLowImpact" | "preferredExerciseTypes"
>;
