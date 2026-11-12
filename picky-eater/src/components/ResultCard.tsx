import Link from "next/link";
import type { MenuItem } from "@/lib/schema";
import { Icon } from "./Icon";
import { ScoreBadge } from "./ScoreBadge";
import { TagList } from "./TagList";
import { Warnings } from "./Warnings";

/** "Page 2 · Mains", "Page 2", "Mains", or "" — where the dish is on the menu. */
export function placeLabel(item: Pick<MenuItem, "page" | "section">): string {
  return [item.page ? `Page ${item.page}` : "", item.section ?? ""].filter(Boolean).join(" · ");
}

/** One dish in the results list. The whole card is a single big link to the detail screen. */
export function ResultCard({ item, topPick = false }: { item: MenuItem; topPick?: boolean }) {
  return (
    <Link
      href={`/results/${item.id}`}
      className={`group block rounded-card bg-surface border p-4 sm:p-5 shadow-card hover:shadow-lift transition-shadow ${
        topPick ? "border-great/50 ring-1 ring-great/30" : "border-line"
      }`}
    >
      {topPick && (
        <p className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-great">
          <Icon name="star" size={16} /> Top pick for you
        </p>
      )}
      <div className="flex gap-4">
        <ScoreBadge item={item} />
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-3">
            {/* dir="auto": Arabic and other right-to-left names lay out correctly. */}
            <h2 dir="auto" className="text-lg font-semibold leading-snug">
              {item.name}
            </h2>
            {item.price && (
              <span dir="auto" className="shrink-0 font-medium text-ink-soft tabular-nums">
                {item.price}
              </span>
            )}
          </div>
          {item.englishName && <p className="text-ink-soft italic">{item.englishName}</p>}
          {placeLabel(item) && <p className="mt-0.5 text-sm text-ink-soft">{placeLabel(item)}</p>}
          {item.englishName && item.description && <p className="mt-1 text-[0.95rem] text-ink-soft line-clamp-2">{item.description}</p>}
          {item.reasons[0] && <p className="mt-1 text-ink-soft leading-relaxed">{item.reasons[0]}</p>}
        </div>
        <Icon name="chevronRight" className="self-center text-ink-soft group-hover:text-ink" />
      </div>
      {(item.violatesRestrictions.length > 0 || item.verdict === "ask_server" || item.tags.length > 0) && (
        <div className="mt-4 flex flex-col gap-2.5">
          <Warnings item={item} compact />
          <TagList tags={item.tags} max={3} />
        </div>
      )}
    </Link>
  );
}
