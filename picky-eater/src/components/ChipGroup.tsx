"use client";

import type { Option } from "@/lib/options";
import { Icon } from "./Icon";

type ChipGroupProps = {
  options: Option[];
  selected: string[];
  onToggle: (id: string) => void;
  label: string;
};

/**
 * Multi-select chips. Each chip is a toggle button (aria-pressed), and selected
 * chips show a check icon as well as a fill change, so state never relies on color alone.
 */
export function ChipGroup({ options, selected, onToggle, label }: ChipGroupProps) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2.5">
      {options.map((opt) => {
        const isOn = selected.includes(opt.id);
        return (
          <button
            key={opt.id}
            type="button"
            aria-pressed={isOn}
            onClick={() => onToggle(opt.id)}
            className={`min-h-12 px-4 rounded-full border text-base font-medium inline-flex items-center gap-2 transition-colors ${
              isOn
                ? "bg-brand text-white border-brand"
                : "bg-surface text-ink border-line-strong hover:bg-subtle"
            }`}
          >
            {isOn && <Icon name="check" size={18} />}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
