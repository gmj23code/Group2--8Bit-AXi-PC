"use client";

import { useState } from "react";
import { DEMO_DISHES, DEMO_PAGES, DEMO_RESTAURANT } from "@/lib/demo-menu";
import { demoPageImages } from "@/lib/demo-menu-svg";

/**
 * The sample menu shown in Demo mode: three page thumbnails (tap to preview each)
 * above a large view of the selected page, so the audience sees a multi-page scan.
 */
export function DemoMenuPages() {
  const images = demoPageImages();
  const [selected, setSelected] = useState(0);
  const page = DEMO_PAGES[selected];

  return (
    <div className="rounded-card border border-line bg-surface shadow-card overflow-hidden">
      <div className="px-5 pt-4 pb-3 flex items-baseline justify-between gap-3">
        <p className="font-semibold">
          Sample menu <span className="font-normal text-ink-soft">· {DEMO_RESTAURANT}</span>
        </p>
        <p className="text-sm text-ink-soft tabular-nums">
          {DEMO_PAGES.length} pages · {DEMO_DISHES.length} dishes
        </p>
      </div>

      {/* Page thumbnails */}
      <div role="group" aria-label="Menu pages" className="px-5 pb-4 grid grid-cols-3 gap-3">
        {DEMO_PAGES.map((p, i) => (
          <button
            key={p.number}
            type="button"
            aria-pressed={selected === i}
            onClick={() => setSelected(i)}
            className={`rounded-lg border-2 p-1.5 text-left transition-colors ${
              selected === i ? "border-brand bg-brand-soft" : "border-line hover:border-line-strong"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- generated data URL */}
            <img src={images[i]} alt="" className="w-full aspect-[3/4] object-cover object-top rounded" />
            <span className="block mt-1.5 text-sm font-semibold">Page {p.number}</span>
            <span className="block text-xs text-ink-soft leading-snug">{p.title}</span>
          </button>
        ))}
      </div>

      {/* Large preview of the selected page */}
      <div className="border-t border-line bg-subtle/50 p-3">
        {/* eslint-disable-next-line @next/next/no-img-element -- generated data URL */}
        <img
          src={images[selected]}
          alt={`Sample menu page ${page.number}: ${page.title}`}
          className="mx-auto w-full max-w-md max-h-[34rem] object-contain object-top rounded-md shadow-card bg-surface"
        />
      </div>
    </div>
  );
}
