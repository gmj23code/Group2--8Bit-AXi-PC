import { hardRuleLabels, hardRules, rulesMentionedIn } from "./rules";
import type { MenuItem, ModelItem, Preferences, Verdict } from "./schema";

// Server-side safety rules. We never trust the AI alone for the hard rules:
// after the model answers, this code caps scores, forces verdicts, and adds a
// simple keyword check as a second line of defense. Shared by the API and Demo mode.
// Hard rules = built-in diets/allergies AND the user's own "+ Other" entries (see rules.ts).

export const HARD_CAP = 10; // max score for anything that breaks a diet or allergy
export const ASK_CAP = 50; // unclear items can't look like a top pick until confirmed

export { hardRuleLabels };

/** Score bands → verdict. Kept in one place so badges and verdicts always agree. */
export function verdictForScore(score: number): Exclude<Verdict, "ask_server"> {
  if (score >= 80) return "great";
  if (score >= 50) return "okay";
  return "avoid";
}

/** Extra fields a raw item may carry (the demo knows its ingredients; real scans know the page). */
export type RawItem = ModelItem & { ingredients?: string[]; page?: number };

/** Applies the hard rules to raw model output and returns frontend-ready, sorted items. */
export function applyRules(raw: RawItem[], prefs: Preferences): MenuItem[] {
  const rules = hardRules(prefs);
  // Map any casing the model used back to our exact label; drop rules the user didn't pick.
  const canonical = new Map(rules.map((r) => [r.label.toLowerCase(), r.label]));
  const clean = (labels: string[]) => [
    ...new Set(labels.map((l) => canonical.get(l.trim().toLowerCase())).filter((l): l is string => !!l)),
  ];

  const items = raw
    .filter((r) => r.name.trim().length > 0)
    .map((r, i): MenuItem => {
      const violations = clean(r.violatesRestrictions);
      // A keyword hit the model didn't flag → never shown as safe; ask staff to confirm.
      // English name + description help the keyword check on non-English menus.
      const text = [r.name, r.englishName ?? "", r.description ?? "", ...(r.ingredients ?? [])].join(" ");
      const askAbout = clean([...r.uncertainAbout, ...rulesMentionedIn(text, rules)]).filter(
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
        // Only keep an English name when it actually differs from the printed one.
        englishName:
          r.englishName?.trim() && r.englishName.trim().toLowerCase() !== r.name.trim().toLowerCase()
            ? r.englishName.trim()
            : undefined,
        description: r.description?.trim() || undefined,
        price: r.price?.trim() || undefined,
        score,
        verdict,
        reasons: r.reasons.slice(0, 4),
        tags: [...new Set(r.tags)].slice(0, 6),
        violatesRestrictions: violations,
        askAbout,
        ...(r.page ? { page: r.page } : {}),
        ...(r.section ? { section: r.section } : {}),
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
