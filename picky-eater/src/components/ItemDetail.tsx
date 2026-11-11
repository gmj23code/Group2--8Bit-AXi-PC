"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ButtonLink } from "@/components/Button";
import { Disclaimer } from "@/components/Disclaimer";
import { EmptyState } from "@/components/EmptyState";
import { ScoreBadge, bandFor } from "@/components/ScoreBadge";
import { TagList } from "@/components/TagList";
import { Warnings } from "@/components/Warnings";
import { useAnalysis } from "@/lib/preferences-store";

/** Turns a rule label into a plain question for the server. */
function questionFor(label: string): string {
  const allergy = label.match(/^(.+) allergy$/);
  if (allergy) return `Does this have any ${allergy[1].toLowerCase()} in it, even in the sauce or oil?`;
  return `Is this dish ${label.toLowerCase()}?`;
}

export function ItemDetail() {
  const { id } = useParams<{ id: string }>();
  const analysis = useAnalysis();

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
              {analysis ? "Back to results" : "📸 Scan a menu"}
            </ButtonLink>
          }
        >
          <p>{analysis ? "It may be from an older scan." : "Your last scan has ended. Scan the menu again to see dishes."}</p>
        </EmptyState>
      </div>
    );
  }

  const questions = [...item.violatesRestrictions, ...item.askAbout].map(questionFor);
  const band = bandFor(item);

  return (
    <article className="pt-4 flex flex-col gap-5">
      <title>{`${item.name} · Picky Eater`}</title>
      <Link href="/results" className="self-start min-h-12 inline-flex items-center gap-2 text-lg font-extrabold text-brand-dark">
        <span aria-hidden="true">‹</span> All dishes
      </Link>

      <header className="flex items-center gap-5">
        <ScoreBadge item={item} size="lg" />
        <div className="min-w-0">
          <h1 className="text-3xl font-extrabold leading-tight">{item.name}</h1>
          {item.price && <p className="text-xl font-bold text-ink-soft mt-1">{item.price}</p>}
          <p className={`mt-1 text-lg font-extrabold ${band.text}`}>
            {item.score} out of 100 · {band.label}
          </p>
        </div>
      </header>

      {item.description && <p className="text-lg">{item.description}</p>}

      <Warnings item={item} />

      <section className="rounded-card bg-white border-2 border-line p-5">
        <h2 className="text-xl font-extrabold mb-3">Why this score</h2>
        <ul className="flex flex-col gap-2">
          {item.reasons.map((r, i) => (
            <li key={i} className="flex gap-3 text-lg">
              <span aria-hidden="true">•</span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
        {item.tags.length > 0 && (
          <div className="mt-4">
            <TagList tags={item.tags} />
          </div>
        )}
      </section>

      {questions.length > 0 && (
        <section className="rounded-card bg-peach p-5">
          <h2 className="text-xl font-extrabold mb-3">
            <span aria-hidden="true">🙋 </span>Questions for your server
          </h2>
          <ul className="flex flex-col gap-2 text-lg font-bold">
            {questions.map((q) => (
              <li key={q}>“{q}”</li>
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
