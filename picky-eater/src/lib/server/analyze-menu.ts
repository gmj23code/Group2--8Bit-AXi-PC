import "server-only"; // build fails if this file is ever imported into client code

import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { SYSTEM_PROMPT, buildUserMessage } from "../prompt";
import { ModelOutputSchema, type AnalyzeRequest, type ErrorCode, type ModelOutput } from "../schema";

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
  // One retry on network/5xx/429; 60s cap so a stuck call doesn't hang the phone.
  client ??= new Anthropic({ timeout: 60_000, maxRetries: 1 });
  return client;
}

/** Sends the menu photo + profile to Claude and returns schema-validated output. */
export async function analyzeMenu(req: AnalyzeRequest): Promise<ModelOutput> {
  const anthropic = getClient();

  let response;
  try {
    response = await anthropic.beta.messages.parse({
      model: MODEL,
      max_tokens: 16000,
      // If a safety filter wrongly declines a menu photo, the API retries on a
      // recommended fallback model inside the same call instead of failing.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: {
        effort: "medium", // good accuracy while keeping a scan to a few seconds
        format: betaZodOutputFormat(ModelOutputSchema),
      },
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: req.mediaType, data: req.image } },
            { type: "text", text: buildUserMessage(req.preferences) },
          ],
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
      throw new AnalyzeFailure("bad_request", "We couldn't use that photo. Try a JPG or PNG.", 400);
    }
    if (err instanceof Anthropic.APIError) {
      console.error("[analyze] API error", err.status, err.message);
    } else {
      console.error("[analyze] unexpected error:", err);
    }
    throw new AnalyzeFailure("ai_unavailable", "We couldn't reach the menu reader. Check your connection and try again.", 502);
  }

  if (response.stop_reason === "refusal") {
    throw new AnalyzeFailure("refused", "We couldn't analyze this photo. Try a different picture of the menu.", 422);
  }
  if (response.stop_reason === "max_tokens") {
    throw new AnalyzeFailure("ai_unavailable", "This menu is very long. Try a photo of one page at a time.", 422);
  }
  if (!response.parsed_output) {
    console.error("[analyze] output did not match schema");
    throw new AnalyzeFailure("ai_unavailable", "The menu reader gave a confusing answer. Please try again.", 502);
  }
  return response.parsed_output;
}
