// Shapes for the Demo mode menu library. Every menu is made up (no real restaurants).
//
// Each dish carries two kinds of text:
// - what's PRINTED on the menu, in the menu's own language (name, optional printed line)
// - what Picky Eater SHOWS in results, in English (englishName, description)
// plus an ingredient list (in English) that the offline scorer checks against the
// user's built-in and custom "+ Other" rules.

export const GOAL_ORDER = [
  "healthy",
  "high_protein",
  "low_carb",
  "low_calorie",
  "low_sodium",
  "low_sugar",
  "gut_friendly",
  "heart_healthy",
  "high_fiber",
] as const;
export type GoalId = (typeof GOAL_ORDER)[number];
export type GoalFit = Record<GoalId, number>;

/**
 * Goal fits 0–100 in GOAL_ORDER: healthy, protein, low-carb, low-cal, low-sodium, low-sugar, gut, heart, fiber.
 * The scorer caps drinks at 60 so a drink never becomes the "Top pick" for a meal.
 */
export const g = (...v: number[]): GoalFit => Object.fromEntries(GOAL_ORDER.map((id, i) => [id, v[i]])) as GoalFit;

export type DemoDish = {
  page: number;
  /** Section key in English; the menu prints `sections[section]`. */
  section: string;
  /** Printed name, in the menu's language and script. */
  name: string;
  /** English name shown under the printed one (omit on English menus). */
  englishName?: string;
  price: string;
  /** Optional line printed under the name, in the menu's language. Omit = "no description" dish. */
  printed?: string;
  /** Short English description shown in results. */
  description: string;
  /** What's really in it (English). The scorer checks rules against these. */
  ingredients: string[];
  goals: GoalFit;
  reasons: string[];
  tags: string[];
  /** Rules staff must confirm: built-in rule ids, or "ALL" / "ALL_ALLERGENS" for vague dishes. */
  unsure?: string[] | "ALL" | "ALL_ALLERGENS";
  /** A drink outside a "Drinks" section (e.g. chai under "Sweets & drinks"). */
  drink?: boolean;
};

export type DemoTheme = "trattoria" | "izakaya" | "taqueria" | "lebanese" | "indian" | "deli";

export type DemoMenu = {
  id: string;
  theme: DemoTheme;
  /** Restaurant name as printed (local script), plus a Latin-script version for cards. */
  restaurant: string;
  restaurantLatin: string;
  tagline: string;
  cuisine: string;
  language: { code: string; english: string; native: string };
  dir: "ltr" | "rtl";
  /** Printed page titles, with English versions for the app's UI. */
  pages: { number: number; title: string; titleEnglish: string }[];
  /** English section key → printed heading. Keys are listed in menu order. */
  sections: Record<string, string>;
  /** Printed footer note. */
  footer: string;
  /** Certifications that cover the whole menu (e.g. a fully halal or kosher kitchen). */
  certified?: ("halal" | "kosher")[];
  /** One line for the gallery card: what this menu is good for testing. */
  highlight: string;
  dishes: DemoDish[];
};
