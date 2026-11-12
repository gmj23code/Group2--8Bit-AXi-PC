"use client";

import { labelFor } from "@/lib/options";
import { Icon } from "./Icon";

type PriorityRankerProps = {
  goals: string[];
  onChange: (goals: string[]) => void;
};

/**
 * Ordered list of chosen goals. Up/down buttons instead of drag-and-drop: easier for
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

  const arrow =
    "w-12 h-12 grid place-items-center rounded-lg border border-line-strong bg-surface text-ink hover:bg-subtle disabled:opacity-30 disabled:hover:bg-surface";

  return (
    <div className="mt-6 border-t border-line pt-5">
      <h3 className="text-base font-semibold">Your priorities</h3>
      <p className="text-ink-soft mb-3">
        {goals.length > 1 ? "Move the most important goal to the top." : "Add more goals to rank them."}
      </p>
      <ol className="flex flex-col gap-2">
        {goals.map((id, i) => {
          const label = labelFor(id);
          return (
            <li key={id} className="flex items-center gap-3 rounded-xl bg-subtle px-3 py-2">
              <span className="w-8 h-8 shrink-0 rounded-full bg-surface border border-line text-sm font-semibold grid place-items-center tabular-nums">
                {i + 1}
              </span>
              <span className="flex-1 font-medium">{label}</span>
              <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0} aria-label={`Move ${label} up`} className={arrow}>
                <Icon name="chevronUp" />
              </button>
              <button
                type="button"
                onClick={() => move(i, i + 1)}
                disabled={i === goals.length - 1}
                aria-label={`Move ${label} down`}
                className={arrow}
              >
                <Icon name="chevronDown" />
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
