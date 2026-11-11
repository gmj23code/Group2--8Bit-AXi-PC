"use client";

import { useRouter } from "next/navigation";
import { PreferencesForm } from "@/components/PreferencesForm";
import { usePreferences } from "@/lib/preferences-store";
import { EMPTY_PREFERENCES } from "@/lib/schema";

/** First-run setup. Settings reuses the same form. */
export default function PreferencesPage() {
  const router = useRouter();
  const saved = usePreferences();

  return (
    <div className="pt-6">
      <title>Set up · Picky Eater</title>
      <h1 className="text-3xl font-extrabold">Let&apos;s set you up</h1>
      <p className="text-lg text-ink-soft mt-2 mb-6">Tap everything that applies. You can change this any time.</p>
      {saved !== undefined && (
        <PreferencesForm
          initial={saved ?? EMPTY_PREFERENCES}
          submitLabel="Save and scan a menu →"
          onSaved={() => router.push("/scan")}
        />
      )}
    </div>
  );
}
