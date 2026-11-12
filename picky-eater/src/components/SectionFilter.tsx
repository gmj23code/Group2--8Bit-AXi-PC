"use client";

import { useId } from "react";
import type { Analysis, MenuItem } from "@/lib/schema";
import { Icon } from "./Icon";

/** Filter value: everything, one page, or one section (optionally within a page). */
export type Place = "all" | `page:${number}` | `section:${string}`;

const key = (page: number | undefined, section: string) => `section:${page ?? 0}|${section}` as const;

export function matchesPlace(item: MenuItem, place: Place): boolean {
  if (place === "all") return true;
  if (place.startsWith("page:")) return item.page === Number(place.slice(5));
  return key(item.page, item.section ?? "") === place;
}

type Group = { label: string; options: { value: Place; label: string }[] };

/** Builds "Page 1 · Starters & Salads → Starters (7), Salads (5)…" from the scanned items. */
function buildGroups(analysis: Analysis): Group[] {
  const items = analysis.items;
  const pageNumbers = [...new Set(items.map((i) => i.page).filter((p): p is number => !!p))].sort((a, b) => a - b);
  const sectionsOf = (page?: number) => {
    // Prefer the menu's own section order; otherwise use first appearance.
    const known = analysis.pages?.find((p) => p.number === page)?.sections;
    if (known?.length) return known.filter((s) => items.some((i) => i.page === page && i.section === s));
    const seen: string[] = [];
    for (const i of items) if (i.section && i.page === page && !seen.includes(i.section)) seen.push(i.section);
    return seen;
  };
  const count = (pred: (i: MenuItem) => boolean) => items.filter(pred).length;

  if (pageNumbers.length > 0) {
    return pageNumbers.map((n) => {
      const title = analysis.pages?.find((p) => p.number === n)?.title;
      return {
        label: `Page ${n}${title ? ` · ${title}` : ""}`,
        options: [
          { value: `page:${n}` as Place, label: `All of page ${n} (${count((i) => i.page === n)})` },
          ...sectionsOf(n).map((s) => ({ value: key(n, s), label: `${s} (${count((i) => i.page === n && i.section === s)})` })),
        ],
      };
    });
  }
  // No page info (e.g. one photo): offer sections only.
  const sections = sectionsOf(undefined);
  return sections.length > 1
    ? [{ label: "Menu sections", options: sections.map((s) => ({ value: key(undefined, s), label: `${s} (${count((i) => i.section === s)})` })) }]
    : [];
}

/** A big native <select>: familiar, accessible, and works well on phones. Hidden if there's nothing to filter by. */
export function SectionFilter({ analysis, value, onChange }: { analysis: Analysis; value: Place; onChange: (p: Place) => void }) {
  const id = useId();
  const groups = buildGroups(analysis);
  if (groups.length === 0) return null;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-ink-soft">
        Show dishes from
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value as Place)}
          className="w-full min-h-12 appearance-none rounded-xl border border-line-strong bg-surface pl-4 pr-11 text-base font-medium"
        >
          <option value="all">Whole menu ({analysis.items.length})</option>
          {groups.map((g) => (
            <optgroup key={g.label} label={g.label}>
              {g.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <Icon name="chevronDown" className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-soft pointer-events-none" />
      </div>
    </div>
  );
}
