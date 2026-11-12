// The choices shown in the Preferences picker.
// `id` is what we store; `label` is what people see; `aliases` help the search box
// ("dairy" finds Milk, "shrimp" finds Shellfish); `question` is what to ask staff.

export type Option = { id: string; label: string; aliases?: string[]; question?: string };

/** Hard rules: diets people follow for ethics, religion, health, or medical reasons. Pass/fail. */
export const RESTRICTIONS: Option[] = [
  { id: "vegetarian", label: "Vegetarian", aliases: ["veggie", "no meat"], question: "Is this dish vegetarian, with no meat, fish, or meat stock?" },
  { id: "vegan", label: "Vegan", aliases: ["plant-based", "plant based"], question: "Is this dish vegan, with no dairy, eggs, or honey?" },
  { id: "pescatarian", label: "Pescatarian", aliases: ["fish only"], question: "Is there any meat or poultry in this dish?" },
  { id: "kosher", label: "Kosher", question: "Is this dish kosher?" },
  { id: "halal", label: "Halal", question: "Is the meat halal, and is there any pork or alcohol in this dish?" },
  { id: "gluten_free", label: "Gluten-free", aliases: ["celiac", "coeliac", "no gluten"], question: "Is this dish gluten-free, and is it cooked separately from bread or pasta?" },
  { id: "dairy_free", label: "Dairy-free", aliases: ["lactose", "no dairy"], question: "Is there any milk, butter, cream, or cheese in this dish?" },
  { id: "jain", label: "Jain", aliases: ["no root vegetables"], question: "Does this dish have meat, eggs, honey, or root vegetables like onion, garlic, or potato?" },
  { id: "paleo", label: "Paleo", question: "Does this dish have grains, beans, dairy, or added sugar?" },
  { id: "low_fodmap", label: "Low-FODMAP", aliases: ["fodmap", "ibs"], question: "Does this dish have garlic, onion, wheat, beans, or honey?" },
  { id: "keto", label: "Keto", aliases: ["ketogenic", "low carb"], question: "Is there bread, rice, pasta, potato, or sugar in this dish?" },
  { id: "no_pork", label: "No pork", aliases: ["pork", "bacon", "ham"], question: "Is there any pork, bacon, or ham in this dish, including the stock?" },
  { id: "no_beef", label: "No beef", aliases: ["beef"], question: "Is there any beef in this dish, including the stock?" },
  { id: "no_alcohol", label: "No alcohol", aliases: ["alcohol", "wine"], question: "Is there any alcohol in this dish or its sauce?" },
];

/** Hard rules: the 9 major allergens, plus other common allergies and intolerances. Pass/fail. */
export const ALLERGIES: Option[] = [
  { id: "peanuts", label: "Peanuts", aliases: ["groundnut", "nuts"] },
  { id: "tree_nuts", label: "Tree nuts", aliases: ["nuts", "almond", "walnut", "cashew", "pecan", "pistachio", "hazelnut"] },
  { id: "milk", label: "Milk", aliases: ["dairy", "lactose", "cheese"] },
  { id: "eggs", label: "Eggs", aliases: ["egg"] },
  { id: "fish", label: "Fish", aliases: ["seafood", "salmon", "tuna"] },
  { id: "shellfish", label: "Shellfish", aliases: ["seafood", "shrimp", "prawn", "crab", "lobster", "crustacean", "mollusc"] },
  { id: "wheat", label: "Wheat", aliases: ["flour", "bread"] },
  { id: "soy", label: "Soy", aliases: ["soya", "tofu"] },
  { id: "sesame", label: "Sesame", aliases: ["tahini"] },
  { id: "mustard", label: "Mustard" },
  { id: "celery", label: "Celery", aliases: ["celeriac"] },
  { id: "lupin", label: "Lupin", aliases: ["lupine"] },
  { id: "sulfites", label: "Sulfites", aliases: ["sulphites", "sulphur", "wine"] },
  { id: "corn", label: "Corn", aliases: ["maize"] },
  { id: "gluten", label: "Gluten", aliases: ["celiac", "coeliac", "barley", "rye"] },
  { id: "nightshades", label: "Nightshades", aliases: ["tomato", "potato", "pepper", "eggplant", "aubergine"] },
  { id: "garlic_onion", label: "Garlic & onion", aliases: ["garlic", "onion", "allium", "shallot", "leek"] },
  { id: "legumes", label: "Legumes", aliases: ["beans", "lentils", "chickpeas", "peas", "pulses"] },
  { id: "coconut", label: "Coconut" },
  { id: "kiwi", label: "Kiwi" },
  { id: "stone_fruits", label: "Stone fruits", aliases: ["peach", "cherry", "plum", "apricot", "nectarine"] },
];

/** Soft goals: these shape the 0–100 score, weighted by the user's ranking. (Keto is a diet.) */
export const GOALS: Option[] = [
  { id: "healthy", label: "Healthy overall" },
  { id: "high_protein", label: "High protein" },
  { id: "low_carb", label: "Low carb" },
  { id: "low_calorie", label: "Low calorie" },
  { id: "low_sodium", label: "Low sodium" },
  { id: "low_sugar", label: "Low sugar" },
  { id: "gut_friendly", label: "Gut-friendly" },
  { id: "heart_healthy", label: "Heart-healthy" },
  { id: "high_fiber", label: "High fiber" },
];

const ALL = [...RESTRICTIONS, ...ALLERGIES, ...GOALS];

export function labelFor(id: string): string {
  return ALL.find((o) => o.id === id)?.label ?? id;
}

/* ---------- Custom "Other" entries ---------- */

export const CUSTOM_MAX_LENGTH = 40;
export const CUSTOM_MAX_COUNT = 15;

/**
 * Cleans a typed entry: trims, collapses spaces, and removes characters that have no
 * place in a food name (brackets, quotes, control characters). Returns "" if nothing's left.
 */
export function normalizeEntry(text: string): string {
  return text
    .normalize("NFKC")
    .replace(/[\u0000-\u001f\u007f<>{}[\]"`\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, CUSTOM_MAX_LENGTH)
    .trim();
}

/** Cleans and de-duplicates (case-insensitively) a list of custom entries. */
export function cleanCustomList(list: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of list) {
    const entry = normalizeEntry(raw);
    const key = entry.toLowerCase();
    if (!entry || seen.has(key)) continue;
    seen.add(key);
    out.push(entry);
  }
  return out.slice(0, CUSTOM_MAX_COUNT);
}

/**
 * Finds the built-in option the typed text means, if it's unambiguous: an exact label
 * ("Peanuts", "no pork") or a synonym that belongs to only one option ("shrimp" → Shellfish,
 * but not "nuts", which could be peanuts or tree nuts).
 */
export function matchBuiltIn(options: Option[], text: string): Option | undefined {
  const t = text.trim().toLowerCase().replace(/^no\s+/, "");
  const byLabel = options.find((o) => o.label.toLowerCase() === t || o.label.toLowerCase() === `no ${t}`);
  if (byLabel) return byLabel;
  const byAlias = options.filter((o) => o.aliases?.includes(t));
  return byAlias.length === 1 ? byAlias[0] : undefined;
}

const VALID = {
  restrictions: new Set(RESTRICTIONS.map((o) => o.id)),
  allergies: new Set(ALLERGIES.map((o) => o.id)),
  goals: new Set(GOALS.map((o) => o.id)),
};

/** Drops ids that aren't (or are no longer) in the lists, e.g. the old "keto" goal. */
export function knownIds(kind: keyof typeof VALID, ids: string[]): string[] {
  return [...new Set(ids.filter((id) => VALID[kind].has(id)))];
}
