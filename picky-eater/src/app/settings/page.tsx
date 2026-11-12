"use client";

import { useState } from "react";
import { AccountCard } from "@/components/AccountCard";
import { Icon } from "@/components/Icon";
import { PreferencesForm } from "@/components/PreferencesForm";
import { usePreferences } from "@/lib/preferences-store";

type SaveStatus = { kind: "saved" } | { kind: "warning"; message: string } | null;

export default function SettingsPage() {
  const saved = usePreferences();
  const [status, setStatus] = useState<SaveStatus>(null);

  return (
    <div>
      <title>My preferences · Picky Eater</title>
      {saved !== undefined && (
        <PreferencesForm
          // Re-mount the form when the stored copy changes (e.g. pulled from your account after login).
          key={JSON.stringify(saved)}
          initial={saved}
          allowSaveInPlace
          onSavedInPlace={(warning) => setStatus(warning ? { kind: "warning", message: warning } : { kind: "saved" })}
          intro={
            <div className="flex flex-col gap-5">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-brand">Settings</p>
                <h1 className="mt-2 font-display text-[2.6rem] leading-[1.05]">My preferences</h1>
                <p className="text-ink-soft mt-1">These are used every time you scan a menu.</p>
              </div>
              <AccountCard />
              {status?.kind === "saved" && (
                <p role="status" className="self-start inline-flex items-center gap-2 rounded-lg bg-great-bg text-great font-medium px-4 py-2.5">
                  <Icon name="check" size={18} /> Saved
                </p>
              )}
              {status?.kind === "warning" && (
                <p role="status" className="flex gap-2.5 rounded-lg bg-okay-bg text-okay px-4 py-3">
                  <Icon name="alert" size={18} className="mt-0.5" />
                  {status.message}
                </p>
              )}
            </div>
          }
        />
      )}
    </div>
  );
}
