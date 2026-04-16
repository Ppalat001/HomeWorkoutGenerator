import DifficultyProgramPage from "@/components/difficulty-program-page";

type ExerciseItem = {
  name: string;
  video: string;
};

const CHEST: ExerciseItem[] = [
  { name: "chest_ex5_wall_push_up", video: "/videos/chest/chest_ex5_wall_push_up.mp4" },
  { name: "chest_ex9_single_arm_wall_press", video: "/videos/chest/chest_ex9_single_arm_wall_press.mp4" },
  { name: "chest_ex10_doorway_chest_stretch", video: "/videos/chest/chest_ex10_doorway_chest_stretch.mp4" },
  { name: "chest_ex1_standard_push_up", video: "/videos/chest/chest_ex1_standard_push_up.mp4" },
];

const BACK: ExerciseItem[] = [
  { name: "back_ex2_resistance_band_row", video: "/videos/back/back_ex2_resistance_band_row.mp4" },
  { name: "back_ex5_seated_cable_row", video: "/videos/back/back_ex5_seated_cable_row.mp4" },
  { name: "back_ex1_assisted_pull_up", video: "/videos/back/back_ex1_assisted_pull_up.mp4" },
];

const BICEP: ExerciseItem[] = [
  { name: "bicep_ex1_basic_dumbbell_curl", video: "/videos/bicept/bicep_ex1_basic_dumbbell_curl.mp4" },
  { name: "bicep_ex2_alternating_dumbbell_curl", video: "/videos/bicept/bicep_ex2_alternating_dumbbell_curl.mp4" },
  { name: "bicep_ex5_resistance_band_curl", video: "/videos/bicept/bicep_ex5_resistance_band_curl.mp4" },
  { name: "bicep_ex8_light_cable_curl", video: "/videos/bicept/bicep_ex8_light_cable_curl.mp4" },
];

const TRICEP: ExerciseItem[] = [
  { name: "tricep_ex1_tricep_pushdown", video: "/videos/tricept/tricep_ex1_tricep_pushdown.mp4" },
  { name: "tricep_ex2_overhead_tricep_extension", video: "/videos/tricept/tricep_ex2_overhead_tricep_extension.mp4" },
  { name: "tricep_ex5_bench_dips", video: "/videos/tricept/tricep_ex5_bench_dips.mp4" },
];

const SHOULDERS: ExerciseItem[] = [
  { name: "shoulders_ex1_dumbbell_shoulder_press", video: "/videos/shoulder/shoulders_ex1_dumbbell_shoulder_press.mp4" },
  { name: "shoulders_ex2_front_raise", video: "/videos/shoulder/shoulders_ex2_front_raise.mp4" },
  { name: "shoulders_ex5_lateral_raise", video: "/videos/shoulder/shoulders_ex5_lateral_raise.mp4" },
];

const LEGS: ExerciseItem[] = [
  { name: "legs_ex1_bodyweight_squat", video: "/videos/leg/legs_ex1_bodyweight_squat.mp4" },
  { name: "legs_ex2_wall_sit", video: "/videos/leg/legs_ex2_wall_sit.mp4" },
  { name: "legs_ex5_glute_bridge", video: "/videos/leg/legs_ex5_glute_bridge.mp4" },
];

const ABS: ExerciseItem[] = [
  { name: "abs_ex1_basic_crunch", video: "/videos/abs/ex1.mp4" },
  { name: "abs_ex2_knee_tuck_crunch", video: "/videos/abs/ex2.mp4" },
  { name: "abs_ex5_lying_leg_raise", video: "/videos/abs/ex5.mp4" },
];

function pick(list: ExerciseItem[], index: number) {
  return list[index % list.length];
}

function buildDay(day: string, index: number, sets: string, reps: string) {
  const chest = pick(CHEST, index);
  const back = pick(BACK, index);
  const bicep = pick(BICEP, index);
  const tricep = pick(TRICEP, index);
  const shoulders = pick(SHOULDERS, index);
  const legs = pick(LEGS, index);
  const abs = pick(ABS, index);

  return {
    day,
    exercises: {
      Chest: {
        name: chest.name,
        sets,
        reps,
        video: chest.video,
      },
      Back: {
        name: back.name,
        sets,
        reps,
        video: back.video,
      },
      Bicep: {
        name: bicep.name,
        sets,
        reps,
        video: bicep.video,
      },
      Tricep: {
        name: tricep.name,
        sets,
        reps,
        video: tricep.video,
      },
      Shoulders: {
        name: shoulders.name,
        sets,
        reps,
        video: shoulders.video,
      },
      Legs: {
        name: legs.name,
        sets,
        reps,
        video: legs.video,
      },
      Abs: {
        name: abs.name,
        sets,
        reps,
        video: abs.video,
      },
    },
  };
}

const programs = [
  {
    frequency: "2x/week" as const,
    goal: "Habit building with recovery between sessions.",
    days: [
      buildDay("Day 1 - Full Body Foundation", 0, "3", "10-12"),
      buildDay("Day 2 - Full Body Repeat", 1, "3", "10-12"),
    ],
  },
  {
    frequency: "3x/week" as const,
    goal: "Steady progression with one variation day.",
    days: [
      buildDay("Day 1 - Base Strength", 0, "3", "12"),
      buildDay("Day 2 - Technique Focus", 1, "3", "10-12"),
      buildDay("Day 3 - Volume Builder", 2, "3", "12-15"),
    ],
  },
  {
    frequency: "4x/week" as const,
    goal: "Higher weekly volume while keeping beginner-safe intensity.",
    days: [
      buildDay("Day 1 - Upper Emphasis", 0, "3", "10-12"),
      buildDay("Day 2 - Lower + Core Emphasis", 1, "3", "12"),
      buildDay("Day 3 - Upper Variation", 2, "3", "10-12"),
      buildDay("Day 4 - Balanced Conditioning", 3, "2-3", "12-15"),
    ],
  },
  {
    frequency: "5x/week" as const,
    goal: "Daily movement routine with moderate effort sessions.",
    days: [
      buildDay("Day 1 - Push + Legs", 0, "3", "10-12"),
      buildDay("Day 2 - Pull + Core", 1, "3", "12"),
      buildDay("Day 3 - Full Body Circuit", 2, "3", "12-15"),
      buildDay("Day 4 - Strength Refresh", 3, "3", "10-12"),
      buildDay("Day 5 - Technique + Endurance", 4, "2-3", "15"),
    ],
  },
];

export default function BeginnerPage() {
  return (
    <DifficultyProgramPage
      level="Beginner"
      levelPath="/beginner"
      programs={programs}
    />
  );
}
