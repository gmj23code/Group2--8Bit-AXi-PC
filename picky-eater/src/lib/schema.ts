import { z } from "zod";
import { cleanCustomList, knownIds } from "./options";

// Single source of truth for data shapes. TS types are inferred from these Zod schemas,
// so runtime validation and compile-time types can never drift apart.

/* ---------- User preferences ---------- */

// Raw input is bounded (array sizes, string lengths), then cleaned: unknown ids dropped,
// custom entries trimmed and de-duplicated. Applied to saved data AND every API request.
const idList = z.array(z.string().max(40)).max(60).default([]);
const customList = z.array(z.string().max(200)).max(60).default([]);

export const PreferencesSchema = z
  .object({
    restrictions: idList,
    allergies: idList,
    /** Ordered: index 0 is the user's #1 priority. */
    goals: idList,
    /** User-typed "+ Other" diets, e.g. "No mushrooms". Treated as hard rules. */
    customRestrictions: customList,
    /** User-typed "+ Other" allergies, e.g. "Pine nuts". Treated as hard rules. */
    customAllergies: customList,
    /** Free text for soft preferences, e.g. "not too spicy". */
    notes: z.string().max(200).default(""),
  })
  .transform((p) => ({
    ...p,
    restrictions: knownIds("restrictions", p.restrictions),
    allergies: knownIds("allergies", p.allergies),
    goals: knownIds("goals", p.goals),
    customRestrictions: cleanCustomList(p.customRestrictions),
    customAllergies: cleanCustomList(p.customAllergies),
  }));

export type Preferences = z.infer<typeof PreferencesSchema>;

export const EMPTY_PREFERENCES: Preferences = {
  restrictions: [],
  allergies: [],
  goals: [],
  customRestrictions: [],
  customAllergies: [],
  notes: "",
};

/* ---------- What we ask Claude to return ---------- */

export const VERDICTS = ["great", "okay", "avoid", "ask_server"] as const;
export type Verdict = (typeof VERDICTS)[number];

// Note: structured outputs don't support min/max, so score bounds are enforced
// afterwards in scoring.ts. Nullable (not optional) fields keep the JSON shape fixed.
export const ModelItemSchema = z.object({
  /** Exactly as printed, in the original language/script. */
  name: z.string(),
  /** Short English name if the printed name isn't English; otherwise null. */
  englishName: z.string().nullable(),
  /** Menu heading the dish sits under (in English), or null. */
  section: z.string().nullable(),
  /** Short English description of the dish. */
  description: z.string().nullable(),
  price: z.string().nullable(),
  score: z.number(),
  verdict: z.enum(VERDICTS),
  reasons: z.array(z.string()),
  tags: z.array(z.string()),
  /** Hard rules this dish clearly or very likely breaks (exact labels we sent). */
  violatesRestrictions: z.array(z.string()),
  /** Hard rules the model can't confirm either way → becomes "Ask your server". */
  uncertainAbout: z.array(z.string()),
});

export const ModelOutputSchema = z.object({
  /** false if the photo isn't a menu or is too blurry/dark to read. */
  readable: z.boolean(),
  problem: z.enum(["blurry", "not_a_menu", "partly_readable"]).nullable(),
  items: z.array(ModelItemSchema),
});

export type ModelItem = z.infer<typeof ModelItemSchema>;
export type ModelOutput = z.infer<typeof ModelOutputSchema>;

/* ---------- What the frontend receives (after server-side rules) ---------- */

export const MenuItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  /** English name when the printed name is in another language. */
  englishName: z.string().optional(),
  description: z.string().optional(),
  price: z.string().optional(),
  score: z.number().int().min(0).max(100),
  verdict: z.enum(VERDICTS),
  reasons: z.array(z.string()),
  tags: z.array(z.string()),
  violatesRestrictions: z.array(z.string()),
  /** Hard rules to double-check with staff (shown with the "Ask your server" verdict). */
  askAbout: z.array(z.string()),
  /** Which menu page / section the dish came from, when known. */
  page: z.number().int().positive().optional(),
  section: z.string().optional(),
});

export const AnalysisSchema = z.object({
  items: z.array(MenuItemSchema),
  source: z.enum(["ai", "demo"]),
  /** Demo mode: which sample menu was scanned. */
  menu: z.object({ id: z.string(), restaurant: z.string(), cuisine: z.string(), language: z.string() }).optional(),
  /** Section names in menu order, for single-page menus (multi-page menus use pages[].sections). */
  sections: z.array(z.string()).optional(),
  /** The pages that were read, in order (used for the page filter and "3 pages" summary). */
  pages: z
    .array(
      z.object({
        number: z.number().int().positive(),
        title: z.string().optional(),
        /** Section names in menu order (items themselves are sorted by score). */
        sections: z.array(z.string()).optional(),
      }),
    )
    .optional(),
  /** A gentle heads-up, e.g. "Part of the photo was hard to read." */
  notice: z.string().optional(),
  analyzedAt: z.string(),
});

export type MenuItem = z.infer<typeof MenuItemSchema>;
export type Analysis = z.infer<typeof AnalysisSchema>;

/* ---------- API request / error shapes ---------- */

export const SUPPORTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
export type FileKind = "pdf" | (typeof SUPPORTED_IMAGE_TYPES)[number];

/**
 * The non-file fields of one page upload (multipart form). One request = one menu page:
 * either a photo or a single-page PDF split off in the browser.
 */
export const PageMetaSchema = z.object({
  page: z.coerce.number().int().min(1).max(100),
  totalPages: z.coerce.number().int().min(1).max(100),
});

/** What /api/analyze returns for one page, after the server-side safety rules. */
export const PageResultSchema = z.object({
  page: z.number().int().positive(),
  items: z.array(MenuItemSchema),
  /** Section headings in the order they appear on the page. */
  sections: z.array(z.string()),
  /** Set when the page was only partly readable. */
  partial: z.boolean(),
});
export type PageResult = z.infer<typeof PageResultSchema>;

export const ERROR_CODES = [
  "bad_request",
  "bad_file",
  "too_large",
  "too_many_pages",
  "encrypted_pdf",
  "no_api_key",
  "unreadable",
  "not_a_menu",
  "no_items",
  "too_dense",
  "refused",
  "rate_limited",
  "ai_unavailable",
] as const;
export type ErrorCode = (typeof ERROR_CODES)[number];

export type AnalyzeError = { error: { code: ErrorCode; message: string } };
