"use client";

import { DEMO_MENUS, type DemoMenu } from "@/lib/demo";
import { Icon } from "../Icon";
import { MenuPhoto, SCENE_H, SCENE_W } from "./MenuArt";
import { Scaled } from "./Scaled";

/** Small "IT · Italiano" label. Text, not a flag emoji: clearer, and readable by screen readers. */
export function LanguageLabel({ menu }: { menu: DemoMenu }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-subtle px-2 py-0.5 text-sm font-medium text-ink-soft">
      <span className="font-semibold text-ink tabular-nums">{menu.language.code}</span>
      <span lang={menu.language.code.toLowerCase()}>{menu.language.native}</span>
      {menu.dir === "rtl" && <span className="text-xs">· right-to-left</span>}
    </span>
  );
}

/** The six sample menus as cards. Picking one opens its pages. */
export function DemoGallery({ onPick }: { onPick: (id: string) => void }) {
  return (
    <section aria-labelledby="gallery-title" className="flex flex-col gap-4">
      <div>
        <h2 id="gallery-title" className="font-display text-[1.9rem] leading-tight">
          Pick a sample menu
        </h2>
        <p className="text-ink-soft mt-1">
          Six restaurants, six languages. Each one is scored live against your preferences.
        </p>
        <p className="text-xs text-ink-soft mt-1">Sample menus for demonstration. All restaurants are made up.</p>
      </div>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {DEMO_MENUS.map((m) => (
          <li key={m.id}>
            <button
              type="button"
              onClick={() => onPick(m.id)}
              className="group w-full text-left rounded-card border border-line bg-surface shadow-card overflow-hidden hover:shadow-lift transition-shadow"
            >
              {/* Top of page 1, cropped to a landscape thumbnail. */}
              <div className="aspect-[4/3] overflow-hidden border-b border-line">
                <Scaled width={SCENE_W} height={SCENE_H}>
                  <MenuPhoto menu={m} page={1} />
                </Scaled>
              </div>
              <div className="p-4 flex flex-col gap-1.5">
                <div className="flex items-start justify-between gap-3">
                  <span className="font-semibold leading-snug">{m.restaurantLatin}</span>
                  <Icon name="chevronRight" className="mt-0.5 text-ink-soft group-hover:text-ink" />
                </div>
                <span className="text-ink-soft">{m.cuisine}</span>
                <div className="flex flex-wrap items-center gap-2 mt-0.5">
                  <LanguageLabel menu={m} />
                  <span className="text-sm text-ink-soft tabular-nums">
                    {m.pages.length} {m.pages.length === 1 ? "page" : "pages"} · {m.dishes.length} dishes
                  </span>
                </div>
                <span className="text-sm text-ink-soft">{m.highlight}</span>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
