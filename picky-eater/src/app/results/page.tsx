"use client";

import { useState } from "react";
import { Button, ButtonLink } from "@/components/Button";
import { Disclaimer } from "@/components/Disclaimer";
import { EmptyState } from "@/components/EmptyState";
import { Icon } from "@/components/Icon";
import { ResultCard } from "@/components/ResultCard";
import { ScoreLegend } from "@/components/ScoreLegend";
import { SectionFilter, matchesPlace, type Place } from "@/components/SectionFilter";
import { useAnalysis } from "@/lib/preferences-store";
import type { MenuItem } from "@/lib/schema";

/** "Safe" = breaks nothing AND needs nothing confirmed with staff. */
const isSafe = (i: MenuItem) => i.violatesRestrictions.length === 0 && i.verdict !== "ask_server";

export default function ResultsPage() {
  const analysis = useAnalysis();
  const [safeOnly, setSafeOnly] = useState(false);
  const [place, setPlace] = useState<Place>("all");

  if (analysis === undefined) return null;

  if (!analysis) {
    return (
      <div className="pt-8">
        <title>Results · Picky Eater</title>
        <h1 className="sr-only">Results</h1>
        <EmptyState
          title="No menu scanned yet"
          actions={
            <ButtonLink href="/scan" className="w-full">
              <Icon name="camera" /> Scan a menu
            </ButtonLink>
          }
        >
          <p>Photograph a menu and we&apos;ll rank every dish for you.</p>
        </EmptyState>
      </div>
    );
  }

  const all = analysis.items; // already sorted by the server rules
  // Both filters combine: e.g. "Page 2 · Mains" AND "Safe for me only".
  const inPlace = all.filter((i) => matchesPlace(i, place));
  const shown = safeOnly ? inPlace.filter(isSafe) : inPlace;
  const pageCount = analysis.pages?.length ?? 0;
  const unsafeCount = all.filter((i) => i.violatesRestrictions.length > 0).length;
  const askCount = all.filter((i) => i.violatesRestrictions.length === 0 && i.verdict === "ask_server").length;
  // Top pick = best-scoring dish that's safe and scores at least "Good".
  const topPickId = all.find((i) => isSafe(i) && i.score >= 50)?.id;

  return (
    <div className="pt-8 flex flex-col gap-5">
      <title>Your results · Picky Eater</title>
      <div>
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand">Results</p>
          {analysis.source === "demo" && (
            <span className="rounded-md bg-subtle px-2 py-0.5 text-xs font-semibold text-ink-soft">Demo</span>
          )}
        </div>
        <h1 className="mt-2 font-display text-[2.6rem] leading-[1.05]">Your menu, ranked</h1>
        <p className="text-ink-soft mt-1">
          {all.length} dishes{pageCount > 1 ? ` from ${pageCount} pages` : ""}, best for you first.
        </p>
      </div>

      <Disclaimer />

      {analysis.notice && (
        <p className="flex gap-2.5 rounded-lg bg-okay-bg text-okay px-4 py-3">
          <Icon name="alert" size={18} className="mt-0.5" />
          <span>{analysis.notice}</span>
        </p>
      )}

      <SectionFilter analysis={analysis} value={place} onChange={setPlace} />

      {/* Safe-only toggle: state shown by a check icon + text, not just color. */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <button
          type="button"
          aria-pressed={safeOnly}
          onClick={() => setSafeOnly((v) => !v)}
          className={`min-h-12 px-4 rounded-full border inline-flex items-center gap-2 font-medium ${
            safeOnly ? "bg-brand text-white border-brand" : "bg-surface border-line-strong hover:bg-subtle"
          }`}
        >
          {safeOnly && <Icon name="check" size={18} />}
          Safe for me only
        </button>
        <p className="text-ink-soft" aria-live="polite">
          {safeOnly || place !== "all"
            ? `Showing ${shown.length} of ${all.length}`
            : `${unsafeCount} not safe · ${askCount} to check with your server`}
        </p>
      </div>

      {shown.length > 0 ? (
        <ol className="flex flex-col gap-3">
          {shown.map((item) => (
            <li key={item.id}>
              <ResultCard item={item} topPick={item.id === topPickId} />
            </li>
          ))}
        </ol>
      ) : (
        <EmptyState
          title={place === "all" ? "No dishes are clearly safe for you" : "Nothing safe in this part of the menu"}
          actions={
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => {
                setSafeOnly(false);
                setPlace("all");
              }}
            >
              Show all dishes
            </Button>
          }
        >
          <p>Many kitchens can make changes. Ask your server about leaving out an ingredient or swapping a sauce.</p>
        </EmptyState>
      )}

      <ScoreLegend />

      <ButtonLink href="/scan" variant="secondary" className="w-full">
        <Icon name="camera" /> Scan another menu
      </ButtonLink>
    </div>
  );
}
