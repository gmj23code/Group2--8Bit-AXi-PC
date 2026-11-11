import { labelFor } from "./options";
import type { Analysis, ModelItem, Preferences } from "./schema";
import { applyRules, verdictForScore } from "./scoring";

// Demo mode: a fake café menu with hand-written nutrition judgments, scored against
// the user's REAL preferences on-device. Works with no Wi-Fi and no API key, and
// still reacts when you change your preferences, which makes for a better pitch.

export const DEMO_MENU_IMAGE = "/demo/sample-menu.svg";

type GoalScores = Record<string, number>; // goal id → 0-100 fit

type DemoDish = {
  name: string;
  description: string;
  price: string;
  /** Restriction ids it breaks + allergen ids it contains. */
  breaks: string[];
  /** Rules a real server would need to confirm. */
  unsure: string[];
  goals: GoalScores;
  reasons: string[];
  tags: string[];
};

// Goal order for the compact score arrays below.
const G = ["healthy", "high_protein", "low_carb", "keto", "low_calorie", "low_sodium", "low_sugar", "gut_friendly", "heart_healthy", "high_fiber"];
const g = (...v: number[]): GoalScores => Object.fromEntries(G.map((id, i) => [id, v[i]]));

const MEAT_NOT_VEG = ["vegetarian", "vegan", "pescatarian"];

const DISHES: DemoDish[] = [
  {
    name: "Grilled Salmon Bowl",
    description: "Salmon, quinoa, avocado, kale, lemon-tahini dressing",
    price: "$16",
    breaks: ["vegetarian", "vegan", "fish", "sesame"],
    unsure: [],
    goals: g(92, 90, 55, 50, 75, 70, 90, 80, 95, 75),
    reasons: ["Grilled fish and greens make a balanced meal.", "Lots of protein and healthy fats."],
    tags: ["High protein", "Omega-3s", "Contains fish", "Contains sesame"],
  },
  {
    name: "Garden Lentil Soup",
    description: "Red lentils, carrots, celery, cumin. Vegan and gluten-free",
    price: "$8",
    breaks: [],
    unsure: [],
    goals: g(88, 60, 40, 20, 85, 45, 85, 85, 85, 95),
    reasons: ["Packed with fiber and plant protein.", "Soups can be salty, so it's not the best low-sodium pick."],
    tags: ["Vegan", "High fiber", "Gluten-free"],
  },
  {
    name: "Tofu Veggie Stir-Fry",
    description: "Tofu, broccoli, peppers, brown rice, soy-ginger sauce",
    price: "$13",
    breaks: ["soy", "wheat", "gluten_free"],
    unsure: ["peanuts", "tree_nuts"],
    goals: g(82, 65, 35, 15, 75, 25, 70, 75, 78, 80),
    reasons: ["Lots of vegetables and brown rice.", "Soy sauce adds a lot of salt.", "Woks are often shared with peanut dishes."],
    tags: ["Vegan", "Contains soy", "High fiber"],
  },
  {
    name: "Greek Yogurt Parfait",
    description: "Greek yogurt, granola, berries, honey",
    price: "$7",
    breaks: ["vegan", "dairy_free", "milk"],
    unsure: ["tree_nuts", "gluten_free"],
    goals: g(70, 70, 30, 10, 70, 95, 30, 95, 70, 55),
    reasons: ["Yogurt is great for your gut.", "Honey and granola add sugar."],
    tags: ["Gut-friendly", "Contains dairy", "Vegetarian"],
  },
  {
    name: "Chicken Caesar Salad",
    description: "Romaine, grilled chicken, parmesan, croutons, Caesar dressing",
    price: "$13",
    breaks: [...MEAT_NOT_VEG, "dairy_free", "gluten_free", "kosher", "milk", "eggs", "wheat", "fish"],
    unsure: ["halal"],
    goals: g(65, 80, 60, 60, 60, 35, 85, 50, 55, 45),
    reasons: ["Good protein from grilled chicken.", "Caesar dressing usually has anchovy and egg."],
    tags: ["High protein", "Contains dairy", "Contains egg"],
  },
  {
    name: "Shrimp Tacos",
    description: "Corn tortillas, grilled shrimp, cabbage slaw, chipotle mayo",
    price: "$15",
    breaks: ["vegetarian", "vegan", "kosher", "shellfish", "eggs"],
    unsure: ["gluten_free"],
    goals: g(65, 75, 35, 25, 65, 45, 80, 60, 60, 50),
    reasons: ["Lean shrimp and fresh slaw.", "The mayo adds fat and egg."],
    tags: ["Contains shellfish", "Contains egg", "Spicy"],
  },
  {
    name: "Steak & Eggs",
    description: "Sirloin steak, two fried eggs, roasted potatoes",
    price: "$19",
    breaks: [...MEAT_NOT_VEG, "eggs"],
    unsure: ["halal", "kosher"],
    goals: g(45, 95, 50, 70, 35, 40, 95, 35, 30, 20),
    reasons: ["One of the highest-protein dishes here.", "Red meat and fried eggs are heavy on the heart."],
    tags: ["High protein", "Red meat", "Contains egg"],
  },
  {
    name: "Margherita Pizza",
    description: "Tomato sauce, fresh mozzarella, basil",
    price: "$12",
    breaks: ["vegan", "dairy_free", "gluten_free", "milk", "wheat"],
    unsure: ["kosher", "halal"],
    goals: g(40, 45, 10, 5, 35, 25, 70, 40, 40, 30),
    reasons: ["Simple and vegetarian.", "Lots of refined carbs and salty cheese."],
    tags: ["Vegetarian", "Contains dairy", "Contains wheat"],
  },
  {
    name: "Pesto Pasta",
    description: "Linguine, basil pesto, pine nuts, parmesan",
    price: "$14",
    breaks: ["vegan", "dairy_free", "gluten_free", "tree_nuts", "milk", "wheat"],
    unsure: ["kosher"],
    goals: g(40, 35, 5, 5, 30, 45, 75, 40, 50, 35),
    reasons: ["Mostly pasta, so it's high in carbs.", "Pesto has pine nuts and cheese."],
    tags: ["Vegetarian", "Contains nuts", "Contains dairy"],
  },
  {
    name: "Classic Cheeseburger & Fries",
    description: "Beef patty, cheddar, brioche bun, fries",
    price: "$14",
    breaks: [...MEAT_NOT_VEG, "dairy_free", "gluten_free", "kosher", "milk", "wheat", "eggs"],
    unsure: ["halal"],
    goals: g(20, 70, 15, 20, 10, 10, 50, 20, 15, 20),
    reasons: ["Fried sides and a big bun make it heavy.", "Very high in salt and fat."],
    tags: ["Fried", "Contains dairy", "Contains wheat"],
  },
  {
    name: "Fresh Mint Lemonade",
    description: "Lemon, mint, cane sugar",
    price: "$4",
    breaks: [],
    unsure: [],
    goals: g(45, 0, 20, 5, 50, 100, 15, 50, 60, 0),
    reasons: ["Refreshing, but most of it is sugar."],
    tags: ["Vegan", "Sugary"],
  },
  {
    name: "Chocolate Lava Cake",
    description: "Warm chocolate cake with a molten center, vanilla ice cream",
    price: "$9",
    breaks: ["vegan", "dairy_free", "gluten_free", "milk", "eggs", "wheat"],
    unsure: ["tree_nuts"],
    goals: g(10, 15, 5, 5, 5, 70, 0, 10, 10, 10),
    reasons: ["A treat: lots of sugar and butter."],
    tags: ["Dessert", "Sugary", "Contains dairy"],
  },
];

/** Weighted average of goal fits: goal #1 counts N times, #2 N-1 times, and so on. */
function weightedScore(goals: GoalScores, prefs: Preferences): number {
  const ranked = prefs.goals.filter((id) => id in goals);
  if (ranked.length === 0) return goals.healthy;
  let total = 0;
  let weights = 0;
  ranked.forEach((id, i) => {
    const w = ranked.length - i;
    total += goals[id] * w;
    weights += w;
  });
  return Math.round(total / weights);
}

/** The user's chosen rule ids → the labels shown in the UI (matches the AI path). */
function toLabels(ids: string[], prefs: Preferences): string[] {
  return ids.flatMap((id) => {
    if (prefs.restrictions.includes(id)) return [labelFor(id)];
    if (prefs.allergies.includes(id)) return [`${labelFor(id)} allergy`];
    return [];
  });
}

export function runDemo(prefs: Preferences): Analysis {
  const raw: ModelItem[] = DISHES.map((d) => {
    const violates = toLabels(d.breaks, prefs);
    const unsure = toLabels(d.unsure, prefs);
    const score = weightedScore(d.goals, prefs);
    const reasons = [
      ...(violates.length ? [`Not safe for you: ${violates.join(", ")}.`] : []),
      ...(!violates.length && unsure.length ? [`Ask your server about: ${unsure.join(", ")}.`] : []),
      ...d.reasons,
    ];
    return {
      name: d.name,
      description: d.description,
      price: d.price,
      score,
      verdict: violates.length ? "avoid" : unsure.length ? "ask_server" : verdictForScore(score),
      reasons,
      tags: d.tags,
      violatesRestrictions: violates,
      uncertainAbout: unsure,
    };
  });

  return {
    items: applyRules(raw, prefs),
    source: "demo",
    analyzedAt: new Date().toISOString(),
  };
}
