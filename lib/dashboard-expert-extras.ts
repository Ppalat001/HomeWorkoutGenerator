import type { AdaptiveLevel } from "@/lib/workout-types";

export function showExpertDashboardExtras(level: AdaptiveLevel): boolean {
  return level === "expert";
}

/** Big external events to aim for in challenge mode (expert only). */
export const EXPERT_CHALLENGE_IDEAS: string[] = [
  "Run a marathon",
  "Join a Spartan race or similar obstacle challenge",
  "Complete a long-distance trail event (e.g. 50 km ultra or staged hike)",
];

export type NutritionDayPlan = {
  label: string;
  meals: string[];
};

/** Generic one-week template: high protein, structured meals—not personalized medical advice. */
export const WEEKLY_NUTRITION_PLAN_RIPPED: NutritionDayPlan[] = [
  {
    label: "Monday — reset & structure",
    meals: [
      "Breakfast: Greek yogurt, berries, handful of oats, black coffee or tea.",
      "Lunch: Grilled chicken or tofu salad with olive oil and mixed vegetables.",
      "Snack: Apple and a small handful of almonds.",
      "Dinner: Baked white fish or lean beef, large portion of greens, small serving of rice or potato.",
    ],
  },
  {
    label: "Tuesday — training fuel",
    meals: [
      "Breakfast: Omelette (2–3 eggs) with spinach, whole-grain toast.",
      "Lunch: Turkey or chickpea bowl with quinoa, cucumber, tomato, lemon.",
      "Snack: Protein shake or cottage cheese with cucumber.",
      "Dinner: Stir-fry lean protein with broccoli, peppers, minimal oil; optional small noodles or rice.",
    ],
  },
  {
    label: "Wednesday — steady protein",
    meals: [
      "Breakfast: Overnight oats with protein powder, chia, cinnamon.",
      "Lunch: Tuna or tempeh wrap with lots of lettuce, mustard instead of mayo.",
      "Snack: Carrots and hummus.",
      "Dinner: Lean mince with tomato sauce and zucchini noodles or whole-wheat pasta (small portion).",
    ],
  },
  {
    label: "Thursday — volume & greens",
    meals: [
      "Breakfast: Scrambled eggs, smoked salmon or lean ham, cherry tomatoes.",
      "Lunch: Lentil soup with side salad and olive oil dressing.",
      "Snack: Rice cakes with peanut butter (thin spread).",
      "Dinner: Grilled shrimp or chicken skewers, roasted vegetables, side of beans.",
    ],
  },
  {
    label: "Friday — lighter evening",
    meals: [
      "Breakfast: Protein smoothie (milk or plant milk, banana, spinach, protein).",
      "Lunch: Sushi-style bowl: brown rice, sashimi or edamame, seaweed, pickled veg.",
      "Snack: Hard-boiled eggs or edamame.",
      "Dinner: Big salad with grilled protein, seeds, light vinaigrette; skip heavy carbs if you prefer.",
    ],
  },
  {
    label: "Saturday — social & control",
    meals: [
      "Breakfast: Whole-grain pancakes or toast with eggs on the side.",
      "Lunch: Choose lean protein + vegetables; limit fried food and creamy sauces.",
      "Snack: Fruit or a small protein bar (check sugar).",
      "Dinner: Homemade burger: lean patty, whole bun or lettuce wrap, side salad instead of large fries.",
    ],
  },
  {
    label: "Sunday — prep & repeat",
    meals: [
      "Breakfast: Frittata with vegetables, one slice whole-grain bread.",
      "Lunch: Roast chicken or tofu meal-prep with roasted roots and greens.",
      "Snack: Greek yogurt with nuts.",
      "Dinner: Soup or chili with lean meat or beans; prep extra for the week ahead.",
    ],
  },
];
