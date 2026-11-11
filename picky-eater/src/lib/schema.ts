import { z } from "zod";

// Single source of truth for data shapes. TS types are inferred from these Zod schemas,
// so runtime validation and compile-time types can never drift apart.

/* ---------- User preferences ---------- */

export const PreferencesSchema = z.object({
  restrictions: z.array(z.string()).default([]),
  allergies: z.array(z.string()).default([]),
  /** Ordered: index 0 is the user's #1 priority. */
  goals: z.array(z.string()).default([]),
  /** Free text for anything not in the lists, e.g. "no cilantro". */
  notes: z.string().max(200).default(""),
});

export type Preferences = z.infer<typeof PreferencesSchema>;

export const EMPTY_PREFERENCES: Preferences = {
  restrictions: [],
  allergies: [],
  goals: [],
  notes: "",
};

/* ---------- What we ask Claude to return ---------- */

export const VERDICTS = ["great", "okay", "avoid", "ask_server"] as const;
export type Verdict = (typeof VERDICTS)[number];

// Note: structured outputs don't support min/max, so score bounds are enforced
// afterwards in scoring.ts. Nullable (not optional) fields keep the JSON shape fixed.
export const ModelItemSchema = z.object({
  name: z.string(),
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
  description: z.string().optional(),
  price: z.string().optional(),
  score: z.number().int().min(0).max(100),
  verdict: z.enum(VERDICTS),
  reasons: z.array(z.string()),
  tags: z.array(z.string()),
  violatesRestrictions: z.array(z.string()),
  /** Hard rules to double-check with staff (shown with the "Ask your server" verdict). */
  askAbout: z.array(z.string()),
});

export const AnalysisSchema = z.object({
  items: z.array(MenuItemSchema),
  source: z.enum(["ai", "demo"]),
  /** A gentle heads-up, e.g. "Part of the photo was hard to read." */
  notice: z.string().optional(),
  analyzedAt: z.string(),
});

export type MenuItem = z.infer<typeof MenuItemSchema>;
export type Analysis = z.infer<typeof AnalysisSchema>;

/* ---------- API request / error shapes ---------- */

export const SUPPORTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;

export const AnalyzeRequestSchema = z.object({
  /** Base64 image data, no "data:" prefix. ~8 MB cap keeps requests reasonable. */
  image: z.string().min(100).max(8_000_000),
  mediaType: z.enum(SUPPORTED_IMAGE_TYPES),
  preferences: PreferencesSchema,
});

export type AnalyzeRequest = z.infer<typeof AnalyzeRequestSchema>;

export const ERROR_CODES = [
  "bad_request",
  "no_api_key",
  "unreadable",
  "not_a_menu",
  "no_items",
  "refused",
  "rate_limited",
  "ai_unavailable",
] as const;
export type ErrorCode = (typeof ERROR_CODES)[number];

export type AnalyzeError = { error: { code: ErrorCode; message: string } };
