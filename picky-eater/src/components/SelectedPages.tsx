"use client";

import type { ScanSelection } from "@/lib/scan-input";
import { Icon } from "./Icon";

type SelectedPagesProps = {
  selection: NonNullable<ScanSelection>;
  onRemovePage: (id: string) => void;
  onClear: () => void;
};

/** What's about to be scanned: a PDF card, or numbered photo thumbnails (each removable). */
export function SelectedPages({ selection, onRemovePage, onClear }: SelectedPagesProps) {
  if (selection.kind === "pdf") {
    const n = selection.pages.length;
    return (
      <div className="rounded-card border border-line bg-surface p-5 shadow-card flex items-center gap-4">
        <span className="w-14 h-16 shrink-0 rounded-lg bg-bad-bg text-bad grid place-items-center text-sm font-bold">PDF</span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate">{selection.fileName}</p>
          <p className="text-ink-soft">
            {n} {n === 1 ? "page" : "pages"} · ready to scan
          </p>
        </div>
        <button
          type="button"
          onClick={onClear}
          aria-label={`Remove ${selection.fileName}`}
          className="w-12 h-12 shrink-0 grid place-items-center rounded-lg text-ink-soft hover:bg-subtle hover:text-ink"
        >
          <Icon name="x" />
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-card border border-line bg-surface p-4 shadow-card">
      <div className="flex items-baseline justify-between gap-3 mb-3 px-1">
        <p className="font-semibold">
          {selection.pages.length} {selection.pages.length === 1 ? "photo" : "photos"}
        </p>
        <button type="button" onClick={onClear} className="min-h-12 px-2 text-sm font-medium text-ink-soft hover:text-ink">
          Remove all
        </button>
      </div>
      <ol className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {selection.pages.map((p, i) => (
          <li key={p.id} className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element -- local data URL */}
            <img src={p.previewUrl} alt={`Menu photo, page ${i + 1}`} className="w-full aspect-[3/4] object-cover rounded-lg border border-line" />
            <span className="absolute left-1.5 top-1.5 rounded-md bg-ink/80 text-white text-xs font-semibold px-1.5 py-0.5">
              Page {i + 1}
            </span>
            <button
              type="button"
              onClick={() => onRemovePage(p.id)}
              aria-label={`Remove page ${i + 1}`}
              className="absolute right-1 top-1 w-9 h-9 grid place-items-center rounded-full bg-surface/95 text-ink shadow-card hover:bg-surface"
            >
              <Icon name="x" size={16} />
            </button>
          </li>
        ))}
      </ol>
      {selection.pages.some((p) => p.small) && (
        <p className="mt-3 flex gap-2.5 rounded-lg bg-okay-bg text-okay px-4 py-3">
          <Icon name="alert" size={18} className="mt-0.5" />
          Some photos are quite small, so text may be hard to read. Closer photos work best.
        </p>
      )}
    </div>
  );
}
