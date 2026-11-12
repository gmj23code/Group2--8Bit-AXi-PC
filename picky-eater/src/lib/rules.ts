import { ALLERGIES, RESTRICTIONS, type Option } from "./options";
import type { Preferences } from "./schema";

// Every hard rule the user picked (built-in or typed in "+ Other"), in one shape.
// The prompt, the scoring safety net, the demo, and the "Questions for your server"
// screen all read from here, so labels always match exactly.

export type HardRule = {
  /** Exact text shown to the user and sent to the AI, e.g. "Vegan", "Pine nuts allergy". */
  label: string;
  kind: "diet" | "allergy";
  /** Built-in option id, or undefined for a custom entry. */
  id?: string;
  custom: boolean;
  /** A plain question to ask restaurant staff. */
  question: string;
  /** Word starts that suggest the rule may be broken (used only to ADD "Ask your server"). */
  keywords: string[];
  /** Phrases to ignore for this rule only (e.g. "eggplant" for an egg allergy). */
  except: RegExp[];
};

/* ---------- Keyword lists for built-in rules ---------- */

const MEAT = ["chicken", "beef", "steak", "pork", "bacon", "ham", "lamb", "veal", "duck", "turkey", "sausage", "pepperoni", "prosciutto", "chorizo", "meatball", "burger", "brisket", "salami", "pancetta", "lard", "gelatin"];
const SEAFOOD = ["fish", "salmon", "tuna", "cod", "anchov", "shrimp", "prawn", "crab", "lobster", "clam", "mussel", "oyster", "scallop", "calamari", "squid", "octopus", "fish sauce"];
const PORK = ["pork", "bacon", "ham", "prosciutto", "pancetta", "chorizo", "pepperoni", "carnitas", "lard", "salami"];
const DAIRY = ["cheese", "cream", "butter", "milk", "yogurt", "yoghurt", "parmesan", "mozzarella", "feta", "ricotta", "burrata", "queso", "ghee", "alfredo", "paneer", "custard"];
const WHEAT = ["wheat", "bread", "pasta", "noodle", "flour", "bun", "tortilla", "croissant", "crouton", "breaded", "panko", "pizza", "couscous", "seitan", "soy sauce", "naan", "pita", "brioche", "dumpling"];
const GLUTEN = [...WHEAT, "barley", "rye", "beer", "malt"];
const ALCOHOL = ["wine", "beer", "vodka", "rum", "bourbon", "whiskey", "tequila", "sake", "cocktail", "mirin", "brandy", "liqueur", "prosecco"];
const ROOTS = ["onion", "garlic", "potato", "carrot", "beet", "radish", "ginger", "shallot", "leek", "turnip"];
const GRAINS = ["bread", "pasta", "rice", "noodle", "oat", "quinoa", "corn", "flour", "tortilla", "bun", "pizza", "couscous", "granola"];
const BEANS = ["bean", "lentil", "chickpea", "hummus", "edamame", "tofu", "falafel", "dal", "soy", "peanut", "peas", "split pea", "green pea"];
const SUGARY = ["sugar", "honey", "syrup", "cake", "cookie", "brownie", "ice cream", "soda", "juice", "candied", "caramel", "jam"];
const STARCH = ["bread", "pasta", "rice", "noodle", "potato", "fries", "tortilla", "bun", "pizza", "couscous", "oat", "corn", "quinoa", "beans", "lentil"];

/** "Hamburger" contains "ham" but is beef. */
const HAMBURGER = /\bhamburger\w*/g;

/** Meat-free burgers: "burger" alone isn't meat. */
const VEG_BURGER = /\b(black bean|bean|veggie|vegan|vegetarian|plant[- ]based|beyond|impossible|mushroom|tofu|falafel|chickpea|quinoa|lentil) burger\w*/g;

/** Phrases that mention dairy words but usually aren't dairy. */
const PLANT_MILK = /\b(oat|soy|almond|coconut|rice|plant|cashew)[- ](milk|cream|yogurt|yoghurt|butter)\b|\bvegan [a-z]+|\bpeanut butter\b|\bcocoa butter\b/g;

/** Phrases that mention wheat words but are usually wheat-free. */
const NOT_WHEAT = [/\bbuckwheat\b/g, /\brice (noodle|paper|flour)\w*/g, /\bcorn tortilla\w*/g, /\bgluten[- ]free [a-z]+/g];

const BUILT_IN_KEYWORDS: Record<string, { keywords: string[]; except?: RegExp[] }> = {
  // allergies
  peanuts: { keywords: ["peanut", "satay", "groundnut"] },
  tree_nuts: { keywords: ["almond", "walnut", "cashew", "pecan", "pistachio", "hazelnut", "pine nut", "macadamia", "pesto", "praline", "marzipan", "nutella"], except: [/\bbutternut\w*/g, /\bnut[- ]free\b/g] },
  milk: { keywords: DAIRY, except: [PLANT_MILK] },
  eggs: { keywords: ["egg", "mayo", "aioli", "hollandaise", "carbonara", "meringue", "custard", "brioche"], except: [/\beggplant\w*/g, /\bvegan (mayo|aioli)\b/g] },
  fish: { keywords: ["fish", "salmon", "tuna", "cod", "anchov", "tilapia", "halibut", "trout", "sardine", "mackerel", "caesar", "worcestershire"], except: [/\bshellfish\b/g] },
  shellfish: { keywords: ["shrimp", "prawn", "crab", "lobster", "clam", "mussel", "oyster", "scallop", "shellfish", "crayfish", "langoustine"] },
  wheat: { keywords: WHEAT, except: NOT_WHEAT },
  soy: { keywords: ["soy", "tofu", "edamame", "miso", "tempeh", "teriyaki"] },
  sesame: { keywords: ["sesame", "tahini", "hummus", "halva", "furikake"] },
  mustard: { keywords: ["mustard", "dijon"] },
  celery: { keywords: ["celery", "celeriac"] },
  lupin: { keywords: ["lupin"] },
  sulfites: { keywords: ["sulfite", "sulphite", "wine", "dried fruit", "raisin", "prosecco", "vinegar"] },
  corn: { keywords: ["corn", "polenta", "grits", "maize", "popcorn", "nacho", "tortilla chip"], except: [/\bpeppercorn\w*/g, /\bcornish\b/g] },
  gluten: { keywords: GLUTEN, except: NOT_WHEAT },
  nightshades: { keywords: ["tomato", "potato", "pepper", "eggplant", "aubergine", "chili", "chilli", "paprika", "cayenne", "jalapeño", "jalapeno", "salsa", "fries", "ketchup"], except: [/\bsweet potato fries\b/g, /\bsweet potato\w*/g, /\bblack pepper\b/g, /\bpeppercorn\w*/g] },
  garlic_onion: { keywords: ["garlic", "onion", "shallot", "leek", "scallion", "chive", "aioli"] },
  legumes: { keywords: BEANS },
  coconut: { keywords: ["coconut"] },
  kiwi: { keywords: ["kiwi"] },
  stone_fruits: { keywords: ["peach", "plum", "cherry", "cherries", "apricot", "nectarine"], except: [/\bcherry tomato\w*/g] },
  // diets
  vegetarian: { keywords: [...MEAT, ...SEAFOOD], except: [VEG_BURGER] },
  vegan: { keywords: [...MEAT, ...SEAFOOD, ...DAIRY, "egg", "honey", "mayo", "aioli"], except: [PLANT_MILK, VEG_BURGER, /\beggplant\w*/g] },
  pescatarian: { keywords: MEAT, except: [VEG_BURGER] },
  kosher: { keywords: [...PORK, "shrimp", "prawn", "crab", "lobster", "clam", "mussel", "oyster", "scallop", "squid", "calamari"], except: [HAMBURGER] },
  halal: { keywords: [...PORK, ...ALCOHOL], except: [HAMBURGER] },
  gluten_free: { keywords: GLUTEN, except: NOT_WHEAT },
  dairy_free: { keywords: DAIRY, except: [PLANT_MILK] },
  jain: { keywords: [...MEAT, ...SEAFOOD, "egg", "honey", "mushroom", ...ROOTS], except: [VEG_BURGER, /\beggplant\w*/g] },
  paleo: { keywords: [...GRAINS, ...BEANS, ...DAIRY, "sugar", "syrup"], except: [PLANT_MILK] },
  low_fodmap: { keywords: ["garlic", "onion", "shallot", "leek", ...WHEAT, "bean", "lentil", "chickpea", "hummus", "honey", "apple", "mango", "mushroom", "milk", "cream", "yogurt"], except: [PLANT_MILK, ...NOT_WHEAT] },
  keto: { keywords: [...STARCH, ...SUGARY] },
  no_pork: { keywords: PORK, except: [HAMBURGER] },
  no_beef: { keywords: ["beef", "steak", "burger", "brisket", "veal", "oxtail", "pastrami", "meatball", "short rib"], except: [VEG_BURGER] },
  no_alcohol: { keywords: ALCOHOL },
};

/* ---------- Custom entries ---------- */

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** "No mushrooms" → "mushroom"; "Pine nuts" → "pine nut"; "tomatoes" → "tomato". */
function keywordFromCustom(entry: string): string[] {
  const core = entry
    .toLowerCase()
    .replace(/^(no|without|avoid|allergic to|allergy to)\s+/, "")
    .replace(/[- ]free$|\s+allergy$/, "")
    .trim();
  if (core.length < 3) return [];
  const singular = core
    .split(" ")
    .map((w) => (/oes$/.test(w) ? w.slice(0, -2) : /ies$/.test(w) ? w.slice(0, -3) + "y" : /[^s]s$/.test(w) && w.length > 3 ? w.slice(0, -1) : w))
    .join(" ");
  return [singular];
}

/** Custom allergy entries become "<Name> allergy" (a leading "no" is dropped). */
export function customAllergyLabel(entry: string) {
  return `${capitalize(entry.replace(/^(no|allergic to)\s+/i, "").replace(/\s+allergy$/i, ""))} allergy`;
}

function customDietQuestion(entry: string) {
  const m = entry.match(/^(no|without)\s+(.+)$/i);
  return m ? `Does this dish have any ${m[2].toLowerCase()} in it, even in the sauce?` : `Is this dish okay for this rule: “${entry}”?`;
}

const allergyQuestion = (name: string) => `Does this have any ${name.toLowerCase()} in it, even in the sauce or oil?`;

/* ---------- Public API ---------- */

function builtIn(option: Option, kind: HardRule["kind"]): HardRule {
  const kw = BUILT_IN_KEYWORDS[option.id] ?? { keywords: [] };
  return {
    label: kind === "allergy" ? `${option.label} allergy` : option.label,
    kind,
    id: option.id,
    custom: false,
    question: option.question ?? allergyQuestion(option.label),
    keywords: kw.keywords,
    except: kw.except ?? [],
  };
}

export function hardRules(prefs: Preferences): HardRule[] {
  const rules: HardRule[] = [
    ...RESTRICTIONS.filter((o) => prefs.restrictions.includes(o.id)).map((o) => builtIn(o, "diet")),
    ...ALLERGIES.filter((o) => prefs.allergies.includes(o.id)).map((o) => builtIn(o, "allergy")),
    ...prefs.customRestrictions.map(
      (entry): HardRule => ({
        label: capitalize(entry),
        kind: "diet",
        custom: true,
        question: customDietQuestion(entry),
        keywords: keywordFromCustom(entry),
        except: [],
      }),
    ),
    ...prefs.customAllergies.map((entry): HardRule => {
      const label = customAllergyLabel(entry);
      return {
        label,
        kind: "allergy",
        custom: true,
        question: allergyQuestion(label.replace(/ allergy$/, "")),
        keywords: keywordFromCustom(entry),
        except: [],
      };
    }),
  ];
  // A custom entry could produce the same label as another; keep the first.
  const seen = new Set<string>();
  return rules.filter((r) => (seen.has(r.label.toLowerCase()) ? false : (seen.add(r.label.toLowerCase()), true)));
}

/** The exact labels we send to the model and expect back in violatesRestrictions. */
export function hardRuleLabels(prefs: Preferences): string[] {
  return hardRules(prefs).map((r) => r.label);
}

function hasWordStart(text: string, keyword: string) {
  // Word start only, so plurals match ("eggs") but "champagne" doesn't match "ham".
  return new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`).test(text);
}

/** Labels of rules whose trigger words appear in the given text (name, description, ingredients). */
export function rulesMentionedIn(text: string, rules: HardRule[]): string[] {
  const base = ` ${text.toLowerCase()} `.replace(/\b[a-z]+[- ]free\b/g, " "); // "dairy-free" isn't dairy
  return rules
    .filter((r) => {
      let t = base;
      for (const ex of r.except) t = t.replace(ex, " ");
      return r.keywords.some((k) => hasWordStart(t, k));
    })
    .map((r) => r.label);
}
