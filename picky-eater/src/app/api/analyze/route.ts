import { AnalyzeFailure, analyzeMenu } from "@/lib/server/analyze-menu";
import { applyRules } from "@/lib/scoring";
import { AnalysisSchema, AnalyzeRequestSchema, type Analysis, type AnalyzeError, type ErrorCode } from "@/lib/schema";

// AI calls can take a while; let the platform wait up to 60s.
export const maxDuration = 60;

function fail(code: ErrorCode, message: string, status: number) {
  return Response.json({ error: { code, message } } satisfies AnalyzeError, { status });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("bad_request", "That request didn't look right.", 400);
  }

  const parsed = AnalyzeRequestSchema.safeParse(body);
  if (!parsed.success) {
    return fail("bad_request", "Please choose a JPG, PNG, or WebP photo under 6 MB.", 400);
  }

  try {
    const output = await analyzeMenu(parsed.data);

    if (!output.readable) {
      return output.problem === "not_a_menu"
        ? fail("not_a_menu", "That doesn't look like a menu. Try a photo of the menu page.", 422)
        : fail("unreadable", "The photo is too blurry or dark to read. Try again with more light and hold steady.", 422);
    }

    const items = applyRules(output.items, parsed.data.preferences);
    if (items.length === 0) {
      return fail("no_items", "We couldn't find any dishes in this photo. Try getting closer to the menu.", 422);
    }

    const analysis: Analysis = {
      items,
      source: "ai",
      notice: output.problem === "partly_readable" ? "Part of the menu was hard to read, so some dishes may be missing." : undefined,
      analyzedAt: new Date().toISOString(),
    };
    // Final check: the frontend only ever receives data that matches the shared schema.
    return Response.json(AnalysisSchema.parse(analysis));
  } catch (err) {
    if (err instanceof AnalyzeFailure) return fail(err.code, err.message, err.status);
    console.error("[analyze] unhandled:", err);
    return fail("ai_unavailable", "Something went wrong on our side. Please try again.", 500);
  }
}
