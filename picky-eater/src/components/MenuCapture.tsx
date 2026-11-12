"use client";

import { useRef, type ChangeEvent } from "react";
import { Icon } from "./Icon";

type MenuCaptureProps = {
  onFiles: (files: File[]) => void;
  disabled?: boolean;
  /** Secondary styling when another primary action is on screen (e.g. Demo mode). */
  quiet?: boolean;
  /** Labels change once photos are already picked ("Add another photo"). */
  adding?: boolean;
};

/**
 * Two big choices: take a photo (opens the rear camera on phones) or upload photos/a PDF
 * from the device. Uploading allows several photos at once (one per menu page).
 */
export function MenuCapture({ onFiles, disabled, quiet = false, adding = false }: MenuCaptureProps) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const uploadRef = useRef<HTMLInputElement>(null);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = ""; // allow picking the same file twice
    if (files.length) onFiles(files);
  }

  const tile =
    "w-full min-h-24 rounded-card border flex flex-col items-center justify-center gap-1.5 px-3 text-base font-semibold transition-colors disabled:opacity-50";

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <button
        type="button"
        disabled={disabled}
        onClick={() => cameraRef.current?.click()}
        className={`${tile} ${quiet ? "bg-surface text-ink border-line-strong hover:bg-subtle" : "bg-brand text-white border-brand hover:bg-brand-dark shadow-card"}`}
      >
        <Icon name="camera" size={26} />
        {adding ? "Photograph another page" : "Take a photo"}
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => uploadRef.current?.click()}
        className={`${tile} bg-surface text-ink border-line-strong hover:bg-subtle`}
      >
        <Icon name={adding ? "image" : "menu"} size={26} />
        {adding ? "Upload more photos" : "Upload photos or a PDF"}
        {!adding && <span className="text-sm font-normal text-ink-soft">Several photos, or a PDF menu</span>}
      </button>

      <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden onChange={handleChange} />
      <input
        ref={uploadRef}
        type="file"
        accept={adding ? "image/*" : "image/*,application/pdf,.pdf"}
        multiple
        hidden
        onChange={handleChange}
      />
    </div>
  );
}
