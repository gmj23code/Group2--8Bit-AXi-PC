"use client";

import type { ScanProgress } from "@/lib/analyze-client";
import { Icon } from "./Icon";

type LoadingScanProps = {
  /** One preview per page, or null where there's no preview (PDF pages). */
  previews: (string | null)[];
  progress: ScanProgress;
  demo: boolean;
};

/** "3", "2 and 3", "2–4": which pages are being read right now. */
function describe(pages: number[]) {
  if (pages.length === 0) return "";
  if (pages.length === 1) return `${pages[0]}`;
  const contiguous = pages.every((p, i) => i === 0 || p === pages[i - 1] + 1);
  return contiguous ? `${pages[0]}–${pages[pages.length - 1]}` : pages.join(", ");
}

/**
 * Scanning screen: a page with a moving scan line, a strip of page tiles that tick off
 * as each page comes back, and a three-step checklist.
 */
export function LoadingScan({ previews, progress, demo }: LoadingScanProps) {
  const total = progress.stage === "reading" ? progress.total : previews.length;
  const done = progress.stage === "reading" ? progress.done : Array.from({ length: total }, (_, i) => i + 1);
  const active = progress.stage === "reading" ? progress.active : [];
  const step = progress.stage === "reading" ? 0 : progress.stage === "checking" ? 1 : 2;
  const focusPage = active[0] ?? Math.max(1, done[done.length - 1] ?? 1);
  const focusPreview = previews[focusPage - 1] ?? null;

  const title =
    progress.stage === "reading"
      ? total > 1
        ? active.length > 0
          ? `Reading ${active.length > 1 ? "pages" : "page"} ${describe(active)} of ${total}`
          : `Read ${done.length} of ${total} pages`
        : "Reading the menu"
      : progress.stage === "checking"
        ? "Checking your diet and allergies"
        : "Ranking dishes for you";

  const steps = [total > 1 ? `Reading ${total} pages` : "Reading the menu", "Checking your diet and allergies", "Ranking dishes for you"];

  return (
    <div className="pt-10 flex flex-col items-center text-center gap-7">
      <div className="relative w-52 h-68 rounded-card overflow-hidden border border-line bg-surface shadow-lift">
        {focusPreview ? (
          // eslint-disable-next-line @next/next/no-img-element -- local data URL
          <img src={focusPreview} alt="" className="w-full h-full object-cover object-top" />
        ) : (
          // PDF pages have no preview: show a simple page with its number.
          <div className="w-full h-full grid place-items-center bg-subtle text-ink-soft">
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

      {/* Page tiles tick off as each page comes back. */}
      {total > 1 && (
        <ol className="flex flex-wrap justify-center gap-2 max-w-sm" aria-hidden="true">
          {Array.from({ length: total }, (_, i) => {
            const n = i + 1;
            const isDone = done.includes(n);
            const isActive = active.includes(n);
            const src = previews[i];
            return (
              <li
                key={n}
                className={`relative w-10 h-13 rounded-md overflow-hidden border-2 bg-surface grid place-items-center text-xs font-semibold ${
                  isActive ? "border-brand" : isDone ? "border-great" : "border-line opacity-60"
                }`}
              >
                {src ? (
                  // eslint-disable-next-line @next/next/no-img-element -- local data URL
                  <img src={src} alt="" className="absolute inset-0 w-full h-full object-cover object-top" />
                ) : (
                  <span className="text-ink-soft">{n}</span>
                )}
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
            ? "Checking the sample menu for you."
            : total > 1
              ? `${done.length} of ${total} pages done. Each page takes about 10–30 seconds.`
              : "This usually takes 10–30 seconds."}
        </p>
      </div>

      <ol className="w-full max-w-sm flex flex-col text-left rounded-card border border-line bg-surface shadow-card divide-y divide-line" aria-hidden="true">
        {steps.map((label, i) => {
          const isDone = i < step;
          const isCurrent = i === step;
          return (
            <li key={label} className={`flex items-center gap-3 px-4 py-3.5 ${isDone || isCurrent ? "text-ink" : "text-ink-soft"}`}>
              <span
                className={`w-6 h-6 rounded-full grid place-items-center ${
                  isDone ? "bg-great text-white" : isCurrent ? "border-2 border-brand" : "border border-line-strong"
                }`}
              >
                {isDone && <Icon name="check" size={14} />}
                {isCurrent && <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />}
              </span>
              <span className={isCurrent ? "font-semibold" : "font-medium"}>{label}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
