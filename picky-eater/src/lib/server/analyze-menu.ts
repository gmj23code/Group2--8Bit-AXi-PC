import "server-only"; // build fails if this file is ever imported into client code

import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { SYSTEM_PROMPT, buildUserMessage } from "../prompt";
import { ModelOutputSchema, type ErrorCode, type FileKind, type ModelOutput, type Preferences } from "../schema";

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5";

export class AnalyzeFailure extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

let client: Anthropic | null = null;
function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new AnalyzeFailure("no_api_key", "The AI isn't set up yet. Turn on Demo mode to try the app.", 503);
  }
  // No automatic retries here: one page must finish within the hosting time limit
  // (see maxDuration in the route). The browser retries a failed page once instead.
  client ??= new Anthropic({ timeout: 55_000, maxRetries: 0 });
  return client;
}

export type PageInput = {
  bytes: Uint8Array;
  kind: FileKind;
  page: number;
  totalPages: number;
  preferences: Preferences;
};

/** Sends ONE menu page (a photo, or a single-page PDF) + the profile to Claude. */
export async function analyzePage(input: PageInput): Promise<ModelOutput> {
  const anthropic = getClient();
  const data = Buffer.from(input.bytes).toString("base64");

  // PDFs go in as native document blocks: Claude sees each page as an image AND its
  // extracted text, so both text-based and scanned PDFs work without conversion.
  // The file comes first, then the instructions (Anthropic's recommended order).
  const file =
    input.kind === "pdf"
      ? ({ type: "document", source: { type: "base64", media_type: "application/pdf", data } } as const)
      : ({ type: "image", source: { type: "base64", media_type: input.kind, data } } as const);

  let response;
  try {
    response = await anthropic.beta.messages.parse({
      model: MODEL,
      max_tokens: 16000,
      // If a safety filter wrongly declines a menu page, the API retries on a
      // recommended fallback model inside the same call instead of failing.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: {
        effort: "medium", // good accuracy while keeping one page well under a minute
        format: betaZodOutputFormat(ModelOutputSchema),
      },
      // Same text on every request, marked for prompt caching to cut cost on multi-page menus.
      system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
      messages: [
        {
          role: "user",
          content: [file, { type: "text", text: buildUserMessage(input.preferences, input.page, input.totalPages) }],
        },
      ],
    });
  } catch (err) {
    // Most specific first; never leak raw API errors to the client.
    if (err instanceof Anthropic.AuthenticationError || err instanceof Anthropic.PermissionDeniedError) {
      console.error("[analyze] auth error:", err.message);
      throw new AnalyzeFailure("ai_unavailable", "The AI service rejected our key. Check ANTHROPIC_API_KEY.", 502);
    }
    if (err instanceof Anthropic.RateLimitError) {
      throw new AnalyzeFailure("rate_limited", "Lots of people are scanning right now. Try again in a minute.", 429);
    }
    if (err instanceof Anthropic.BadRequestError) {
      console.error("[analyze] bad request:", err.message);
      throw new AnalyzeFailure("bad_file", "We couldn't read that file. Try a different PDF or a photo of the menu.", 400);
    }
    if (err instanceof Anthropic.APIConnectionTimeoutError) {
      throw new AnalyzeFailure("ai_unavailable", "This page took too long to read. Please try again.", 504);
    }
    if (err instanceof Anthropic.APIError) {
      console.error("[analyze] API error", err.status, err.message);
    } else {
      console.error("[analyze] unexpected error:", err);
    }
    throw new AnalyzeFailure("ai_unavailable", "We couldn't reach the menu reader. Check your connection and try again.", 502);
  }

  if (response.stop_reason === "refusal") {
    throw new AnalyzeFailure("refused", "We couldn't analyze this page. Try a different picture of the menu.", 422);
  }
  if (response.stop_reason === "max_tokens") {
    throw new AnalyzeFailure("too_dense", "This page has too many dishes to read at once. Try photographing half of it at a time.", 422);
  }
  if (!response.parsed_output) {
    console.error("[analyze] output did not match schema");
    throw new AnalyzeFailure("ai_unavailable", "The menu reader gave a confusing answer. Please try again.", 502);
  }
  return response.parsed_output;
}
