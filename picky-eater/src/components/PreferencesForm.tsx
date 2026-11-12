"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ALLERGIES, GOALS, RESTRICTIONS } from "@/lib/options";
import { EMPTY_PREFERENCES, type Preferences } from "@/lib/schema";
import { savePreferences } from "@/lib/preferences-store";
import { useUnsavedGuard } from "@/lib/use-unsaved-guard";
import { Button } from "./Button";
import { ChipGroup } from "./ChipGroup";
import { ConfirmDialog } from "./ConfirmDialog";
import { Icon } from "./Icon";
import { PriorityRanker } from "./PriorityRanker";
import { RuleChips } from "./RuleChips";

type PreferencesFormProps = {
  initial: Preferences | null;
  /** Page title/intro, shown under the Back button. */
  intro: ReactNode;
  /** Settings also offers a plain "Save" that stays on the page. */
  allowSaveInPlace?: boolean;
  onSavedInPlace?: (warning?: string) => void;
};

const HOME = "/";

function toggle(list: string[], id: string) {
  // Appending keeps goal order = the order they were tapped, which becomes the default ranking.
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}

export function PreferencesForm({ initial, intro, allowSaveInPlace = false, onSavedInPlace }: PreferencesFormProps) {
  const router = useRouter();
  const [baseline, setBaseline] = useState<Preferences>(initial ?? EMPTY_PREFERENCES);
  const [prefs, setPrefs] = useState<Preferences>(baseline);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const dirty = JSON.stringify(prefs) !== JSON.stringify(baseline);
  const guard = useUnsavedGuard(dirty, () => void savePreferences(prefs));

  /** Saves, then optionally navigates. Returns false if saving failed. */
  async function save(then?: string): Promise<boolean> {
    setSaving(true);
    guard.setAutoSave(false); // this explicit save replaces the safety-net auto-save
    const result = await savePreferences(prefs);
    setSaving(false);
    if (!result.ok) {
      guard.setAutoSave(true);
      setError(result.message);
      return false;
    }
    setError(null);
    setBaseline(prefs);
    if (then) router.push(then);
    else {
      guard.setAutoSave(true);
      onSavedInPlace?.(result.warning);
    }
    return true;
  }

  function goBack() {
    if (dirty) guard.requestLeave(HOME);
    else router.push(HOME);
  }

  const pending = guard.pendingHref;

  return (
    <>
      <button
        type="button"
        onClick={goBack}
        className="-ml-2 mt-4 min-h-12 px-2 inline-flex items-center gap-1 rounded-lg font-medium text-ink-soft hover:text-ink hover:bg-subtle"
      >
        <Icon name="chevronLeft" /> Back
      </button>

      <div className="mt-2 mb-6">{intro}</div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void save("/scan");
        }}
        className="flex flex-col gap-5"
      >
        <Section step={1} title="Diets" hint="Anything that breaks these is flagged as not safe. Tap “Other” to add your own.">
          <RuleChips
            kind="diet"
            options={RESTRICTIONS}
            selected={prefs.restrictions}
            onToggle={(id) => setPrefs((p) => ({ ...p, restrictions: toggle(p.restrictions, id) }))}
            custom={prefs.customRestrictions}
            onCustomChange={(customRestrictions) => setPrefs((p) => ({ ...p, customRestrictions }))}
          />
        </Section>

        <Section step={2} title="Allergies" hint="Always treated as a hard no. Tap “Other” for anything not listed.">
          <RuleChips
            kind="allergy"
            options={ALLERGIES}
            selected={prefs.allergies}
            onToggle={(id) => setPrefs((p) => ({ ...p, allergies: toggle(p.allergies, id) }))}
            custom={prefs.customAllergies}
            onCustomChange={(customAllergies) => setPrefs((p) => ({ ...p, customAllergies }))}
          />
        </Section>

        <Section step={3} title="Health goals" hint="Pick as many as you like, then rank them.">
          <ChipGroup
            label="Health goals"
            options={GOALS}
            selected={prefs.goals}
            onToggle={(id) => setPrefs((p) => ({ ...p, goals: toggle(p.goals, id) }))}
          />
          <PriorityRanker goals={prefs.goals} onChange={(goals) => setPrefs((p) => ({ ...p, goals }))} />
        </Section>

        <Section step={4} title="Anything else?" hint="Optional, and not a hard rule. For example, “not too spicy” or “smaller portions”.">
          <label htmlFor="notes" className="sr-only">
            Other food notes
          </label>
          <input
            id="notes"
            type="text"
            maxLength={200}
            value={prefs.notes}
            onChange={(e) => setPrefs((p) => ({ ...p, notes: e.target.value }))}
            placeholder="Type here"
            className="w-full min-h-14 px-4 rounded-xl border border-line-strong bg-surface text-base placeholder:text-ink-soft"
          />
        </Section>

        {/* Action bar pinned to the bottom of the screen, so it's always one tap away while scrolling. */}
        <div className="fixed bottom-0 inset-x-0 z-10 border-t border-line bg-canvas/90 backdrop-blur-md">
          <div className="max-w-2xl mx-auto px-5 py-3 flex flex-col gap-2">
            {error && (
              <p role="alert" className="text-bad font-semibold">
                {error}
              </p>
            )}
            <p className="text-sm text-ink-soft text-center" aria-live="polite">
              {dirty ? "You have unsaved changes" : initial ? "All changes saved" : "Nothing saved yet"}
            </p>
            <div className="flex gap-2.5">
              {allowSaveInPlace && (
                <Button type="button" variant="secondary" disabled={saving || !dirty} onClick={() => void save()}>
                  Save
                </Button>
              )}
              <Button type="submit" className="flex-1" disabled={saving}>
                {saving ? "Saving…" : "Save & Scan Menu"} {!saving && <span aria-hidden="true">→</span>}
              </Button>
            </div>
          </div>
        </div>
      </form>

      <ConfirmDialog
        open={pending !== null}
        title="Save changes?"
        onCancel={guard.cancelLeave}
        actions={
          <>
            <Button
              onClick={async () => {
                const target = pending;
                guard.cancelLeave();
                if (target) await save(target);
              }}
            >
              Save changes
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                const target = pending;
                guard.setAutoSave(false);
                guard.cancelLeave();
                if (target) router.push(target);
              }}
            >
              Don&apos;t save
            </Button>
            <Button variant="ghost" onClick={guard.cancelLeave}>
              Keep editing
            </Button>
          </>
        }
      >
        You changed your preferences but haven&apos;t saved them yet.
      </ConfirmDialog>
    </>
  );
}

export function Section({
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
    <section className="rounded-card bg-surface border border-line p-5 sm:p-6 shadow-card">
      <p className="text-sm font-medium text-ink-soft tabular-nums">Step {step} of 4</p>
      <h2 className="font-display text-[1.9rem] leading-tight mt-1">{title}</h2>
      <p className="text-ink-soft mt-1 mb-5">{hint}</p>
      {children}
    </section>
  );
}
