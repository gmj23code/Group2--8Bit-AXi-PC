import { DEMO_DISHES, DEMO_PAGES, type DemoDish } from "./demo-menu";
import { hardRules, rulesMentionedIn, type HardRule } from "./rules";
import { PreferencesSchema, type Analysis, type Preferences } from "./schema";
import { applyRules, verdictForScore, type RawItem } from "./scoring";

// Demo mode: scores the "Harbor & Vine" sample menu against the user's REAL preferences,
// on-device, with no network and no API key. Unlike a real scan, the demo knows every
// dish's ingredients, so it can check custom "+ Other" rules precisely:
//   - a rule whose trigger words appear in the ingredients → broken (red, 0–10)
//   - a rule the menu says is uncertain (shared fryer, "may contain", daily specials) → Ask your server
//   - meat without halal certification → Ask your server (halal, kosher); meat + dairy → breaks kosher

export { DEMO_PAGES };

// Probes reuse the real keyword lists to detect meat and dairy in a dish.
const MEAT_PROBE = hardRules(PreferencesSchema.parse({ restrictions: ["pescatarian"] }));
const DAIRY_PROBE = hardRules(PreferencesSchema.parse({ allergies: ["milk"] }));

/** Weighted average of goal fits: goal #1 counts N times, #2 N-1 times, and so on. */
function weightedScore(dish: DemoDish, prefs: Preferences): number {
  const goals = dish.goals as Record<string, number>;
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

function unsureLabels(dish: DemoDish, rules: HardRule[]): string[] {
  if (!dish.unsure) return [];
  if (dish.unsure === "ALL") return rules.map((r) => r.label);
  if (dish.unsure === "ALL_ALLERGENS") return rules.filter((r) => r.kind === "allergy").map((r) => r.label);
  const ids = dish.unsure;
  return rules.filter((r) => r.id && ids.includes(r.id)).map((r) => r.label);
}

export function runDemo(prefs: Preferences): Analysis {
  const rules = hardRules(prefs);
  const labelOf = (id: string) => rules.find((r) => r.id === id)?.label;

  const raw: RawItem[] = DEMO_DISHES.map((d) => {
    const text = [d.name, d.description, ...d.ingredients].join(" ");
    const violates = new Set(rulesMentionedIn(text, rules));
    const unsure = new Set(unsureLabels(d, rules));

    const hasMeat = rulesMentionedIn(text, MEAT_PROBE).length > 0;
    const hasDairy = rulesMentionedIn(text, DAIRY_PROBE).length > 0;
    const kosher = labelOf("kosher");
    const halal = labelOf("halal");
    if (hasMeat && hasDairy && kosher) violates.add(kosher);
    if (hasMeat && kosher && !d.certified?.includes("kosher")) unsure.add(kosher);
    if (hasMeat && halal && !d.certified?.includes("halal")) unsure.add(halal);
    for (const l of violates) unsure.delete(l);

    const score = weightedScore(d, prefs);
    return {
      name: d.name,
      englishName: null,
      description: d.description,
      price: d.price,
      score,
      verdict: violates.size ? "avoid" : unsure.size ? "ask_server" : verdictForScore(score),
      // Warnings are shown separately on the card, so reasons stay about the food itself.
      reasons: d.reasons,
      tags: d.tags,
      violatesRestrictions: [...violates],
      uncertainAbout: [...unsure],
      ingredients: d.ingredients,
      page: d.page,
      section: d.section,
    };
  });

  return {
    items: applyRules(raw, prefs),
    source: "demo",
    pages: DEMO_PAGES.map((p) => ({
      ...p,
      sections: [...new Set(DEMO_DISHES.filter((d) => d.page === p.number).map((d) => d.section))],
    })),
    analyzedAt: new Date().toISOString(),
  };
}
