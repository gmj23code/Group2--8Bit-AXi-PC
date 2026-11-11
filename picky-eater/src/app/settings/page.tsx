"use client";

import { useState } from "react";
import { AccountCard } from "@/components/AccountCard";
import { PreferencesForm } from "@/components/PreferencesForm";
import { usePreferences } from "@/lib/preferences-store";
import { EMPTY_PREFERENCES } from "@/lib/schema";

type SaveStatus = { kind: "saved" } | { kind: "warning"; message: string } | null;

export default function SettingsPage() {
  const saved = usePreferences();
  const [status, setStatus] = useState<SaveStatus>(null);

  return (
    <div className="pt-6 flex flex-col gap-4">
      <div>
        <title>My preferences · Picky Eater</title>
        <h1 className="text-3xl font-extrabold">My preferences</h1>
        <p className="text-lg text-ink-soft mt-2">These are used every time you scan a menu.</p>
      </div>

      <AccountCard />

      {/* role="status" makes screen readers announce the confirmation. */}
      <div role="status">
        {status?.kind === "saved" && (
          <span className="inline-block rounded-full bg-great-bg text-great font-extrabold px-4 py-2">✓ Saved</span>
        )}
        {status?.kind === "warning" && (
          <p className="rounded-xl bg-okay-bg text-okay font-extrabold px-4 py-3">⚠️ {status.message}</p>
        )}
      </div>

      {saved !== undefined && (
        <PreferencesForm
          // Re-mount the form when the stored copy changes (e.g. pulled from your account after login).
          key={JSON.stringify(saved)}
          initial={saved ?? EMPTY_PREFERENCES}
          submitLabel="Save changes"
          onSaved={(_, warning) => setStatus(warning ? { kind: "warning", message: warning } : { kind: "saved" })}
        />
      )}
    </div>
  );
}
