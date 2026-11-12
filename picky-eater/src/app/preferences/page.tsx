"use client";

import { PreferencesForm } from "@/components/PreferencesForm";
import { usePreferences } from "@/lib/preferences-store";

/** First-run setup. Settings reuses the same form. */
export default function PreferencesPage() {
  const saved = usePreferences();

  return (
    <div>
      <title>Set up · Picky Eater</title>
      {saved !== undefined && (
        <PreferencesForm
          initial={saved}
          intro={
            <>
              <p className="text-sm font-semibold uppercase tracking-wider text-brand">Get started</p>
              <h1 className="mt-2 font-display text-[2.6rem] leading-[1.05]">Let&apos;s set you up</h1>
              <p className="text-ink-soft mt-1">Tap everything that applies. You can change this any time.</p>
            </>
          }
        />
      )}
    </div>
  );
}
