import type { MenuItem } from "@/lib/schema";

// Score bands from the spec. Each band has a muted color AND a word, so the
// meaning never depends on color alone.
export type Band = { label: string; text: string; bg: string; dot: string };

export function bandFor(item: Pick<MenuItem, "score" | "violatesRestrictions">): Band {
  if (item.violatesRestrictions.length > 0) return { label: "Not safe", text: "text-bad", bg: "bg-bad-bg", dot: "bg-bad" };
  if (item.score >= 80) return { label: "Great fit", text: "text-great", bg: "bg-great-bg", dot: "bg-great" };
  if (item.score >= 50) return { label: "Good", text: "text-okay", bg: "bg-okay-bg", dot: "bg-okay" };
  if (item.score >= 20) return { label: "Not ideal", text: "text-meh", bg: "bg-meh-bg", dot: "bg-meh" };
  return { label: "Poor fit", text: "text-bad", bg: "bg-bad-bg", dot: "bg-bad" };
}

type ScoreBadgeProps = {
  item: Pick<MenuItem, "score" | "violatesRestrictions">;
  size?: "md" | "lg";
};

/** Tinted tile with the score and its band word underneath. */
export function ScoreBadge({ item, size = "md" }: ScoreBadgeProps) {
  const band = bandFor(item);
  const lg = size === "lg";
  return (
    <div
      className={`shrink-0 flex flex-col items-center justify-center rounded-xl ${band.bg} ${band.text} ${
        lg ? "w-28 h-28" : "w-[4.5rem] h-[4.5rem]"
      }`}
      // One clear sentence for screen readers instead of reading the pieces.
      role="img"
      aria-label={`Score ${item.score} out of 100: ${band.label}`}
    >
      <span className={`font-semibold leading-none tabular-nums ${lg ? "text-4xl" : "text-2xl"}`}>{item.score}</span>
      <span className={`font-semibold mt-1.5 ${lg ? "text-sm" : "text-xs"}`}>{band.label}</span>
    </div>
  );
}
