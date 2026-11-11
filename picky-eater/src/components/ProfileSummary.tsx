import Link from "next/link";
import { labelFor } from "@/lib/options";
import type { Preferences } from "@/lib/schema";

/** Compact read-only view of what the user picked, with a link to change it. */
export function ProfileSummary({ prefs }: { prefs: Preferences }) {
  const hard = [
    ...prefs.restrictions.map(labelFor),
    ...prefs.allergies.map((a) => `${labelFor(a)} (allergy)`),
  ];
  return (
    <div className="rounded-card bg-white border-2 border-line p-4">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-extrabold">Checking for you</h2>
        <Link href="/settings" className="text-brand-dark font-bold underline underline-offset-4 min-h-12 inline-flex items-center">
          Change
        </Link>
      </div>
      <dl className="mt-1 space-y-2">
        <div>
          <dt className="text-ink-soft">Must avoid</dt>
          <dd className="font-bold">{hard.length ? hard.join(", ") : "Nothing"}</dd>
        </div>
        <div>
          <dt className="text-ink-soft">Goals, most important first</dt>
          <dd className="font-bold">
            {prefs.goals.length ? prefs.goals.map((g, i) => `${i + 1}. ${labelFor(g)}`).join("  ") : "None"}
          </dd>
        </div>
        {prefs.notes && (
          <div>
            <dt className="text-ink-soft">Notes</dt>
            <dd className="font-bold">{prefs.notes}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}
