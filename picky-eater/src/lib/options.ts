// The choices shown in the Preferences picker.
// `id` is what we store and send to the AI; `label` is what people see.

export type Option = { id: string; label: string; emoji: string };

/** Hard rules: diets people follow for ethics, religion, or medical reasons. Pass/fail. */
export const RESTRICTIONS: Option[] = [
  { id: "vegetarian", label: "Vegetarian", emoji: "🥕" },
  { id: "vegan", label: "Vegan", emoji: "🌱" },
  { id: "pescatarian", label: "Pescatarian", emoji: "🐟" },
  { id: "kosher", label: "Kosher", emoji: "✡️" },
  { id: "halal", label: "Halal", emoji: "☪️" },
  { id: "gluten_free", label: "Gluten-free", emoji: "🌾" },
  { id: "dairy_free", label: "Dairy-free", emoji: "🥛" },
  { id: "no_pork", label: "No pork", emoji: "🐖" },
  { id: "no_alcohol", label: "No alcohol", emoji: "🍷" },
];

/** Hard rules: the 9 major food allergens. Pass/fail. */
export const ALLERGIES: Option[] = [
  { id: "peanuts", label: "Peanuts", emoji: "🥜" },
  { id: "tree_nuts", label: "Tree nuts", emoji: "🌰" },
  { id: "milk", label: "Milk", emoji: "🧀" },
  { id: "eggs", label: "Eggs", emoji: "🥚" },
  { id: "wheat", label: "Wheat", emoji: "🍞" },
  { id: "soy", label: "Soy", emoji: "🫘" },
  { id: "fish", label: "Fish", emoji: "🐠" },
  { id: "shellfish", label: "Shellfish", emoji: "🦐" },
  { id: "sesame", label: "Sesame", emoji: "🥯" },
];

/** Soft goals: these shape the 0–100 score, weighted by the user's ranking. */
export const GOALS: Option[] = [
  { id: "healthy", label: "Healthy overall", emoji: "💚" },
  { id: "high_protein", label: "High protein", emoji: "💪" },
  { id: "low_carb", label: "Low carb", emoji: "🥗" },
  { id: "keto", label: "Keto", emoji: "🥑" },
  { id: "low_calorie", label: "Low calorie", emoji: "🪶" },
  { id: "low_sodium", label: "Low sodium", emoji: "🧂" },
  { id: "low_sugar", label: "Low sugar", emoji: "🍬" },
  { id: "gut_friendly", label: "Gut-friendly", emoji: "🫶" },
  { id: "heart_healthy", label: "Heart-healthy", emoji: "❤️" },
  { id: "high_fiber", label: "High fiber", emoji: "🥦" },
];

const ALL = [...RESTRICTIONS, ...ALLERGIES, ...GOALS];

export function labelFor(id: string): string {
  return ALL.find((o) => o.id === id)?.label ?? id;
}
