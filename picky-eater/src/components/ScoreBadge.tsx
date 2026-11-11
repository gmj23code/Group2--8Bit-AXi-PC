import type { MenuItem } from "@/lib/schema";

// Score bands from the spec. Each band has a color AND a word AND a symbol,
// so the meaning never depends on color alone.
export type Band = { label: string; symbol: string; text: string; bg: string; ring: string };

export function bandFor(item: Pick<MenuItem, "score" | "violatesRestrictions">): Band {
  if (item.violatesRestrictions.length > 0)
    return { label: "Not safe", symbol: "✕", text: "text-bad", bg: "bg-bad-bg", ring: "border-bad" };
  if (item.score >= 80) return { label: "Great fit", symbol: "✓", text: "text-great", bg: "bg-great-bg", ring: "border-great" };
  if (item.score >= 50) return { label: "Good", symbol: "●", text: "text-okay", bg: "bg-okay-bg", ring: "border-okay" };
  if (item.score >= 20) return { label: "Not ideal", symbol: "▲", text: "text-meh", bg: "bg-meh-bg", ring: "border-meh" };
  return { label: "Poor fit", symbol: "✕", text: "text-bad", bg: "bg-bad-bg", ring: "border-bad" };
}

type ScoreBadgeProps = {
  item: Pick<MenuItem, "score" | "violatesRestrictions">;
  size?: "md" | "lg";
};

export function ScoreBadge({ item, size = "md" }: ScoreBadgeProps) {
  const band = bandFor(item);
  const lg = size === "lg";
  return (
    <div
      className={`shrink-0 flex flex-col items-center justify-center rounded-2xl border-2 ${band.bg} ${band.ring} ${band.text} ${
        lg ? "w-32 h-32" : "w-20 h-20"
      }`}
      // One clear sentence for screen readers instead of reading the pieces.
      role="img"
      aria-label={`Score ${item.score} out of 100: ${band.label}`}
    >
      <span className={`font-extrabold leading-none ${lg ? "text-5xl" : "text-3xl"}`}>{item.score}</span>
      <span className={`font-extrabold mt-1 ${lg ? "text-base" : "text-xs"}`}>
        {band.symbol} {band.label}
      </span>
    </div>
  );
}
