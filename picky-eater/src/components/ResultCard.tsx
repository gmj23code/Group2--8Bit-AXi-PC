import Link from "next/link";
import type { MenuItem } from "@/lib/schema";
import { ScoreBadge } from "./ScoreBadge";
import { TagList } from "./TagList";
import { Warnings } from "./Warnings";

/** One dish in the results list. The whole card is a single big link to the detail screen. */
export function ResultCard({ item, topPick = false }: { item: MenuItem; topPick?: boolean }) {
  return (
    <Link
      href={`/results/${item.id}`}
      className={`block rounded-card bg-white border-2 p-4 shadow-sm hover:shadow-md transition-shadow ${
        topPick ? "border-great" : "border-line"
      }`}
    >
      {topPick && (
        <p className="mb-2 inline-block rounded-full bg-great text-white text-sm font-extrabold px-3 py-1">
          <span aria-hidden="true">⭐ </span>Top pick for you
        </p>
      )}
      <div className="flex gap-4">
        <ScoreBadge item={item} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-xl font-extrabold leading-snug">{item.name}</h2>
            {item.price && <span className="shrink-0 text-lg font-bold text-ink-soft">{item.price}</span>}
          </div>
          {item.reasons[0] && <p className="mt-1 text-ink-soft">{item.reasons[0]}</p>}
        </div>
        <span className="self-center text-2xl text-ink-soft" aria-hidden="true">
          ›
        </span>
      </div>
      <div className="mt-3 flex flex-col gap-2">
        <Warnings item={item} compact />
        <TagList tags={item.tags} max={3} />
      </div>
    </Link>
  );
}
