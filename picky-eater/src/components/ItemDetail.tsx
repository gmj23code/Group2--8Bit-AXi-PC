"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ButtonLink } from "@/components/Button";
import { Disclaimer } from "@/components/Disclaimer";
import { EmptyState } from "@/components/EmptyState";
import { Icon } from "@/components/Icon";
import { placeLabel } from "@/components/ResultCard";
import { ScoreBadge, bandFor } from "@/components/ScoreBadge";
import { TagList } from "@/components/TagList";
import { Warnings } from "@/components/Warnings";
import { useAnalysis, usePreferences } from "@/lib/preferences-store";
import { hardRules } from "@/lib/rules";

/** Fallback when a label isn't in the user's current rules (e.g. preferences changed since the scan). */
function fallbackQuestion(label: string): string {
  const allergy = label.match(/^(.+) allergy$/);
  if (allergy) return `Does this have any ${allergy[1].toLowerCase()} in it, even in the sauce or oil?`;
  return `Is this dish okay for: ${label}?`;
}

export function ItemDetail() {
  const { id } = useParams<{ id: string }>();
  const analysis = useAnalysis();
  const prefs = usePreferences();

  if (analysis === undefined) return null;

  const item = analysis?.items.find((i) => i.id === decodeURIComponent(id));
  if (!item) {
    return (
      <div className="pt-8">
        <title>Dish not found · Picky Eater</title>
        <h1 className="sr-only">Dish not found</h1>
        <EmptyState
          title="We couldn't find that dish"
          actions={
            <ButtonLink href={analysis ? "/results" : "/scan"} className="w-full">
              {analysis ? "Back to results" : "Scan a menu"}
            </ButtonLink>
          }
        >
          <p>{analysis ? "It may be from an older scan." : "Your last scan has ended. Scan the menu again to see dishes."}</p>
        </EmptyState>
      </div>
    );
  }

  // Each rule knows its own plain-language question (see rules.ts).
  const rules = prefs ? hardRules(prefs) : [];
  const questions = [...item.violatesRestrictions, ...item.askAbout].map(
    (label) => rules.find((r) => r.label === label)?.question ?? fallbackQuestion(label),
  );
  const band = bandFor(item);

  return (
    <article className="pt-4 flex flex-col gap-5">
      <title>{`${item.name} · Picky Eater`}</title>
      <Link
        href="/results"
        className="self-start -ml-2 min-h-12 px-2 inline-flex items-center gap-1 rounded-lg font-medium text-ink-soft hover:text-ink hover:bg-subtle"
      >
        <Icon name="chevronLeft" /> All dishes
      </Link>

      <header className="flex items-center gap-5">
        <ScoreBadge item={item} size="lg" />
        <div className="min-w-0">
          {placeLabel(item) && <p className="text-sm font-medium text-ink-soft mb-1">{placeLabel(item)}</p>}
          <h1 dir="auto" className="font-display text-[2.6rem] leading-[1.05]">{item.name}</h1>
          {item.englishName && <p className="mt-1 text-lg text-ink-soft italic">{item.englishName}</p>}
          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-ink-soft">
            {item.price && <span className="font-medium text-ink tabular-nums">{item.price}</span>}
            <span className={`inline-flex items-center gap-1.5 font-medium ${band.text}`}>
              <span className={`w-2 h-2 rounded-full ${band.dot}`} aria-hidden="true" />
              {item.score} out of 100 · {band.label}
            </span>
          </p>
        </div>
      </header>

      {item.description && <p className="text-ink-soft leading-relaxed">{item.description}</p>}

      <Warnings item={item} />

      <section className="rounded-card bg-surface border border-line p-5 sm:p-6 shadow-card">
        <h2 className="text-lg font-semibold mb-3">Why this score</h2>
        <ul className="flex flex-col gap-2.5">
          {item.reasons.map((r, i) => (
            <li key={i} className="flex gap-3">
              <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-ink-soft shrink-0" aria-hidden="true" />
              <span>{r}</span>
            </li>
          ))}
        </ul>
        {item.tags.length > 0 && (
          <div className="mt-5 pt-4 border-t border-line">
            <TagList tags={item.tags} />
          </div>
        )}
      </section>

      {questions.length > 0 && (
        <section className="rounded-card bg-surface border border-line p-5 sm:p-6 shadow-card">
          <h2 className="text-lg font-semibold mb-1">Questions for your server</h2>
          <p className="text-ink-soft mb-3">Read these out, or show this screen.</p>
          <ul className="flex flex-col gap-2">
            {questions.map((q) => (
              <li key={q} className="rounded-lg bg-subtle px-4 py-3 font-medium">
                “{q}”
              </li>
            ))}
          </ul>
        </section>
      )}

      <Disclaimer />

      <ButtonLink href="/results" variant="secondary" className="w-full">
        Back to all dishes
      </ButtonLink>
    </article>
  );
}
