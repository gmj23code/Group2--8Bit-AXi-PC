"use client";

import { useState } from "react";
import { Button, ButtonLink } from "@/components/Button";
import { Disclaimer } from "@/components/Disclaimer";
import { EmptyState } from "@/components/EmptyState";
import { ResultCard } from "@/components/ResultCard";
import { ScoreLegend } from "@/components/ScoreLegend";
import { useAnalysis } from "@/lib/preferences-store";
import type { MenuItem } from "@/lib/schema";

/** "Safe" = breaks nothing AND needs nothing confirmed with staff. */
const isSafe = (i: MenuItem) => i.violatesRestrictions.length === 0 && i.verdict !== "ask_server";

export default function ResultsPage() {
  const analysis = useAnalysis();
  const [safeOnly, setSafeOnly] = useState(false);

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
              📸 Scan a menu
            </ButtonLink>
          }
        >
          <p>Snap a photo of a menu and we&apos;ll rank every dish for you.</p>
        </EmptyState>
      </div>
    );
  }

  const all = analysis.items; // already sorted by the server rules
  const shown = safeOnly ? all.filter(isSafe) : all;
  const unsafeCount = all.filter((i) => i.violatesRestrictions.length > 0).length;
  const askCount = all.filter((i) => i.violatesRestrictions.length === 0 && i.verdict === "ask_server").length;
  // Top pick = best-scoring dish that's safe and scores at least "Good".
  const topPickId = all.find((i) => isSafe(i) && i.score >= 50)?.id;

  return (
    <div className="pt-6 flex flex-col gap-4">
      <title>Your results · Picky Eater</title>
      <div>
        <h1 className="text-3xl font-extrabold">Your menu, ranked</h1>
        <p className="text-lg text-ink-soft mt-1">
          {all.length} dishes, best for you first.
          {analysis.source === "demo" && (
            <span className="ml-2 inline-block rounded-full bg-lavender px-3 text-base font-bold text-ink">Demo</span>
          )}
        </p>
      </div>

      <Disclaimer />

      {analysis.notice && (
        <p className="rounded-xl bg-okay-bg text-okay font-bold px-4 py-3">
          <span aria-hidden="true">⚠️ </span>
          {analysis.notice}
        </p>
      )}

      {/* Filter: a single big toggle, state shown by text + ✓, not just color. */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          aria-pressed={safeOnly}
          onClick={() => setSafeOnly((v) => !v)}
          className={`min-h-12 px-5 rounded-full border-2 text-lg font-extrabold ${
            safeOnly ? "bg-brand text-white border-brand-dark" : "bg-white border-line hover:bg-brand-soft"
          }`}
        >
          {safeOnly ? "✓ " : ""}Safe for me only
        </button>
        <p className="text-ink-soft font-bold" aria-live="polite">
          {safeOnly
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
          title="No dishes are clearly safe for you"
          actions={
            <Button variant="secondary" className="w-full" onClick={() => setSafeOnly(false)}>
              Show all dishes
            </Button>
          }
        >
          <p>Many kitchens can make changes. Ask your server about leaving out an ingredient or swapping a sauce.</p>
        </EmptyState>
      )}

      <ScoreLegend />

      <ButtonLink href="/scan" variant="secondary" className="w-full">
        📸 Scan another menu
      </ButtonLink>
    </div>
  );
}
