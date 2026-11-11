"use client";

import { useRef, type ChangeEvent } from "react";

type MenuCaptureProps = {
  onFile: (file: File) => void;
  disabled?: boolean;
};

/**
 * Two big choices: take a photo (opens the rear camera on phones) or pick one from
 * the device. On laptops both open a file picker, which is fine for demos.
 */
export function MenuCapture({ onFile, disabled }: MenuCaptureProps) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const uploadRef = useRef<HTMLInputElement>(null);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow picking the same file twice
    if (file) onFile(file);
  }

  const big =
    "w-full min-h-24 rounded-card border-2 text-xl font-extrabold flex items-center justify-center gap-3 disabled:opacity-50";

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <button
        type="button"
        disabled={disabled}
        onClick={() => cameraRef.current?.click()}
        className={`${big} bg-brand text-white border-brand-dark hover:bg-brand-dark`}
      >
        <span className="text-3xl" aria-hidden="true">📸</span> Take a photo
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => uploadRef.current?.click()}
        className={`${big} bg-white text-ink border-line hover:bg-brand-soft`}
      >
        <span className="text-3xl" aria-hidden="true">🖼️</span> Upload a photo
      </button>

      <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden onChange={handleChange} />
      <input ref={uploadRef} type="file" accept="image/*" hidden onChange={handleChange} />
    </div>
  );
}
