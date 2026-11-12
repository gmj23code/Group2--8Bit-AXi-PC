"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, ButtonLink } from "@/components/Button";
import { DemoMenuPages } from "@/components/DemoMenuPages";
import { DemoToggle } from "@/components/DemoToggle";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { Icon } from "@/components/Icon";
import { LoadingScan } from "@/components/LoadingScan";
import { MenuCapture } from "@/components/MenuCapture";
import { ProfileSummary } from "@/components/ProfileSummary";
import { SelectedPages } from "@/components/SelectedPages";
import { ScanError, scanMenu, type ScanProgress } from "@/lib/analyze-client";
import { demoPageImages } from "@/lib/demo-menu-svg";
import { LIMITS } from "@/lib/limits";
import { analysisStore, setDemoMode, useDemoMode, usePreferences } from "@/lib/preferences-store";
import { InputError, addFiles, type ScanSelection } from "@/lib/scan-input";

export default function ScanPage() {
  const router = useRouter();
  const prefs = usePreferences();
  const demo = useDemoMode();
  const [selection, setSelection] = useState<ScanSelection>(null);
  const [preparing, setPreparing] = useState(false);
  const [progress, setProgress] = useState<ScanProgress | null>(null); // non-null while scanning
  const [fileError, setFileError] = useState<string | null>(null); // couldn't open/split the file
  const [scanError, setScanError] = useState<ScanError | null>(null); // scan failed

  if (prefs === undefined) return null;

  if (prefs === null) {
    return (
      <div className="pt-8">
        <title>Scan a menu · Picky Eater</title>
        <EmptyState
          title="First, tell us what you eat"
          actions={
            <ButtonLink href="/preferences" className="w-full">
              Set my preferences
            </ButtonLink>
          }
        >
          <p>We need your diet, allergies, and goals to score the menu for you.</p>
        </EmptyState>
      </div>
    );
  }

  async function handleFiles(files: File[]) {
    setFileError(null);
    setScanError(null);
    setPreparing(true);
    try {
      setSelection(await addFiles(selection, files));
    } catch (e) {
      setFileError(e instanceof InputError ? e.message : "We couldn't open that file.");
    } finally {
      setPreparing(false);
    }
  }

  function removePage(id: string) {
    if (selection?.kind !== "photos") return;
    const pages = selection.pages.filter((p) => p.id !== id);
    setSelection(pages.length ? { ...selection, pages } : null);
  }

  async function handleScan() {
    if (!prefs) return;
    setScanError(null);
    const pages = demo ? [] : (selection?.pages ?? []);
    setProgress({ stage: "reading", total: demo ? 3 : pages.length, done: [], active: [] });
    try {
      analysisStore.save(await scanMenu(pages, prefs, demo, setProgress));
      router.push("/results");
    } catch (e) {
      setScanError(e instanceof ScanError ? e : new ScanError("ai_unavailable", "Something went wrong. Please try again."));
      setProgress(null);
    }
  }

  // In demo mode, the 3-page sample menu stands in for the user's own pages.
  const showDemoMenu = demo;
  const pageCount = selection?.pages.length ?? 0;
  const canAddPhotos = !selection || (selection.kind === "photos" && pageCount < LIMITS.maxPhotos);

  if (progress) {
    const previews = demo ? demoPageImages() : (selection?.pages.map((p) => p.previewUrl ?? null) ?? []);
    return (
      <>
        <title>Reading the menu… · Picky Eater</title>
        <LoadingScan previews={previews} progress={progress} demo={demo} />
      </>
    );
  }

  return (
    <div className="pt-8 flex flex-col gap-5">
      <title>Scan a menu · Picky Eater</title>
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-brand">Scan</p>
        <h1 className="mt-2 font-display text-[2.6rem] leading-[1.05]">Scan a menu</h1>
      </div>
      <ProfileSummary prefs={prefs} />
      <DemoToggle />

      {scanError ? (
        <ErrorState
          error={scanError}
          onRetry={() => void handleScan()}
          onRetake={() => {
            setScanError(null);
            setSelection(null);
          }}
          onDemo={() => {
            setScanError(null);
            setDemoMode(true);
          }}
        />
      ) : showDemoMenu ? (
        <div className="flex flex-col gap-3">
          <DemoMenuPages />
          <Button onClick={() => void handleScan()} className="w-full">
            Check all 3 pages
          </Button>
          <p className="text-sm text-ink-soft text-center">Turn off Demo mode to scan your own menu.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {selection ? (
            <>
              <SelectedPages selection={selection} onRemovePage={removePage} onClear={() => setSelection(null)} />
              <Button onClick={() => void handleScan()} className="w-full" disabled={preparing}>
                {pageCount > 1 ? `Check all ${pageCount} pages` : "Check this menu"}
              </Button>
              {canAddPhotos && (
                <>
                  <p className="mt-2 text-sm text-ink-soft text-center">More pages? Add one photo per page.</p>
                  <MenuCapture onFiles={handleFiles} disabled={preparing} quiet adding />
                </>
              )}
            </>
          ) : (
            <>
              <p className="text-ink-soft">
                Take a photo of each page, or upload a PDF menu (up to {LIMITS.maxPdfPages} pages). Lay the menu flat in good
                light.
              </p>
              <MenuCapture onFiles={handleFiles} disabled={preparing} />
            </>
          )}
        </div>
      )}

      {fileError && (
        <p role="alert" className="flex gap-2.5 rounded-lg bg-bad-bg text-bad font-medium px-4 py-3">
          <Icon name="alert" size={18} className="mt-0.5" />
          {fileError}
        </p>
      )}
      {preparing && (
        <p role="status" className="text-center font-medium text-ink-soft">
          Getting your menu ready…
        </p>
      )}
    </div>
  );
}
