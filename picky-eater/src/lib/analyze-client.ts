"use client";

import { runDemo } from "./demo";
import type { PreparedImage } from "./image";
import { AnalysisSchema, type Analysis, type ErrorCode, type Preferences } from "./schema";

export class ScanError extends Error {
  constructor(
    public code: ErrorCode | "network" | "timeout",
    message: string,
  ) {
    super(message);
  }
}

const TIMEOUT_MS = 75_000;

/** Runs a scan: demo mode stays on-device; otherwise calls our server route. */
export async function analyze(image: PreparedImage | null, prefs: Preferences, demo: boolean): Promise<Analysis> {
  if (demo) {
    // Short pause so the loading screen is visible during the pitch.
    await new Promise((r) => setTimeout(r, 1800));
    return runDemo(prefs);
  }
  if (!image) throw new ScanError("bad_request", "Please take or choose a photo first.");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: image.base64, mediaType: image.mediaType, preferences: prefs }),
      signal: controller.signal,
    });
  } catch {
    throw controller.signal.aborted
      ? new ScanError("timeout", "This is taking too long. Check your connection and try again.")
      : new ScanError("network", "You seem to be offline. Check your connection, or turn on Demo mode.");
  } finally {
    clearTimeout(timer);
  }

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const err = body?.error;
    throw new ScanError(err?.code ?? "ai_unavailable", err?.message ?? "Something went wrong. Please try again.");
  }
  const parsed = AnalysisSchema.safeParse(body);
  if (!parsed.success) throw new ScanError("ai_unavailable", "We got a confusing answer. Please try again.");
  return parsed.data;
}
