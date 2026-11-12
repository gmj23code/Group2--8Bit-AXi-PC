import { ASK_CAP, verdictForScore } from "./scoring";
import type { MenuItem, PageResult, Verdict } from "./schema";

// Combines per-page results into one ranked list. Every item has already been through
// the server's safety rules; merging must never make anything look SAFER than it was.

/** "Pollo al Ajillo!" and "pollo al ajillo" are the same dish. Keeps non-Latin scripts. */
export function normalizeName(s: string) {
  return s
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip Latin accents only (é → e)...
    .normalize("NFC") // ...then recompose, so marks like Japanese ゛ stay (げ ≠ け)
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, " ")
    .trim();
}

const normalizePrice = (p?: string) => (p ? p.replace(/\s+/g, "").toLowerCase() : "");

/** Same name, and prices match (or one page didn't show a price). Different prices = different sizes/dishes. */
function isDuplicate(a: MenuItem, b: MenuItem) {
  if (normalizeName(a.name) !== normalizeName(b.name)) return false;
  const pa = normalizePrice(a.price);
  const pb = normalizePrice(b.price);
  return !pa || !pb || pa === pb;
}

/** Keeps the most cautious version of a dish seen on two pages. */
function combine(a: MenuItem, b: MenuItem): MenuItem {
  const violatesRestrictions = [...new Set([...a.violatesRestrictions, ...b.violatesRestrictions])];
  const askAbout = [...new Set([...a.askAbout, ...b.askAbout])].filter((l) => !violatesRestrictions.includes(l));
  let score = Math.min(a.score, b.score);
  let verdict: Verdict;
  if (violatesRestrictions.length > 0) {
    verdict = "avoid";
    score = Math.min(score, 10);
  } else if (askAbout.length > 0 || a.verdict === "ask_server" || b.verdict === "ask_server") {
    verdict = "ask_server";
    score = Math.min(score, ASK_CAP);
  } else {
    verdict = verdictForScore(score);
  }
  return {
    ...a, // first appearance keeps its page, section, description, and reasons
    price: a.price ?? b.price,
    description: a.description ?? b.description,
    englishName: a.englishName ?? b.englishName,
    score,
    verdict,
    violatesRestrictions,
    askAbout,
    tags: [...new Set([...a.tags, ...b.tags])].slice(0, 6),
  };
}

function slug(s: string) {
  return normalizeName(s).replace(/\s+/g, "-").slice(0, 40) || "item";
}

/** Merges pages in page order, removes duplicates, sorts, and gives every dish a unique id. */
export function mergePageResults(results: PageResult[]): MenuItem[] {
  const merged: MenuItem[] = [];
  for (const result of [...results].sort((a, b) => a.page - b.page)) {
    for (const item of result.items) {
      const i = merged.findIndex((m) => isDuplicate(m, item));
      if (i >= 0) merged[i] = combine(merged[i], item);
      else merged.push(item);
    }
  }
  // Same order rule as scoring.ts: unsafe dishes always sink below safe ones.
  const unsafe = (i: MenuItem) => (i.violatesRestrictions.length > 0 ? 1 : 0);
  return merged
    .sort((a, b) => unsafe(a) - unsafe(b) || b.score - a.score)
    .map((item, i) => ({ ...item, id: `${i}-${slug(item.name)}` }));
}
