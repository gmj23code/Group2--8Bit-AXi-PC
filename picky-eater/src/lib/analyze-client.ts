"use client";

import { runDemo, type DemoMenu } from "./demo";
import { LIMITS } from "./limits";
import { mergePageResults } from "./merge";
import type { ScanPage } from "./scan-input";
import { PageResultSchema, type Analysis, type ErrorCode, type PageResult, type Preferences } from "./schema";

export class ScanError extends Error {
  constructor(
    public code: ErrorCode | "network" | "timeout",
    message: string,
  ) {
    super(message);
  }
}

/** What the loading screen shows. Page numbers are 1-based. */
export type ScanProgress =
  | { stage: "reading"; total: number; done: number[]; active: number[] }
  | { stage: "translating"; language: string }
  | { stage: "checking" }
  | { stage: "scoring" };

const PAGE_TIMEOUT_MS = 70_000; // a little above the server's own 60s limit
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Errors worth one more try (the page itself is fine; the network or service hiccuped). */
const RETRYABLE = new Set<string>(["ai_unavailable", "rate_limited", "network", "timeout"]);

/** Plain-words reasons used in the "we couldn't read page N" notice. */
const SHORT_REASON: Partial<Record<string, string>> = {
  unreadable: "too blurry",
  not_a_menu: "not a menu page",
  no_items: "no dishes found",
  too_dense: "too many dishes on one page",
  refused: "couldn't be analyzed",
  bad_file: "file problem",
};

async function sendPage(page: ScanPage, pageNumber: number, totalPages: number, prefs: Preferences): Promise<PageResult> {
  const form = new FormData();
  form.append("file", page.blob, page.kind === "pdf" ? `page-${pageNumber}.pdf` : `page-${pageNumber}.jpg`);
  form.append("page", String(pageNumber));
  form.append("totalPages", String(totalPages));
  form.append("preferences", JSON.stringify(prefs));

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PAGE_TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch("/api/analyze", { method: "POST", body: form, signal: controller.signal });
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
    // 413 can come from the host itself (before our code runs), without our JSON body.
    if (res.status === 413 && !err) throw new ScanError("too_large", "This page is too large to upload. Try a photo instead.");
    throw new ScanError(err?.code ?? "ai_unavailable", err?.message ?? "Something went wrong. Please try again.");
  }
  const parsed = PageResultSchema.safeParse(body);
  if (!parsed.success) throw new ScanError("ai_unavailable", "We got a confusing answer. Please try again.");
  return parsed.data;
}

/**
 * Demo scan: scores a sample menu on-device. Never calls the server or the AI.
 * Paced to feel real but stay quick for a pitch: about 2–3.5 seconds in total.
 */
export async function scanDemoMenu(menu: DemoMenu, prefs: Preferences, onProgress: (p: ScanProgress) => void = () => {}): Promise<Analysis> {
  const total = menu.pages.length;
  for (let page = 1; page <= total; page++) {
    onProgress({ stage: "reading", total, done: range(1, page - 1), active: [page] });
    await sleep(650);
  }
  if (menu.language.code !== "EN") {
    onProgress({ stage: "translating", language: menu.language.english });
    await sleep(600);
  }
  onProgress({ stage: "checking" });
  await sleep(500);
  onProgress({ stage: "scoring" });
  await sleep(350);
  return runDemo(menu, prefs);
}

/** Real scan: every page goes to our server route (and from there to Claude). */
export async function scanMenu(
  pages: ScanPage[],
  prefs: Preferences,
  onProgress: (p: ScanProgress) => void = () => {},
): Promise<Analysis> {

  if (pages.length === 0) throw new ScanError("bad_request", "Please take or choose a photo or PDF first.");
  const total = pages.length;
  const done: number[] = [];
  const active = new Set<number>();
  const report = () => onProgress({ stage: "reading", total, done: [...done].sort((a, b) => a - b), active: [...active].sort((a, b) => a - b) });

  const results: PageResult[] = [];
  const failures: { page: number; error: ScanError }[] = [];
  let fatal: ScanError | null = null;
  let next = 0;

  // A few pages at a time: faster than one-by-one, gentle on rate limits.
  async function worker() {
    while (next < total && !fatal) {
      const index = next++;
      const pageNumber = index + 1;
      active.add(pageNumber);
      report();
      try {
        results.push(await sendWithRetry(pages[index], pageNumber));
      } catch (e) {
        const error = e instanceof ScanError ? e : new ScanError("ai_unavailable", "Something went wrong.");
        // Setup problems stop the whole scan; page problems just skip that page.
        if (error.code === "no_api_key") fatal = error;
        else failures.push({ page: pageNumber, error });
      }
      active.delete(pageNumber);
      done.push(pageNumber);
      report();
    }
  }

  async function sendWithRetry(page: ScanPage, pageNumber: number): Promise<PageResult> {
    try {
      return await sendPage(page, pageNumber, total, prefs);
    } catch (e) {
      if (e instanceof ScanError && RETRYABLE.has(e.code)) {
        await sleep(e.code === "rate_limited" ? 4000 : 1000);
        return sendPage(page, pageNumber, total, prefs);
      }
      throw e;
    }
  }

  report();
  await Promise.all(Array.from({ length: Math.min(LIMITS.concurrency, total) }, worker));
  if (fatal) throw fatal;

  if (results.length === 0) {
    // Nothing worked: show the most useful single reason.
    const first = failures.sort((a, b) => a.page - b.page)[0]?.error;
    throw first ?? new ScanError("ai_unavailable", "Something went wrong. Please try again.");
  }

  // The server already checked every dish; this step just combines and ranks.
  onProgress({ stage: "checking" });
  // With a single page, "Page 1" labels are just noise: keep sections, drop page numbers.
  const items = mergePageResults(results).map((i) => (total === 1 ? { ...i, page: undefined } : i));
  onProgress({ stage: "scoring" });
  await sleep(300);

  const notices: string[] = [];
  if (failures.length > 0) {
    const list = failures
      .sort((a, b) => a.page - b.page)
      .map((f) => `page ${f.page} (${SHORT_REASON[f.error.code] ?? "couldn't be read"})`);
    notices.push(`We couldn't read ${list.join(", ")}. Dishes from ${failures.length === 1 ? "that page" : "those pages"} are missing below.`);
  }
  const partial = results.filter((r) => r.partial).map((r) => r.page);
  if (partial.length > 0) {
    notices.push(`Part of page ${partial.join(", ")} was hard to read, so some dishes may be missing.`);
  }

  return {
    items,
    source: "ai",
    pages:
      total > 1
        ? results.map((r) => ({ number: r.page, sections: r.sections })).sort((a, b) => a.number - b.number)
        : undefined,
    sections: total === 1 ? results[0].sections : undefined,
    notice: notices.length ? notices.join(" ") : undefined,
    analyzedAt: new Date().toISOString(),
  };
}

function range(from: number, to: number) {
  return Array.from({ length: Math.max(0, to - from + 1) }, (_, i) => from + i);
}
