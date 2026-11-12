import { LIMITS, formatMB } from "@/lib/limits";
import { AnalyzeFailure, analyzePage } from "@/lib/server/analyze-menu";
import { checkSinglePagePdf, sniffKind } from "@/lib/server/validate-upload";
import { applyRules } from "@/lib/scoring";
import {
  PageMetaSchema,
  PageResultSchema,
  PreferencesSchema,
  type AnalyzeError,
  type ErrorCode,
  type PageResult,
} from "@/lib/schema";

// One request = one menu page. The AI call for a dense page can take 20-40 seconds.
// 60s is the most Vercel's Hobby plan allows; raise it on Pro if you need to.
export const maxDuration = 60;

function fail(code: ErrorCode, message: string, status: number) {
  return Response.json({ error: { code, message } } satisfies AnalyzeError, { status });
}

/**
 * POST multipart/form-data:
 *   file         one photo (JPG/PNG/WebP/GIF) or a single-page PDF
 *   page         this page's number (1-based)
 *   totalPages   pages in the whole menu
 *   preferences  JSON of the diner's preferences
 */
export async function POST(request: Request) {
  // Reject oversized bodies before reading them (hosts like Vercel cap at 4.5 MB anyway).
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > LIMITS.maxUploadBytes + 64 * 1024) {
    return fail("too_large", `Each page must be under ${formatMB(LIMITS.maxUploadBytes)}.`, 413);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail("bad_request", "That upload didn't look right. Please try again.", 400);
  }

  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) return fail("bad_request", "No menu page was attached.", 400);
  if (file.size > LIMITS.maxUploadBytes) {
    return fail("too_large", `Each page must be under ${formatMB(LIMITS.maxUploadBytes)}.`, 413);
  }

  const meta = PageMetaSchema.safeParse({ page: form.get("page"), totalPages: form.get("totalPages") });
  let prefsJson: unknown;
  try {
    prefsJson = JSON.parse(String(form.get("preferences") ?? ""));
  } catch {
    prefsJson = null;
  }
  const prefs = PreferencesSchema.safeParse(prefsJson);
  if (!meta.success || !prefs.success || meta.data.page > meta.data.totalPages) {
    return fail("bad_request", "That request didn't look right. Please try again.", 400);
  }
  if (meta.data.totalPages > LIMITS.maxPdfPages) {
    return fail("too_many_pages", `Menus can have up to ${LIMITS.maxPdfPages} pages.`, 400);
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const kind = sniffKind(bytes);
  if (!kind) return fail("bad_file", "Please upload a PDF, or a JPG, PNG, or WebP photo.", 415);

  try {
    if (kind === "pdf") await checkSinglePagePdf(bytes);

    const { page, totalPages } = meta.data;
    const output = await analyzePage({ bytes, kind, page, totalPages, preferences: prefs.data });

    if (!output.readable) {
      return output.problem === "not_a_menu"
        ? fail("not_a_menu", "That doesn't look like a menu page.", 422)
        : fail("unreadable", "This page is too blurry or dark to read.", 422);
    }

    // Section order as printed (items get re-sorted by score below).
    const sections = [...new Set(output.items.map((i) => i.section?.trim()).filter((s): s is string => !!s))];
    const items = applyRules(
      output.items.map((i) => ({ ...i, page })),
      prefs.data,
    );
    if (items.length === 0) return fail("no_items", "We couldn't find any dishes on this page.", 422);

    const result: PageResult = { page, items, sections, partial: output.problem === "partly_readable" };
    // Final check: the browser only ever receives data that matches the shared schema.
    return Response.json(PageResultSchema.parse(result));
  } catch (err) {
    if (err instanceof AnalyzeFailure) return fail(err.code, err.message, err.status);
    console.error("[analyze] unhandled:", err);
    return fail("ai_unavailable", "Something went wrong on our side. Please try again.", 500);
  }
}
