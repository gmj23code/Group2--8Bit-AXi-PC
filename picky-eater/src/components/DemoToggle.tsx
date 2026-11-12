"use client";

import { setDemoMode, useDemoMode } from "@/lib/preferences-store";

/** Labeled on/off switch. role="switch" so screen readers announce the state. */
export function DemoToggle() {
  const on = useDemoMode();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => setDemoMode(!on)}
      className="w-full flex items-center justify-between gap-4 rounded-card border border-line bg-surface px-5 py-4 text-left min-h-14 shadow-card hover:bg-subtle/60"
    >
      <span>
        <span className="block font-semibold">Demo mode</span>
        <span className="block text-ink-soft">Use a sample menu. No internet needed.</span>
      </span>
      <span className="flex items-center gap-3 shrink-0">
        <span className={`text-sm font-semibold w-8 text-right ${on ? "text-brand" : "text-ink-soft"}`}>{on ? "On" : "Off"}</span>
        <span
          aria-hidden="true"
          className={`relative w-14 h-8 rounded-full border transition-colors ${on ? "bg-brand border-brand" : "bg-subtle border-line-strong"}`}
        >
          <span className={`absolute top-[3px] w-6 h-6 rounded-full bg-white shadow-card transition-all ${on ? "left-[26px]" : "left-[3px]"}`} />
        </span>
      </span>
    </button>
  );
}
