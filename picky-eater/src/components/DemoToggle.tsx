"use client";

import { setDemoMode, useDemoMode } from "@/lib/preferences-store";

/** Big, labeled on/off switch. Uses role="switch" so screen readers announce the state. */
export function DemoToggle() {
  const on = useDemoMode();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => setDemoMode(!on)}
      className="w-full flex items-center justify-between gap-4 rounded-card border-2 border-line bg-white px-4 py-3 text-left min-h-14"
    >
      <span>
        <span className="block font-extrabold text-lg">Demo mode</span>
        <span className="block text-ink-soft">Use a sample menu. No internet needed.</span>
      </span>
      <span
        aria-hidden="true"
        className={`relative shrink-0 w-16 h-9 rounded-full transition-colors ${on ? "bg-brand" : "bg-line border-2 border-ink-soft"}`}
      >
        <span
          className={`absolute top-1 w-7 h-7 rounded-full bg-white shadow transition-all ${on ? "left-8" : "left-1"}`}
        />
      </span>
      <span className={`shrink-0 w-10 font-extrabold ${on ? "text-brand-dark" : "text-ink-soft"}`}>{on ? "ON" : "OFF"}</span>
    </button>
  );
}
