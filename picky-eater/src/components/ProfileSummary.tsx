import Link from "next/link";
import { labelFor } from "@/lib/options";
import { hardRules } from "@/lib/rules";
import type { Preferences } from "@/lib/schema";

/** Compact read-only view of what the user picked, with a link to change it. */
export function ProfileSummary({ prefs }: { prefs: Preferences }) {
  const hard = hardRules(prefs).map((r) => r.label);
  return (
    <div className="rounded-card bg-surface border border-line p-5 shadow-card">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold">Checking for you</h2>
        <Link href="/settings" className="text-brand font-semibold underline underline-offset-4 min-h-12 inline-flex items-center">
          Edit
        </Link>
      </div>
      <dl className="grid gap-3 sm:grid-cols-2">
        <div>
          <dt className="text-sm text-ink-soft">Must avoid</dt>
          <dd className="font-medium">{hard.length ? hard.join(", ") : "Nothing"}</dd>
        </div>
        <div>
          <dt className="text-sm text-ink-soft">Goals, most important first</dt>
          <dd className="font-medium">
            {prefs.goals.length ? prefs.goals.map((g, i) => `${i + 1}. ${labelFor(g)}`).join("  ") : "None"}
          </dd>
        </div>
        {prefs.notes && (
          <div className="sm:col-span-2">
            <dt className="text-sm text-ink-soft">Notes</dt>
            <dd className="font-medium">{prefs.notes}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}
