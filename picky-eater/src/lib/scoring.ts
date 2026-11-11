import { ALLERGIES, RESTRICTIONS, labelFor } from "./options";
import type { MenuItem, ModelItem, Preferences, Verdict } from "./schema";

// Server-side safety rules. We never trust the AI alone for the hard rules:
// after the model answers, this code caps scores, forces verdicts, and adds a
// simple keyword check as a second line of defense. Shared by the API and Demo mode.

export const HARD_CAP = 10; // max score for anything that breaks a diet or allergy
export const ASK_CAP = 50; // unclear items can't look like a top pick until confirmed

/** The exact labels we send to the model and expect back in violatesRestrictions. */
export function hardRuleLabels(prefs: Preferences): string[] {
  return [
    ...prefs.restrictions.map(labelFor),
    ...prefs.allergies.map((a) => `${labelFor(a)} allergy`),
  ];
}

/**
 * Obvious words that suggest a rule may be broken. Deliberately small: it only ever
 * ADDS an "Ask your server" flag, never removes a warning, so a false hit is the safe failure.
 */
const MEAT = ["chicken", "beef", "steak", "pork", "bacon", "ham", "lamb", "veal", "duck", "turkey", "sausage", "pepperoni", "prosciutto", "chorizo", "meatball", "burger"];
const SEAFOOD = ["fish", "salmon", "tuna", "cod", "anchov", "shrimp", "prawn", "crab", "lobster", "clam", "mussel", "oyster", "scallop", "calamari", "squid"];
const PORK = ["pork", "bacon", "ham", "prosciutto", "pancetta", "chorizo", "pepperoni", "carnitas", "lard"];
const DAIRY = ["cheese", "cream", "butter", "milk", "yogurt", "parmesan", "mozzarella", "feta", "ricotta", "burrata", "queso", "ghee", "alfredo"];

const KEYWORDS: Record<string, string[]> = {
  // allergies
  peanuts: ["peanut"],
  tree_nuts: ["almond", "walnut", "cashew", "pecan", "pistachio", "hazelnut", "pine nut", "macadamia", "pesto"],
  milk: DAIRY,
  eggs: ["egg", "mayo", "aioli", "hollandaise", "carbonara", "meringue"],
  wheat: ["bread", "pasta", "noodle", "flour", "bun", "tortilla", "croissant", "crouton", "breaded", "panko", "pizza", "wheat"],
  soy: ["soy", "tofu", "edamame", "miso", "tempeh"],
  fish: ["fish", "salmon", "tuna", "cod", "anchov", "tilapia", "halibut", "trout"],
  shellfish: ["shrimp", "prawn", "crab", "lobster", "clam", "mussel", "oyster", "scallop"],
  sesame: ["sesame", "tahini", "hummus"],
  // diets
  vegetarian: [...MEAT, ...SEAFOOD],
  vegan: [...MEAT, ...SEAFOOD, ...DAIRY, "egg", "honey", "mayo", "aioli"],
  pescatarian: MEAT,
  no_pork: PORK,
  halal: PORK,
  kosher: [...PORK, "shrimp", "prawn", "crab", "lobster", "clam", "mussel", "oyster", "scallop"],
  dairy_free: DAIRY,
  gluten_free: ["bread", "pasta", "noodle", "flour", "bun", "tortilla", "croissant", "crouton", "breaded", "panko", "pizza", "wheat", "barley", "beer"],
  no_alcohol: ["wine", "beer", "vodka", "rum", "bourbon", "whiskey", "tequila", "sake", "cocktail"],
};

// Phrases that contain a keyword but are usually fine ("eggplant" isn't egg).
const SAFE_PHRASES = [
  /\beggplant\w*/g,
  /\bbutternut\w*/g,
  /\b(oat|soy|almond|coconut|rice|plant)[- ]milk\b/g,
  /\bvegan [a-z]+/g,
  /\b[a-z]+[- ]free\b/g, // "dairy-free", "nut free", "gluten-free"
];

function hasWord(text: string, keyword: string) {
  // Word start only, so plurals match ("eggs") but "champagne" doesn't match "ham".
  return new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`).test(text);
}

/** Hard rules whose trigger words appear in the dish's name or description. */
function keywordHits(item: Pick<ModelItem, "name" | "description">, prefs: Preferences): string[] {
  let text = `${item.name} ${item.description ?? ""}`.toLowerCase();
  for (const p of SAFE_PHRASES) text = text.replace(p, " ");
  const hits: string[] = [];
  for (const id of prefs.allergies) {
    if (KEYWORDS[id]?.some((k) => hasWord(text, k))) hits.push(`${labelFor(id)} allergy`);
  }
  for (const id of prefs.restrictions) {
    if (KEYWORDS[id]?.some((k) => hasWord(text, k))) hits.push(labelFor(id));
  }
  return hits;
}

/** Score bands → verdict. Kept in one place so badges and verdicts always agree. */
export function verdictForScore(score: number): Exclude<Verdict, "ask_server"> {
  if (score >= 80) return "great";
  if (score >= 50) return "okay";
  return "avoid";
}

const VALID_IDS = new Set([...ALLERGIES, ...RESTRICTIONS].map((o) => o.id));

/** Applies the hard rules to raw model output and returns frontend-ready, sorted items. */
export function applyRules(raw: ModelItem[], prefs: Preferences): MenuItem[] {
  const allowed = new Set(hardRuleLabels(prefs));
  // Ignore any rules the user didn't actually pick (keeps the model from inventing warnings).
  const clean = (labels: string[]) => [...new Set(labels.filter((l) => allowed.has(l)))];

  // Defensive: prefs come from the client; ignore unknown ids.
  const safePrefs: Preferences = {
    ...prefs,
    allergies: prefs.allergies.filter((id) => VALID_IDS.has(id)),
    restrictions: prefs.restrictions.filter((id) => VALID_IDS.has(id)),
  };

  const items = raw
    .filter((r) => r.name.trim().length > 0)
    .map((r, i): MenuItem => {
      const violations = clean(r.violatesRestrictions);
      // A keyword hit the model didn't flag → never shown as safe; ask staff to confirm.
      const askAbout = clean([...r.uncertainAbout, ...keywordHits(r, safePrefs)]).filter(
        (l) => !violations.includes(l),
      );
      let score = Math.round(Math.min(100, Math.max(0, Number.isFinite(r.score) ? r.score : 0)));
      let verdict: Verdict;

      if (violations.length > 0) {
        // Squash into 0–10 (keeps relative order among unsafe dishes).
        score = Math.round((score / 100) * HARD_CAP);
        verdict = "avoid";
      } else if (askAbout.length > 0 || r.verdict === "ask_server") {
        score = Math.min(score, ASK_CAP);
        verdict = "ask_server";
      } else {
        verdict = verdictForScore(score);
      }

      return {
        id: `${i}-${slug(r.name)}`,
        name: r.name.trim(),
        description: r.description?.trim() || undefined,
        price: r.price?.trim() || undefined,
        score,
        verdict,
        reasons: r.reasons.slice(0, 4),
        tags: [...new Set(r.tags)].slice(0, 6),
        violatesRestrictions: violations,
        askAbout,
      };
    });

  // Highest score first, but anything that breaks a hard rule always sinks below
  // safe dishes, even a safe dish with a very low score.
  const unsafe = (i: MenuItem) => (i.violatesRestrictions.length > 0 ? 1 : 0);
  return items.sort((a, b) => unsafe(a) - unsafe(b) || b.score - a.score);
}

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 40) || "item";
}
