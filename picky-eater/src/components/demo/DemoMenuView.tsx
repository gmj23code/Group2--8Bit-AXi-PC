"use client";

import { useState } from "react";
import type { DemoMenu } from "@/lib/demo";
import { Button } from "../Button";
import { Icon } from "../Icon";
import { LanguageLabel } from "./DemoGallery";
import { MenuPhoto, SCENE_H, SCENE_W } from "./MenuArt";
import { Scaled } from "./Scaled";

/** One sample menu: its pages (tap a thumbnail to view it) and the scan button. */
export function DemoMenuView({ menu, onBack, onScan }: { menu: DemoMenu; onBack: () => void; onScan: () => void }) {
  const [page, setPage] = useState(1);
  const many = menu.pages.length > 1;

  return (
    <section aria-labelledby="menu-title" className="flex flex-col gap-4">
      <button
        type="button"
        onClick={onBack}
        className="self-start -ml-2 min-h-12 px-2 inline-flex items-center gap-1 rounded-lg font-medium text-ink-soft hover:text-ink hover:bg-subtle"
      >
        <Icon name="chevronLeft" /> All sample menus
      </button>

      <div>
        <h2 id="menu-title" className="font-display text-[1.9rem] leading-tight">
          {menu.restaurantLatin}
        </h2>
        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-ink-soft">
          <span>{menu.cuisine}</span>
          <LanguageLabel menu={menu} />
          <span className="text-sm tabular-nums">
            {menu.pages.length} {many ? "pages" : "page"} · {menu.dishes.length} dishes
          </span>
        </div>
      </div>

      <div className="rounded-card border border-line bg-surface shadow-card overflow-hidden">
        {many && (
          <div role="group" aria-label="Menu pages" className="p-3 grid gap-3 border-b border-line" style={{ gridTemplateColumns: `repeat(${menu.pages.length}, minmax(0, 1fr))` }}>
            {menu.pages.map((p) => (
              <button
                key={p.number}
                type="button"
                aria-pressed={page === p.number}
                onClick={() => setPage(p.number)}
                className={`rounded-lg border-2 p-1.5 text-left transition-colors ${page === p.number ? "border-brand bg-brand-soft" : "border-line hover:border-line-strong"}`}
              >
                <div className="aspect-[4/3] overflow-hidden rounded">
                  <Scaled width={SCENE_W} height={SCENE_H}>
                    <MenuPhoto menu={menu} page={p.number} />
                  </Scaled>
                </div>
                <span className="block mt-1.5 text-sm font-semibold">Page {p.number}</span>
                <span className="block text-xs text-ink-soft leading-snug">{p.titleEnglish}</span>
              </button>
            ))}
          </div>
        )}
        <div className="bg-subtle/50 p-3">
          <div className="mx-auto max-w-md">
            <Scaled width={SCENE_W} height={SCENE_H} className="rounded-md shadow-card">
              <MenuPhoto menu={menu} page={page} />
            </Scaled>
          </div>
        </div>
      </div>

      <Button onClick={onScan} className="w-full">
        {many ? `Scan all ${menu.pages.length} pages` : "Scan this menu"}
      </Button>
      <p className="text-xs text-ink-soft text-center">Sample menu for demonstration. Scored on your device; no AI call is made.</p>
    </section>
  );
}
