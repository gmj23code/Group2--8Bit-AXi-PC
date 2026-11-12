import { hardRules, rulesMentionedIn, type HardRule } from "../rules";
import { PreferencesSchema, type Analysis, type Preferences } from "../schema";
import { applyRules, verdictForScore, type RawItem } from "../scoring";
import { deli } from "./menus/deli";
import { indian } from "./menus/indian";
import { izakaya } from "./menus/izakaya";
import { lebanese } from "./menus/lebanese";
import { taqueria } from "./menus/taqueria";
import { trattoria } from "./menus/trattoria";
import type { DemoDish, DemoMenu } from "./types";

// Demo mode: six made-up restaurants, scored on-device against the user's REAL
// preferences. No network, no API key, never calls the AI. Because the demo knows every
// dish's ingredients, it checks built-in AND custom "+ Other" rules precisely:
//   - a rule whose trigger words appear in the ingredients → broken (red, 0–10)
//   - a rule the menu says is uncertain (shared fryer, "varies", daily specials) → Ask your server
//   - meat without halal/kosher certification → Ask your server; meat + dairy → breaks kosher
//   - words in the printed name/description (e.g. "Egg Cream") → Ask your server (via applyRules)

export const DEMO_MENUS: DemoMenu[] = [trattoria, izakaya, taqueria, lebanese, indian, deli];

export function getDemoMenu(id: string | null | undefined): DemoMenu | undefined {
  return DEMO_MENUS.find((m) => m.id === id);
}

export type { DemoMenu, DemoDish } from "./types";

// Probes reuse the real keyword lists to detect meat and dairy in a dish.
const MEAT_PROBE = hardRules(PreferencesSchema.parse({ restrictions: ["pescatarian"] }));
const DAIRY_PROBE = hardRules(PreferencesSchema.parse({ allergies: ["milk"] }));

/**
 * Drinks top out at 60 (still "Good"): lemonade is technically low-sodium and coffee is
 * low-calorie, but neither should be anyone's "Top pick" for a meal.
 */
const DRINK_CAP = 60;
const isDrink = (d: DemoDish) => d.drink === true || d.section === "Drinks";

/** Weighted average of goal fits: goal #1 counts N times, #2 N-1 times, and so on. */
function weightedScore(dish: DemoDish, prefs: Preferences): number {
  const goals = dish.goals as Record<string, number>;
  const ranked = prefs.goals.filter((id) => id in goals);
  let score: number;
  if (ranked.length === 0) score = goals.healthy;
  else {
    let total = 0;
    let weights = 0;
    ranked.forEach((id, i) => {
      const w = ranked.length - i;
      total += goals[id] * w;
      weights += w;
    });
    score = Math.round(total / weights);
  }
  return isDrink(dish) ? Math.min(score, DRINK_CAP) : score;
}

function unsureLabels(dish: DemoDish, rules: HardRule[]): string[] {
  if (!dish.unsure) return [];
  if (dish.unsure === "ALL") return rules.map((r) => r.label);
  if (dish.unsure === "ALL_ALLERGENS") return rules.filter((r) => r.kind === "allergy").map((r) => r.label);
  const ids = dish.unsure;
  return rules.filter((r) => r.id && ids.includes(r.id)).map((r) => r.label);
}

/** Scores one demo menu for this diner. Pure function: same input, same output. */
export function runDemo(menu: DemoMenu, prefs: Preferences): Analysis {
  const rules = hardRules(prefs);
  const labelOf = (id: string) => rules.find((r) => r.id === id)?.label;

  const raw: RawItem[] = menu.dishes.map((d) => {
    // The ingredient list is the truth: anything matched there breaks the rule.
    const ingredientText = d.ingredients.join(", ");
    const violates = new Set(rulesMentionedIn(ingredientText, rules));
    const unsure = new Set(unsureLabels(d, rules));

    const hasMeat = rulesMentionedIn(ingredientText, MEAT_PROBE).length > 0;
    const hasDairy = rulesMentionedIn(ingredientText, DAIRY_PROBE).length > 0;
    const kosher = labelOf("kosher");
    const halal = labelOf("halal");
    const certified = menu.certified ?? [];
    if (hasMeat && hasDairy && kosher) violates.add(kosher);
    if (hasMeat && kosher && !certified.includes("kosher")) unsure.add(kosher);
    if (hasMeat && halal && !certified.includes("halal")) unsure.add(halal);
    for (const l of violates) unsure.delete(l);

    const score = weightedScore(d, prefs);
    return {
      name: d.name,
      englishName: d.englishName ?? null,
      section: d.section,
      description: d.description,
      price: d.price,
      score,
      verdict: violates.size ? "avoid" : unsure.size ? "ask_server" : verdictForScore(score),
      reasons: d.reasons,
      tags: d.tags,
      violatesRestrictions: [...violates],
      uncertainAbout: [...unsure],
      ingredients: d.ingredients,
      page: menu.pages.length > 1 ? d.page : undefined,
    };
  });

  const sectionOrder = Object.keys(menu.sections);
  return {
    items: applyRules(raw, prefs),
    source: "demo",
    menu: { id: menu.id, restaurant: menu.restaurantLatin, cuisine: menu.cuisine, language: menu.language.english },
    pages:
      menu.pages.length > 1
        ? menu.pages.map((p) => ({
            number: p.number,
            title: p.titleEnglish,
            sections: sectionOrder.filter((s) => menu.dishes.some((d) => d.page === p.number && d.section === s)),
          }))
        : undefined,
    sections: menu.pages.length === 1 ? sectionOrder : undefined,
    analyzedAt: new Date().toISOString(),
  };
}
