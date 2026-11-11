"use client";

import type { Option } from "@/lib/options";

type ChipGroupProps = {
  options: Option[];
  selected: string[];
  onToggle: (id: string) => void;
  /** Background tint for unselected chips, so each section feels distinct. */
  tint?: "peach" | "lavender" | "sky";
  label: string;
};

const tints = {
  peach: "bg-peach",
  lavender: "bg-lavender",
  sky: "bg-sky",
};

/**
 * Multi-select chips. Each chip is a toggle button (aria-pressed), and selected
 * chips show a ✓ as well as a color change, so state never relies on color alone.
 */
export function ChipGroup({ options, selected, onToggle, tint = "peach", label }: ChipGroupProps) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-3">
      {options.map((opt) => {
        const isOn = selected.includes(opt.id);
        return (
          <button
            key={opt.id}
            type="button"
            aria-pressed={isOn}
            onClick={() => onToggle(opt.id)}
            className={`min-h-12 px-4 rounded-full border-2 text-base font-bold inline-flex items-center gap-2 transition-colors ${
              isOn
                ? "bg-brand text-white border-brand-dark"
                : `${tints[tint]} text-ink border-transparent hover:border-line`
            }`}
          >
            <span aria-hidden="true">{isOn ? "✓" : opt.emoji}</span>
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
