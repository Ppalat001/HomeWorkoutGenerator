import DifficultyProgramPage from "@/components/difficulty-program-page";

type ExerciseItem = {
  name: string;
  video: string;
};

const CHEST: ExerciseItem[] = [
  { name: "chest_ex1_standard_push_up", video: "/videos/chest/chest_ex1_standard_push_up.mp4" },
  { name: "chest_ex2_close_grip_push_up", video: "/videos/chest/chest_ex2_close_grip_push_up.mp4" },
  { name: "chest_ex4_wide_push_up", video: "/videos/chest/chest_ex4_wide_push_up.mp4" },
];

const BACK: ExerciseItem[] = [
  { name: "back_ex1_assisted_pull_up", video: "/videos/back/back_ex1_assisted_pull_up.mp4" },
  { name: "back_ex3_bent_over_row", video: "/videos/back/back_ex3_bent_over_row.mp4" },
  { name: "back_ex6_lat_pulldown", video: "/videos/back/back_ex6_lat_pulldown.mp4" },
];

const BICEP: ExerciseItem[] = [
  { name: "bicep_ex1_basic_dumbbell_curl", video: "/videos/bicept/bicep_ex1_basic_dumbbell_curl.mp4" },
  { name: "bicep_ex3_hammer_curl", video: "/videos/bicept/bicep_ex3_hammer_curl.mp4" },
  { name: "bicep_ex4_concentration_curl", video: "/videos/bicept/bicep_ex4_concentration_curl.mp4" },
  { name: "bicep_ex6_preacher_curl", video: "/videos/bicept/bicep_ex6_preacher_curl.mp4" },
];

const TRICEP: ExerciseItem[] = [
  { name: "tricep_ex1_tricep_pushdown", video: "/videos/tricept/tricep_ex1_tricep_pushdown.mp4" },
  { name: "tricep_ex3_skullcrusher", video: "/videos/tricept/tricep_ex3_skullcrusher.mp4" },
  { name: "tricep_ex6_close_grip_push_up", video: "/videos/tricept/tricep_ex6_close_grip_push_up.mp4" },
];

const SHOULDERS: ExerciseItem[] = [
  { name: "shoulders_ex1_dumbbell_shoulder_press", video: "/videos/shoulder/shoulders_ex1_dumbbell_shoulder_press.mp4" },
  { name: "shoulders_ex3_arnold_press", video: "/videos/shoulder/shoulders_ex3_arnold_press.mp4" },
  { name: "shoulders_ex5_lateral_raise", video: "/videos/shoulder/shoulders_ex5_lateral_raise.mp4" },
];

const LEGS: ExerciseItem[] = [
  { name: "legs_ex1_bodyweight_squat", video: "/videos/leg/legs_ex1_bodyweight_squat.mp4" },
  { name: "legs_ex3_forward_lunge", video: "/videos/leg/legs_ex3_forward_lunge.mp4" },
  { name: "legs_ex6_step_up", video: "/videos/leg/legs_ex6_step_up.mp4" },
];

const ABS: ExerciseItem[] = [
  { name: "abs_ex3_bicycle_crunch", video: "/videos/abs/ex3.mp4" },
  { name: "abs_ex4_reverse_crunch", video: "/videos/abs/ex4.mp4" },
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
    goal: "Maintain strength with two dense full-body sessions.",
    days: [
      buildDay("Day 1 - Strength Focus", 0, "4", "8-10"),
      buildDay("Day 2 - Volume Focus", 1, "4", "10-12"),
    ],
  },
  {
    frequency: "3x/week" as const,
    goal: "Blend strength and hypertrophy across the week.",
    days: [
      buildDay("Day 1 - Push Dominant", 0, "4", "8-10"),
      buildDay("Day 2 - Legs + Core", 1, "4", "10"),
      buildDay("Day 3 - Pull + Arms", 2, "3-4", "10-12"),
    ],
  },
  {
    frequency: "4x/week" as const,
    goal: "Structured overload with alternating hard/moderate sessions.",
    days: [
      buildDay("Day 1 - Upper Strength", 0, "4", "6-8"),
      buildDay("Day 2 - Lower Strength", 1, "4", "8-10"),
      buildDay("Day 3 - Upper Hypertrophy", 2, "4", "10-12"),
      buildDay("Day 4 - Lower + Core Hypertrophy", 3, "3-4", "12"),
    ],
  },
  {
    frequency: "5x/week" as const,
    goal: "High-volume split for visible progression and conditioning.",
    days: [
      buildDay("Day 1 - Chest + Triceps", 0, "4", "8-10"),
      buildDay("Day 2 - Legs + Abs", 1, "4", "10"),
      buildDay("Day 3 - Shoulders + Arms", 2, "4", "10-12"),
      buildDay("Day 4 - Full Body Power", 3, "3-4", "8"),
      buildDay("Day 5 - Pump + Conditioning", 4, "3", "12-15"),
    ],
  },
];

export default function IntermediatePage() {
  return (
    <DifficultyProgramPage
      level="Intermediate"
      levelPath="/intermediate"
      programs={programs}
    />
  );
}
