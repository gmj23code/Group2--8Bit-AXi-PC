"use client";

import { labelFor } from "@/lib/options";

type PriorityRankerProps = {
  goals: string[];
  onChange: (goals: string[]) => void;
};

/**
 * Ordered list of chosen goals. Big ▲/▼ buttons instead of drag-and-drop: easier for
 * older users and touch screens, works with keyboards and screen readers, no extra library.
 */
export function PriorityRanker({ goals, onChange }: PriorityRankerProps) {
  if (goals.length === 0) return null;

  function move(from: number, to: number) {
    const next = [...goals];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  }

  return (
    <div className="mt-5 rounded-card bg-white border-2 border-line p-4">
      <h3 className="text-lg font-extrabold">Your priorities</h3>
      <p className="text-ink-soft mb-3">
        {goals.length > 1 ? "Move the most important goal to the top." : "Add more goals to rank them."}
      </p>
      <ol className="flex flex-col gap-2">
        {goals.map((id, i) => {
          const label = labelFor(id);
          return (
            <li key={id} className="flex items-center gap-3 rounded-2xl bg-brand-soft px-3 py-2">
              <span className="w-9 h-9 shrink-0 rounded-full bg-brand text-white font-extrabold grid place-items-center">
                {i + 1}
              </span>
              <span className="flex-1 font-bold">{label}</span>
              <button
                type="button"
                onClick={() => move(i, i - 1)}
                disabled={i === 0}
                aria-label={`Move ${label} up`}
                className="w-12 h-12 rounded-xl bg-white border-2 border-line text-xl font-bold disabled:opacity-30"
              >
                ▲
              </button>
              <button
                type="button"
                onClick={() => move(i, i + 1)}
                disabled={i === goals.length - 1}
                aria-label={`Move ${label} down`}
                className="w-12 h-12 rounded-xl bg-white border-2 border-line text-xl font-bold disabled:opacity-30"
              >
                ▼
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
