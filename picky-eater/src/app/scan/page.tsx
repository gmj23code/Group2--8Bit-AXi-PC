"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, ButtonLink } from "@/components/Button";
import { DemoToggle } from "@/components/DemoToggle";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { LoadingScan } from "@/components/LoadingScan";
import { MenuCapture } from "@/components/MenuCapture";
import { ProfileSummary } from "@/components/ProfileSummary";
import { ScanError, analyze } from "@/lib/analyze-client";
import { DEMO_MENU_IMAGE } from "@/lib/demo";
import { ImageError, prepareImage, type PreparedImage } from "@/lib/image";
import { analysisStore, setDemoMode, useDemoMode, usePreferences } from "@/lib/preferences-store";

export default function ScanPage() {
  const router = useRouter();
  const prefs = usePreferences();
  const demo = useDemoMode();
  const [image, setImage] = useState<PreparedImage | null>(null);
  const [preparing, setPreparing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null); // couldn't open the file
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

  async function handleFile(file: File) {
    setPhotoError(null);
    setScanError(null);
    setPreparing(true);
    try {
      setImage(await prepareImage(file));
    } catch (e) {
      setPhotoError(e instanceof ImageError ? e.message : "We couldn't open that photo.");
    } finally {
      setPreparing(false);
    }
  }

  async function handleAnalyze() {
    if (!prefs) return;
    setScanError(null);
    setLoading(true);
    try {
      analysisStore.save(await analyze(image, prefs, demo));
      router.push("/results");
    } catch (e) {
      setScanError(e instanceof ScanError ? e : new ScanError("ai_unavailable", "Something went wrong. Please try again."));
      setLoading(false);
    }
  }

  // In demo mode, the sample menu stands in for a photo.
  const previewSrc = image?.previewUrl ?? (demo ? DEMO_MENU_IMAGE : null);

  if (loading) {
    return (
      <>
        <title>Reading the menu… · Picky Eater</title>
        <LoadingScan imageSrc={previewSrc} demo={demo} />
      </>
    );
  }

  return (
    <div className="pt-6 flex flex-col gap-5">
      <title>Scan a menu · Picky Eater</title>
      <h1 className="text-3xl font-extrabold">Scan a menu</h1>
      <ProfileSummary prefs={prefs} />
      <DemoToggle />

      {scanError ? (
        <ErrorState
          error={scanError}
          onRetry={() => void handleAnalyze()}
          onRetake={() => {
            setScanError(null);
            setImage(null);
          }}
          onDemo={() => {
            setScanError(null);
            setImage(null);
            setDemoMode(true);
          }}
        />
      ) : previewSrc ? (
        <div className="flex flex-col gap-3">
          <div className="rounded-card overflow-hidden border-2 border-line bg-white">
            {/* Plain <img>: the source is a local data URL or a static SVG, so next/image adds nothing. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewSrc}
              alt={image ? "Your menu photo" : "Sample menu from The Sunny Spoon café"}
              className="w-full max-h-[28rem] object-contain bg-white"
            />
            {demo && !image && (
              <p className="px-4 py-2 text-center font-bold text-ink-soft border-t border-line">Sample menu (Demo mode)</p>
            )}
          </div>

          {image?.small && (
            <p className="rounded-xl bg-okay-bg text-okay font-bold px-4 py-3">
              ⚠️ This photo is quite small, so some text may be hard to read. A closer photo works best.
            </p>
          )}
          {demo && image && (
            <p className="rounded-xl bg-lavender font-bold px-4 py-3">
              Demo mode is on, so you&apos;ll see sample results. Turn it off to check this photo for real.
            </p>
          )}

          <Button onClick={() => void handleAnalyze()} className="w-full">
            ✨ Check this menu
          </Button>
          {image && (
            <Button variant="secondary" className="w-full" onClick={() => setImage(null)}>
              Use a different photo
            </Button>
          )}
          {demo && !image && <MenuCapture onFile={handleFile} disabled={preparing} />}
        </div>
      ) : (
        <>
          <p className="text-lg text-ink-soft">Lay the menu flat, use good light, and fit one page in the photo.</p>
          <MenuCapture onFile={handleFile} disabled={preparing} />
        </>
      )}

      {photoError && (
        <p role="alert" className="rounded-xl border-2 border-bad bg-bad-bg text-bad font-extrabold px-4 py-3">
          ⚠️ {photoError}
        </p>
      )}
      {preparing && (
        <p role="status" className="text-center font-bold text-ink-soft">
          Getting your photo ready…
        </p>
      )}
    </div>
  );
}
