"use client";

import type { ReactNode } from "react";
import type { ScanProgress } from "@/lib/analyze-client";
import { Icon } from "./Icon";

type LoadingScanProps = {
  totalPages: number;
  /** Draws page N (1-based) at the given size, or null if there's nothing to show (PDF pages). */
  renderPage: (page: number, size: "large" | "thumb") => ReactNode | null;
  progress: ScanProgress;
  /** Set for menus that get translated (demo); adds a "Translating…" step. */
  language?: string;
  demo: boolean;
};

/** "3", "2–4", or "2, 5": which pages are being read right now. */
function describe(pages: number[]) {
  if (pages.length === 0) return "";
  if (pages.length === 1) return `${pages[0]}`;
  const contiguous = pages.every((p, i) => i === 0 || p === pages[i - 1] + 1);
  return contiguous ? `${pages[0]}–${pages[pages.length - 1]}` : pages.join(", ");
}

/**
 * Scanning screen: the page being read with a moving scan line, page tiles that tick off,
 * and a checklist: read → (translate) → check allergens and diets → rank.
 */
export function LoadingScan({ totalPages: total, renderPage, progress, language, demo }: LoadingScanProps) {
  const reading = progress.stage === "reading";
  const done = reading ? progress.done : Array.from({ length: total }, (_, i) => i + 1);
  const active = reading ? progress.active : [];
  const focusPage = active[0] ?? Math.max(1, done[done.length - 1] ?? 1);

  const steps = [
    { key: "reading", label: total > 1 ? `Reading ${total} pages` : "Reading the menu" },
    ...(language ? [{ key: "translating", label: `Translating from ${language}` }] : []),
    { key: "checking", label: "Checking allergens and diets" },
    { key: "scoring", label: "Ranking dishes for you" },
  ];
  const step = steps.findIndex((s) => s.key === progress.stage);

  const title = reading
    ? total > 1
      ? active.length > 0
        ? `Reading ${active.length > 1 ? "pages" : "page"} ${describe(active)} of ${total}`
        : `Read ${done.length} of ${total} pages`
      : "Reading the menu"
    : steps[step]?.label ?? "Working";

  const large = renderPage(focusPage, "large");

  return (
    <div className="pt-10 flex flex-col items-center text-center gap-7">
      <div className="relative w-56 rounded-card overflow-hidden border border-line bg-surface shadow-lift">
        {large ?? (
          // No preview (PDF pages): a simple page with its number.
          <div className="aspect-[3/4] grid place-items-center bg-subtle text-ink-soft">
            <div className="flex flex-col items-center gap-2">
              <Icon name="menu" size={40} />
              <span className="font-semibold">Page {focusPage}</span>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-brand/5" aria-hidden="true" />
        {/* The scan line. Stops moving if the user prefers reduced motion (see globals.css). */}
        <div className="absolute inset-x-0 h-0.5 bg-brand shadow-[0_0_12px_2px_rgba(14,92,88,0.45)] animate-scan" aria-hidden="true" />
      </div>

      {/* Page tiles tick off as each page is read. */}
      {total > 1 && (
        <ol className="flex flex-wrap justify-center gap-2 max-w-sm" aria-hidden="true">
          {Array.from({ length: total }, (_, i) => {
            const n = i + 1;
            const isDone = done.includes(n);
            const isActive = active.includes(n);
            const thumb = renderPage(n, "thumb");
            return (
              <li
                key={n}
                className={`relative w-11 h-14 rounded-md overflow-hidden border-2 bg-surface grid place-items-center text-xs font-semibold ${
                  isActive ? "border-brand" : isDone ? "border-great" : "border-line opacity-60"
                }`}
              >
                {thumb ?? <span className="text-ink-soft">{n}</span>}
                {isDone && (
                  <span className="absolute inset-0 grid place-items-center bg-great/75 text-white">
                    <Icon name="check" size={16} />
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      )}

      <div role="status" aria-live="polite">
        <h1 className="font-display text-[2.2rem] leading-tight">{title}…</h1>
        <p className="text-ink-soft mt-1">
          {demo
            ? "Sample menu, scored on your device."
            : total > 1
              ? `${done.length} of ${total} pages done. Each page takes about 10–30 seconds.`
              : "This usually takes 10–30 seconds."}
        </p>
      </div>

      <ol className="w-full max-w-sm flex flex-col text-left rounded-card border border-line bg-surface shadow-card divide-y divide-line" aria-hidden="true">
        {steps.map((s, i) => {
          const isDone = i < step;
          const isCurrent = i === step;
          return (
            <li key={s.key} className={`flex items-center gap-3 px-4 py-3.5 ${isDone || isCurrent ? "text-ink" : "text-ink-soft"}`}>
              <span
                className={`w-6 h-6 rounded-full grid place-items-center ${
                  isDone ? "bg-great text-white" : isCurrent ? "border-2 border-brand" : "border border-line-strong"
                }`}
              >
                {isDone && <Icon name="check" size={14} />}
                {isCurrent && <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />}
              </span>
              <span className={isCurrent ? "font-semibold" : "font-medium"}>{s.label}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
