"use client";

import type { ScanError } from "@/lib/analyze-client";
import { Button } from "./Button";
import { EmptyState, Tips } from "./EmptyState";

type Kind = "photo" | "connection" | "setup" | "busy";

const PHOTO_TIPS = [
  "Use bright light. Stand near a window or turn on a light.",
  "Hold the phone steady and tap the screen to focus.",
  "Fit one menu page in the photo, straight on, not at an angle.",
];

// Title + what kind of fix helps, per error. The server's own message is shown as the body.
const CONTENT: Record<ScanError["code"], { title: string; kind: Kind; tips?: string[] }> = {
  unreadable: { title: "We couldn't read this photo", kind: "photo", tips: PHOTO_TIPS },
  not_a_menu: { title: "That doesn't look like a menu", kind: "photo", tips: ["Take a photo of the page with the dishes and prices."] },
  no_items: { title: "We couldn't find any dishes", kind: "photo", tips: ["Get a little closer.", "Try one section of the menu at a time."] },
  too_dense: { title: "Too many dishes on one page", kind: "photo", tips: ["Photograph the top half and bottom half of the page separately."] },
  refused: { title: "We couldn't check this menu", kind: "photo" },
  bad_request: { title: "We couldn't use that file", kind: "photo" },
  bad_file: { title: "We couldn't read that file", kind: "photo", tips: ["Use a PDF, or a JPG, PNG, or WebP photo."] },
  too_large: { title: "That file is too big", kind: "photo", tips: ["Take photos of the menu instead. We shrink photos automatically."] },
  too_many_pages: { title: "That menu has too many pages", kind: "photo", tips: ["Upload just the food and drink pages."] },
  encrypted_pdf: { title: "This PDF is locked", kind: "photo", tips: ["Save an unlocked copy, or take photos of the menu."] },
  network: { title: "You seem to be offline", kind: "connection" },
  timeout: { title: "This is taking too long", kind: "connection" },
  ai_unavailable: { title: "The menu reader is having trouble", kind: "connection" },
  rate_limited: { title: "Lots of people are scanning", kind: "busy" },
  no_api_key: { title: "Menu reading isn't set up yet", kind: "setup" },
};

type ErrorStateProps = {
  error: ScanError;
  onRetry: () => void;
  onRetake: () => void;
  onDemo: () => void;
};

/** What went wrong with a scan, in plain words, plus the most helpful next step first. */
export function ErrorState({ error, onRetry, onRetake, onDemo }: ErrorStateProps) {
  const c = CONTENT[error.code] ?? CONTENT.ai_unavailable;

  const retake = (
    <Button key="retake" onClick={onRetake} variant={c.kind === "photo" ? "primary" : "secondary"} className="w-full">
      Take a new photo
    </Button>
  );
  const retry = (
    <Button key="retry" onClick={onRetry} className="w-full">
      Try again
    </Button>
  );
  const demo = (
    <Button key="demo" onClick={onDemo} variant={c.kind === "setup" ? "primary" : "secondary"} className="w-full">
      Use Demo mode instead
    </Button>
  );

  const actions =
    c.kind === "photo" ? [retake] : c.kind === "setup" ? [demo] : c.kind === "busy" ? [retry, retake] : [retry, demo, retake];

  return (
    <EmptyState title={c.title} tone="problem" autoFocus actions={actions}>
      <p>{error.message}</p>
      {c.tips && <Tips items={c.tips} />}
    </EmptyState>
  );
}
