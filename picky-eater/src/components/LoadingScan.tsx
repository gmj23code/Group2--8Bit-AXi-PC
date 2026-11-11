"use client";

import { useEffect, useState } from "react";
import { Mascot } from "./Mascot";

const STEPS = ["Reading the menu", "Checking your diet and allergies", "Scoring dishes for your goals"];

type LoadingScanProps = {
  /** Photo being scanned (data URL or sample menu). */
  imageSrc: string | null;
  demo: boolean;
};

/**
 * Scanning screen: the photo with a moving scan line, plus a checklist that ticks
 * along. The steps are paced estimates (the AI doesn't report progress), so the
 * last step simply waits until the real answer arrives.
 */
export function LoadingScan({ imageSrc, demo }: LoadingScanProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), demo ? 600 : 4000);
    return () => clearInterval(id);
  }, [demo]);

  return (
    <div className="pt-8 flex flex-col items-center text-center gap-6">
      <div className="relative w-56 h-72 rounded-card overflow-hidden border-4 border-white shadow-lg bg-white">
        {imageSrc && (
          // eslint-disable-next-line @next/next/no-img-element -- local data URL / static SVG
          <img src={imageSrc} alt="" className="w-full h-full object-cover opacity-80" />
        )}
        {/* The scan line. Stops moving if the user prefers reduced motion (see globals.css). */}
        <div className="absolute inset-x-0 h-1.5 bg-brand shadow-[0_0_16px_4px_rgba(47,125,79,0.5)] animate-scan" aria-hidden="true" />
        <div className="absolute bottom-2 right-2" aria-hidden="true">
          <Mascot size={56} mood="thinking" />
        </div>
      </div>

      <div role="status" aria-live="polite">
        <h1 className="text-2xl font-extrabold">{STEPS[step]}…</h1>
        <p className="text-lg text-ink-soft mt-1">
          {demo ? "Checking the sample menu for you." : "This usually takes 10–20 seconds."}
        </p>
      </div>

      <ol className="w-full max-w-sm flex flex-col gap-2 text-left" aria-hidden="true">
        {STEPS.map((label, i) => (
          <li
            key={label}
            className={`flex items-center gap-3 rounded-2xl px-4 py-3 font-bold ${
              i < step ? "bg-great-bg text-great" : i === step ? "bg-white border-2 border-brand" : "bg-white/60 text-ink-soft"
            }`}
          >
            <span className="w-6 text-center">{i < step ? "✓" : i === step ? "⏳" : "○"}</span>
            {label}
          </li>
        ))}
      </ol>
    </div>
  );
}
