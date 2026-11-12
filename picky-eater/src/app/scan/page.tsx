"use client";

import { useLayoutEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, ButtonLink } from "@/components/Button";
import { DemoGallery } from "@/components/demo/DemoGallery";
import { DemoMenuView } from "@/components/demo/DemoMenuView";
import { MenuPhoto, SCENE_H, SCENE_W } from "@/components/demo/MenuArt";
import { Scaled } from "@/components/demo/Scaled";
import { DemoToggle } from "@/components/DemoToggle";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { Icon } from "@/components/Icon";
import { LoadingScan } from "@/components/LoadingScan";
import { MenuCapture } from "@/components/MenuCapture";
import { ProfileSummary } from "@/components/ProfileSummary";
import { SelectedPages } from "@/components/SelectedPages";
import { ScanError, scanDemoMenu, scanMenu, type ScanProgress } from "@/lib/analyze-client";
import { getDemoMenu } from "@/lib/demo";
import { LIMITS } from "@/lib/limits";
import { useLiveScanning } from "@/lib/live-status";
import { analysisStore, setDemoMode, useDemoMode, usePreferences } from "@/lib/preferences-store";
import { InputError, addFiles, type ScanSelection } from "@/lib/scan-input";

export default function ScanPage() {
  const router = useRouter();
  const prefs = usePreferences();
  const demo = useDemoMode();
  const live = useLiveScanning();
  const [demoMenuId, setDemoMenuId] = useState<string | null>(null);
  const [selection, setSelection] = useState<ScanSelection>(null);
  const [preparing, setPreparing] = useState(false);
  const [progress, setProgress] = useState<ScanProgress | null>(null); // non-null while scanning
  const [fileError, setFileError] = useState<string | null>(null); // couldn't open/split the file
  const [scanError, setScanError] = useState<ScanError | null>(null); // scan failed
  const [noKey, setNoKey] = useState(false); // the server turned out to have no API key

  // Next.js keeps this page alive (hidden) after navigating to Results. Without this, coming
  // back via "Try another menu" would show the finished scanning screen. Reset the transient
  // parts when the page is hidden; a layout effect avoids any flash of stale state.
  useLayoutEffect(
    () => () => {
      setProgress(null);
      setDemoMenuId(null);
      setScanError(null);
    },
    [],
  );

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

  const demoMenu = getDemoMenu(demoMenuId);
  const liveAvailable = live === true && !noKey;

  function openSampleMenus() {
    setScanError(null);
    setDemoMode(true);
    setDemoMenuId(null);
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

  async function runScan() {
    if (!prefs) return;
    setScanError(null);
    try {
      if (demo && demoMenu) {
        // Demo: scored on this device. Never calls the server or the AI.
        setProgress({ stage: "reading", total: demoMenu.pages.length, done: [], active: [1] });
        analysisStore.save(await scanDemoMenu(demoMenu, prefs, setProgress));
      } else {
        const pages = selection?.pages ?? [];
        setProgress({ stage: "reading", total: pages.length, done: [], active: [] });
        analysisStore.save(await scanMenu(pages, prefs, setProgress));
      }
      router.push("/results");
    } catch (e) {
      const err = e instanceof ScanError ? e : new ScanError("ai_unavailable", "Something went wrong. Please try again.");
      if (err.code === "no_api_key") setNoKey(true); // show the friendly note, not an error
      else setScanError(err);
      setProgress(null);
    }
  }

  /* ---------- Scanning ---------- */
  if (progress) {
    const total = demo && demoMenu ? demoMenu.pages.length : (selection?.pages.length ?? 1);
    const renderPage = (n: number, size: "large" | "thumb") => {
      if (demo && demoMenu) {
        return (
          // Thumbnails are cropped by their tile, so both sizes use the same scaled art.
          <Scaled width={SCENE_W} height={SCENE_H}>
            <MenuPhoto menu={demoMenu} page={n} />
          </Scaled>
        );
      }
      const src = selection?.pages[n - 1]?.previewUrl;
      if (!src) return null;
      return size === "large" ? (
        // eslint-disable-next-line @next/next/no-img-element -- local data URL
        <img src={src} alt="" className="w-full aspect-[3/4] object-cover object-top" />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- local data URL
        <img src={src} alt="" className="absolute inset-0 w-full h-full object-cover object-top" />
      );
    };
    return (
      <>
        <title>Reading the menu… · Picky Eater</title>
        <LoadingScan
          totalPages={total}
          renderPage={renderPage}
          progress={progress}
          language={demo && demoMenu && demoMenu.language.code !== "EN" ? demoMenu.language.english : undefined}
          demo={demo}
        />
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

      {demo ? (
        demoMenu ? (
          <DemoMenuView menu={demoMenu} onBack={() => setDemoMenuId(null)} onScan={() => void runScan()} />
        ) : (
          <DemoGallery onPick={setDemoMenuId} />
        )
      ) : live === undefined && !noKey ? (
        <p role="status" className="text-center text-ink-soft py-6">
          Checking live scanning…
        </p>
      ) : !liveAvailable ? (
        <LiveScanNote onOpenSamples={openSampleMenus} />
      ) : scanError ? (
        <ErrorState
          error={scanError}
          onRetry={() => void runScan()}
          onRetake={() => {
            setScanError(null);
            setSelection(null);
          }}
          onDemo={openSampleMenus}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {selection ? (
            <>
              <SelectedPages selection={selection} onRemovePage={removePage} onClear={() => setSelection(null)} />
              <Button onClick={() => void runScan()} className="w-full" disabled={preparing}>
                {selection.pages.length > 1 ? `Check all ${selection.pages.length} pages` : "Check this menu"}
              </Button>
              {selection.kind === "photos" && selection.pages.length < LIMITS.maxPhotos && (
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

/** Shown instead of uploads when live AI scanning isn't set up yet. Never an error. */
function LiveScanNote({ onOpenSamples }: { onOpenSamples: () => void }) {
  return (
    <div className="rounded-card border border-line bg-surface p-6 shadow-card flex flex-col items-center text-center gap-3">
      <span className="w-12 h-12 rounded-full grid place-items-center bg-brand-soft text-brand">
        <Icon name="camera" size={24} />
      </span>
      <h2 className="font-display text-[1.9rem] leading-tight">Live scanning coming soon</h2>
      <p className="text-ink-soft max-w-md">Try one of our sample menus! Six restaurants, six languages, scored against your preferences.</p>
      <Button onClick={onOpenSamples} className="w-full max-w-md mt-1">
        Open sample menus
      </Button>
    </div>
  );
}
