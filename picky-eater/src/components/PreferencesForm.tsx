"use client";

import { useState, type ReactNode } from "react";
import { ALLERGIES, GOALS, RESTRICTIONS } from "@/lib/options";
import type { Preferences } from "@/lib/schema";
import { savePreferences } from "@/lib/preferences-store";
import { ChipGroup } from "./ChipGroup";
import { PriorityRanker } from "./PriorityRanker";
import { Button } from "./Button";

type PreferencesFormProps = {
  initial: Preferences;
  submitLabel: string;
  onSaved?: (prefs: Preferences, warning?: string) => void;
};

function toggle(list: string[], id: string) {
  // Appending keeps goal order = the order they were tapped, which becomes the default ranking.
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

export function PreferencesForm({ initial, submitLabel, onSaved }: PreferencesFormProps) {
  const [prefs, setPrefs] = useState<Preferences>(initial);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const result = await savePreferences(prefs);
    setSaving(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setError(null);
    onSaved?.(prefs, result.warning);
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void handleSave();
      }}
      className="flex flex-col gap-6"
    >
      <Section
        step={1}
        title="Do you follow a diet?"
        hint="We'll warn you about anything that breaks it."
      >
        <ChipGroup
          label="Diets"
          options={RESTRICTIONS}
          selected={prefs.restrictions}
          onToggle={(id) => setPrefs((p) => ({ ...p, restrictions: toggle(p.restrictions, id) }))}
          tint="peach"
        />
      </Section>

      <Section step={2} title="Any food allergies?" hint="These are always treated as a hard “no”.">
        <ChipGroup
          label="Allergies"
          options={ALLERGIES}
          selected={prefs.allergies}
          onToggle={(id) => setPrefs((p) => ({ ...p, allergies: toggle(p.allergies, id) }))}
          tint="lavender"
        />
      </Section>

      <Section step={3} title="What are your health goals?" hint="Pick as many as you like.">
        <ChipGroup
          label="Health goals"
          options={GOALS}
          selected={prefs.goals}
          onToggle={(id) => setPrefs((p) => ({ ...p, goals: toggle(p.goals, id) }))}
          tint="sky"
        />
        <PriorityRanker goals={prefs.goals} onChange={(goals) => setPrefs((p) => ({ ...p, goals }))} />
      </Section>

      <Section step={4} title="Anything else?" hint="Optional. For example: “no cilantro” or “no spicy food”.">
        <label htmlFor="notes" className="sr-only">
          Other food notes
        </label>
        <input
          id="notes"
          type="text"
          maxLength={200}
          value={prefs.notes}
          onChange={(e) => setPrefs((p) => ({ ...p, notes: e.target.value }))}
          placeholder="Type here…"
          className="w-full min-h-14 px-4 rounded-2xl border-2 border-line bg-white text-lg placeholder:text-ink-soft"
        />
      </Section>

      {/* Save bar stays pinned to the bottom of the screen on phones. */}
      <div className="fixed bottom-0 inset-x-0 z-10 border-t border-line bg-cream/95 backdrop-blur">
        <div className="max-w-2xl mx-auto px-4 py-3 flex flex-col gap-2">
          {error && (
            <p role="alert" className="text-bad font-bold">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? "Saving…" : submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );
}

function Section({
  step,
  title,
  hint,
  children,
}: {
  step: number;
  title: string;
  hint: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-card bg-white/70 border border-line p-5 shadow-sm">
      <h2 className="text-xl font-extrabold flex items-center gap-3">
        <span className="w-8 h-8 rounded-full bg-ink text-white text-base grid place-items-center" aria-hidden="true">
          {step}
        </span>
        {title}
      </h2>
      <p className="text-ink-soft mt-1 mb-4">{hint}</p>
      {children}
    </section>
  );
}
