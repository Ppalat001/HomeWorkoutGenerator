import DifficultyProgramPage from "@/components/difficulty-program-page";

type ExerciseItem = {
  name: string;
  video: string;
};

const CHEST: ExerciseItem[] = [
  { name: "chest_ex3_explosive_push_up", video: "/videos/chest/chest_ex3_explosive_push_up.mp4" },
  { name: "chest_ex6_one_arm_push_up", video: "/videos/chest/chest_ex6_one_arm_push_up.mp4" },
  { name: "chest_ex7_overhead_chest_squeeze", video: "/videos/chest/chest_ex7_overhead_chest_squeeze.mp4" },
  { name: "chest_ex8_overhead_chest_squeeze_hold", video: "/videos/chest/chest_ex8_overhead_chest_squeeze_hold.mp4" },
];

const BACK: ExerciseItem[] = [
  { name: "back_ex4_pull_up", video: "/videos/back/back_ex4_pull_up.mp4" },
  { name: "back_ex3_bent_over_row", video: "/videos/back/back_ex3_bent_over_row.mp4" },
  { name: "back_ex7_single_arm_row", video: "/videos/back/back_ex7_single_arm_row.mp4" },
];

const BICEP: ExerciseItem[] = [
  { name: "bicep_ex4_concentration_curl", video: "/videos/bicept/bicep_ex4_concentration_curl.mp4" },
  { name: "bicep_ex6_preacher_curl", video: "/videos/bicept/bicep_ex6_preacher_curl.mp4" },
  { name: "bicep_ex7_incline_dumbbell_curl", video: "/videos/bicept/bicep_ex7_incline_dumbbell_curl.mp4" },
  { name: "bicep_ex8_heavy_cable_curl", video: "/videos/bicept/bicep_ex8_heavy_cable_curl.mp4" },
];

const TRICEP: ExerciseItem[] = [
  { name: "tricep_ex4_parallel_bar_dips", video: "/videos/tricept/tricep_ex4_parallel_bar_dips.mp4" },
  { name: "tricep_ex7_single_arm_overhead_extension", video: "/videos/tricept/tricep_ex7_single_arm_overhead_extension.mp4" },
  { name: "tricep_ex6_close_grip_push_up", video: "/videos/tricept/tricep_ex6_close_grip_push_up.mp4" },
];

const SHOULDERS: ExerciseItem[] = [
  { name: "shoulders_ex3_arnold_press", video: "/videos/shoulder/shoulders_ex3_arnold_press.mp4" },
  { name: "shoulders_ex4_handstand_push_up", video: "/videos/shoulder/shoulders_ex4_handstand_push_up.mp4" },
  { name: "shoulders_ex6_plate_front_raise", video: "/videos/shoulder/shoulders_ex6_plate_front_raise.mp4" },
];

const LEGS: ExerciseItem[] = [
  { name: "legs_ex4_jump_squat", video: "/videos/leg/legs_ex4_jump_squat.mp4" },
  { name: "legs_ex7_single_leg_deadlift", video: "/videos/leg/legs_ex7_single_leg_deadlift.mp4" },
  { name: "legs_ex6_step_up", video: "/videos/leg/legs_ex6_step_up.mp4" },
];

const ABS: ExerciseItem[] = [
  { name: "abs_ex6_v_sit_hold", video: "/videos/abs/ex6.mp4" },
  { name: "abs_ex7_plank_variation", video: "/videos/abs/ex7.mp4" },
  { name: "abs_ex8_russian_twist", video: "/videos/abs/ex8.mp4" },
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
    goal: "High intensity sessions for athletes with limited schedule.",
    days: [
      buildDay("Day 1 - Max Strength", 0, "5", "4-6"),
      buildDay("Day 2 - Power + Hypertrophy", 1, "4-5", "6-8"),
    ],
  },
  {
    frequency: "3x/week" as const,
    goal: "Undulating intensity for performance and recovery balance.",
    days: [
      buildDay("Day 1 - Heavy", 0, "5", "3-5"),
      buildDay("Day 2 - Moderate Volume", 1, "4", "6-8"),
      buildDay("Day 3 - Dynamic/Explosive", 2, "4", "5-7"),
    ],
  },
  {
    frequency: "4x/week" as const,
    goal: "Advanced split with dedicated strength and hypertrophy days.",
    days: [
      buildDay("Day 1 - Upper Strength", 0, "5", "3-5"),
      buildDay("Day 2 - Lower Strength", 1, "5", "4-6"),
      buildDay("Day 3 - Upper Volume", 2, "4", "8-10"),
      buildDay("Day 4 - Lower Volume + Core", 3, "4", "8-10"),
    ],
  },
  {
    frequency: "5x/week" as const,
    goal: "Competition-style training week with high workload tolerance.",
    days: [
      buildDay("Day 1 - Pressing Power", 0, "5", "3-5"),
      buildDay("Day 2 - Squat Dominant", 1, "5", "4-6"),
      buildDay("Day 3 - Pull/Arms Density", 2, "4", "6-8"),
      buildDay("Day 4 - Hypertrophy Blast", 3, "4", "10-12"),
      buildDay("Day 5 - Athletic Conditioning", 4, "3-4", "8-10"),
    ],
  },
];

export default function ExpertPage() {
  return (
    <DifficultyProgramPage
      level="Expert"
      levelPath="/expert"
      programs={programs}
    />
  );
}
