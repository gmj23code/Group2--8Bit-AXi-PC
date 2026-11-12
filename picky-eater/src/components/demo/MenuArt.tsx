import type { CSSProperties, ReactNode } from "react";
import type { DemoDish, DemoMenu, DemoTheme } from "@/lib/demo/types";
import { demoFontVars } from "./demo-fonts";

// Draws one page of a sample menu so it looks like a PHOTO of a real menu: the paper
// (or chalkboard) sits slightly tilted on a table, with texture, shadow, and glare.
// Built from the same data the demo scores, so pictures and results always match.
// Everything is drawn at a fixed design size (SCENE_W × SCENE_H) and scaled by <Scaled>.

export const SCENE_W = 680;
export const SCENE_H = 880;
const PAPER_W = 600;
const PAPER_H = 800;

type Group = { key: string; heading: string; dishes: DemoDish[] };

/** Type scale for the dish list: fewer dishes on a page → larger type. */
function densityZoom(menu: DemoMenu, page: number): number {
  const n = menu.dishes.filter((d) => d.page === page).length;
  const printedLines = menu.dishes.filter((d) => d.page === page && d.printed).length;
  // The izakaya's columns are narrower (vertical name on the right), so it scales up less.
  if (n <= 12) return menu.theme === "izakaya" ? 1.12 : printedLines > 6 ? 1.2 : 1.3;
  if (n <= 15) return 1.06;
  return 1;
}

function groupsFor(menu: DemoMenu, page: number): Group[] {
  return Object.entries(menu.sections)
    .map(([key, heading]) => ({ key, heading, dishes: menu.dishes.filter((d) => d.page === page && d.section === key) }))
    .filter((g) => g.dishes.length > 0);
}

/* ---------- Per-restaurant look ---------- */

type Look = {
  lang: string;
  table: string; // background behind the paper
  tilt: number; // degrees
  paper: CSSProperties;
  body: CSSProperties; // default text style
  title: CSSProperties;
  tagline: CSSProperties;
  pageTitle: CSSProperties;
  heading: CSSProperties;
  name: CSSProperties;
  price: CSSProperties;
  printed: CSSProperties;
  english?: CSSProperties; // subtitle under the name (Hindi menu prints English)
  leader?: string; // dotted leader color between name and price
  columnGap: number;
  padding: string;
};

const WOOD = "repeating-linear-gradient(92deg, #5b3b22 0 14px, #6a4628 14px 22px, #573820 22px 37px), linear-gradient(#5d3c23, #3d2614)";

const LOOKS: Record<DemoTheme, Look> = {
  trattoria: {
    lang: "it",
    table: WOOD,
    tilt: -1.4,
    paper: {
      background:
        "radial-gradient(circle at 15% 10%, rgba(255,255,255,.55), transparent 45%), radial-gradient(circle at 85% 90%, rgba(120,80,30,.16), transparent 50%), #f4ead3",
      boxShadow: "inset 0 0 0 14px #f4ead3, inset 0 0 0 16px #8a6a44, inset 0 0 0 20px #f4ead3, inset 0 0 0 21px #8a6a44, inset 0 0 60px rgba(120,80,30,.25)",
    },
    body: { fontFamily: "var(--f-trattoria), Georgia, serif", color: "#2c2117" },
    title: { fontSize: 44, fontStyle: "italic", fontWeight: 700, letterSpacing: 0.5, textAlign: "center", lineHeight: 1 },
    tagline: { fontSize: 15, fontStyle: "italic", textAlign: "center", color: "#7a5734", marginTop: 4 },
    pageTitle: { fontSize: 17, textAlign: "center", letterSpacing: 4, textTransform: "uppercase", color: "#8b3a1e", margin: "10px 0 4px" },
    heading: { fontSize: 16, letterSpacing: 3, textTransform: "uppercase", color: "#8b3a1e", fontWeight: 700, borderBottom: "1px solid #c9a97a", paddingBottom: 2, margin: "12px 0 6px" },
    name: { fontSize: 16.5, fontWeight: 700 },
    price: { fontSize: 15.5, fontWeight: 600 },
    printed: { fontSize: 13, fontStyle: "italic", color: "#5b4632", lineHeight: 1.15 },
    leader: "#b89a70",
    columnGap: 30,
    padding: "46px 46px 40px",
  },
  izakaya: {
    lang: "ja",
    table: "radial-gradient(circle at 30% 20%, #3b3f44, #1c1e21 70%)",
    tilt: 1.6,
    paper: {
      background:
        "repeating-linear-gradient(87deg, rgba(120,110,90,.05) 0 2px, transparent 2px 7px), repeating-linear-gradient(-12deg, rgba(120,110,90,.04) 0 1px, transparent 1px 11px), #f6f2e7",
      borderTop: "10px solid #1d1d1d",
      borderBottom: "10px solid #1d1d1d",
    },
    body: { fontFamily: "var(--f-jp-sans), 'Hiragino Sans', 'Yu Gothic', sans-serif", color: "#1d1d1d" },
    title: { fontFamily: "var(--f-jp-sans), sans-serif", fontSize: 34, fontWeight: 700, letterSpacing: 6 },
    tagline: { fontSize: 13, color: "#6b6357", marginTop: 4, letterSpacing: 2 },
    pageTitle: { fontSize: 14, color: "#b0302a", letterSpacing: 3, margin: "8px 0 0" },
    heading: { fontFamily: "var(--f-jp-sans), sans-serif", fontSize: 19, fontWeight: 700, borderLeft: "6px solid #b0302a", paddingLeft: 8, margin: "14px 0 6px" },
    name: { fontSize: 17, fontWeight: 400 },
    price: { fontSize: 15.5 },
    printed: { fontSize: 12.5, color: "#6b6357" },
    leader: "#c9c0ad",
    columnGap: 34,
    padding: "34px 108px 30px 40px", // room on the right for the vertical name
  },
  taqueria: {
    lang: "es",
    table: "repeating-linear-gradient(0deg, #b36b4a 0 22px, #c98b6a 22px 24px), repeating-linear-gradient(90deg, transparent 0 46px, #c98b6a 46px 48px), #b36b4a",
    tilt: -0.8,
    paper: {
      background:
        "radial-gradient(circle at 20% 15%, rgba(255,255,255,.07), transparent 40%), radial-gradient(circle at 80% 70%, rgba(255,255,255,.05), transparent 45%), repeating-radial-gradient(circle at 40% 60%, rgba(255,255,255,.025) 0 1px, transparent 1px 5px), #1f2b25",
      border: "18px solid #6b4423",
      boxShadow: "inset 0 0 0 2px #4a2d14, inset 0 0 40px rgba(0,0,0,.6)",
    },
    body: { fontFamily: "var(--f-chalk), 'Comic Sans MS', cursive", color: "#f3f1e8", textShadow: "0 0 1px rgba(255,255,255,.6)" },
    title: { fontSize: 38, color: "#ffe27a", textAlign: "center", lineHeight: 1.05, transform: "rotate(-2deg)" },
    tagline: { fontSize: 16, textAlign: "center", color: "#f7a8c8", marginTop: 6 },
    pageTitle: { display: "none" },
    heading: { fontSize: 22, color: "#8fe0d0", margin: "10px 0 2px", textDecoration: "underline wavy rgba(143,224,208,.7)", textUnderlineOffset: 5 },
    name: { fontSize: 15.5 },
    price: { fontSize: 15.5, color: "#ffe27a" },
    printed: { fontSize: 11.5, color: "#cfd8d2", lineHeight: 1.15 },
    columnGap: 30,
    padding: "22px 26px",
  },
  lebanese: {
    lang: "ar",
    table: "radial-gradient(circle at 50% 40%, #9a4b2a, #5e2814 75%)",
    tilt: 1.1,
    paper: {
      background: "radial-gradient(circle at 50% 0%, rgba(255,255,255,.5), transparent 55%), #fbf0db",
      border: "12px solid transparent",
      borderImage: "repeating-linear-gradient(45deg, #2e5e4e 0 6px, #c8902e 6px 12px, #fbf0db 12px 14px) 12",
      boxShadow: "inset 0 0 0 3px #c8902e, inset 0 0 0 7px #fbf0db, inset 0 0 0 8px #2e5e4e",
    },
    body: { fontFamily: "var(--f-arabic), 'Noto Naskh Arabic', serif", color: "#2b1d12" },
    title: { fontSize: 42, fontWeight: 700, textAlign: "center", color: "#2e5e4e", lineHeight: 1.1 },
    tagline: { fontSize: 16, textAlign: "center", color: "#8a5a1c" },
    pageTitle: { display: "none" },
    heading: { fontSize: 21, fontWeight: 700, color: "#b0581f", textAlign: "center", margin: "8px 0 2px", borderTop: "1px solid #d9b98a", borderBottom: "1px solid #d9b98a" },
    name: { fontSize: 17, fontWeight: 700 },
    price: { fontSize: 13, color: "#2e5e4e", whiteSpace: "nowrap" },
    printed: { fontSize: 13, color: "#6b5440", lineHeight: 1.2 },
    columnGap: 26,
    padding: "30px 34px 24px",
  },
  indian: {
    lang: "hi",
    table: "repeating-linear-gradient(45deg, #0f4a4a 0 10px, #125454 10px 20px)",
    tilt: -1,
    paper: {
      background: "radial-gradient(circle at 50% 30%, #fffaf0, #fbefd6 80%)",
      border: "14px solid #7a1f2b",
      boxShadow: "inset 0 0 0 4px #e8a33a, inset 0 0 0 7px #fbefd6, inset 0 0 0 8px #7a1f2b",
    },
    body: { fontFamily: "var(--f-devanagari), 'Noto Sans Devanagari', sans-serif", color: "#3a1a10" },
    title: { fontFamily: "var(--f-yatra), serif", fontSize: 44, color: "#7a1f2b", textAlign: "center", lineHeight: 1.1 },
    tagline: { fontSize: 13, textAlign: "center", color: "#a0522d" },
    pageTitle: { fontFamily: "var(--f-yatra), serif", fontSize: 18, textAlign: "center", color: "#e08a1e", margin: "4px 0 0" },
    heading: { fontFamily: "var(--f-yatra), serif", fontSize: 18, color: "#fff4dc", background: "linear-gradient(90deg, #7a1f2b, #a8323e)", padding: "2px 10px", borderRadius: 4, margin: "10px 0 6px" },
    name: { fontSize: 16, fontWeight: 600 },
    price: { fontSize: 15, fontWeight: 600, color: "#7a1f2b" },
    printed: { fontSize: 12, color: "#7a5a40" },
    english: { fontSize: 11.5, fontStyle: "italic", color: "#8a6a50", fontFamily: "Georgia, serif", marginTop: -2 },
    leader: "#e3c08a",
    columnGap: 28,
    padding: "26px 30px",
  },
  deli: {
    lang: "en",
    table: "radial-gradient(circle at 30% 30%, #7fd3cf, #3f9f9a 70%)",
    tilt: 0.8,
    paper: { background: "#fffdf4", borderRadius: 10, overflow: "hidden" },
    body: { fontFamily: "var(--font-sans), Arial, sans-serif", color: "#1e1b1a" },
    title: { fontFamily: "var(--f-diner-display), serif", fontSize: 38, color: "#fffdf4", textAlign: "center", lineHeight: 1 },
    tagline: { fontFamily: "var(--f-diner), sans-serif", fontSize: 15, color: "#ffe9a8", textAlign: "center", letterSpacing: 2, marginTop: 6 },
    pageTitle: { fontFamily: "var(--f-diner), sans-serif", fontSize: 15, textAlign: "center", color: "#0f6f6a", letterSpacing: 3, margin: "6px 0 0" },
    heading: { fontFamily: "var(--f-diner), sans-serif", fontSize: 20, color: "#c8201e", margin: "10px 0 4px", letterSpacing: 1 },
    name: { fontSize: 15, fontWeight: 800 },
    price: { fontSize: 15, fontWeight: 800, color: "#c8201e" },
    printed: { fontSize: 12, color: "#6b625c" },
    leader: "#d7cfc2",
    columnGap: 28,
    padding: "0 30px 24px",
  },
};

/* ---------- Pieces ---------- */

function DishLine({ dish, look }: { dish: DemoDish; look: Look }) {
  return (
    <div style={{ breakInside: "avoid", marginBottom: 7 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span style={look.name}>{dish.name}</span>
        <span style={{ flex: 1, borderBottom: look.leader ? `1.5px dotted ${look.leader}` : "none", transform: "translateY(-4px)", minWidth: 8 }} />
        <span style={{ ...look.price, whiteSpace: "nowrap" }}>{dish.price}</span>
      </div>
      {look.english && dish.englishName && <div style={look.english}>{dish.englishName}</div>}
      {dish.printed && <div style={look.printed}>{dish.printed}</div>}
    </div>
  );
}

function Header({ menu, page, look }: { menu: DemoMenu; page: number; look: Look }) {
  const pageInfo = menu.pages.find((p) => p.number === page)!;
  if (menu.theme === "deli") {
    return (
      <div style={{ margin: "0 -30px 10px" }}>
        <div style={{ background: "#c8201e", padding: "22px 20px 16px" }}>
          <div style={look.title}>{menu.restaurant}</div>
          <div style={look.tagline}>{menu.tagline}</div>
        </div>
        {/* checkerboard strip */}
        <div style={{ height: 14, background: "repeating-conic-gradient(#1e1b1a 0 25%, #fffdf4 0 50%) 0 0 / 14px 14px" }} />
        <div style={look.pageTitle}>{pageInfo.title}</div>
      </div>
    );
  }
  if (menu.theme === "izakaya") {
    return (
      <div style={{ marginBottom: 6 }}>
        <div style={look.tagline}>{menu.tagline}</div>
        <div style={look.pageTitle}>{pageInfo.title}</div>
      </div>
    );
  }
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={look.title}>{menu.restaurant}</div>
      <div style={look.tagline}>{menu.tagline}</div>
      {menu.theme === "indian" && (
        // decorative dotted band under the header
        <div style={{ height: 10, margin: "8px 40px 0", background: "radial-gradient(circle, #e08a1e 2.5px, transparent 3px) 0 0 / 14px 10px" }} />
      )}
      {menu.theme === "trattoria" && <div style={{ width: 160, margin: "10px auto 0", borderTop: "1px solid #8a6a44", borderBottom: "1px solid #8a6a44", height: 3 }} />}
      {menu.theme === "taqueria" && (
        <svg width="220" height="12" viewBox="0 0 220 12" style={{ display: "block", margin: "6px auto 0" }} aria-hidden="true">
          <path d="M2 8 Q 20 0 38 8 T 74 8 T 110 8 T 146 8 T 182 8 T 218 8" stroke="#f7a8c8" strokeWidth="3" fill="none" strokeLinecap="round" />
        </svg>
      )}
      <div style={look.pageTitle}>{pageInfo.title}</div>
    </div>
  );
}

/** The izakaya's vertical name and red seal down the right side. */
function IzakayaSide({ menu }: { menu: DemoMenu }) {
  return (
    <div style={{ position: "absolute", top: 34, right: 26, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      <div style={{ writingMode: "vertical-rl", fontFamily: "var(--f-jp-sans), sans-serif", fontSize: 40, fontWeight: 700, letterSpacing: 10 }}>{menu.restaurant}</div>
      <div style={{ width: 46, height: 46, background: "#b0302a", color: "#f6f2e7", display: "grid", placeItems: "center", fontFamily: "var(--f-jp-sans), sans-serif", fontSize: 26, borderRadius: 4, transform: "rotate(-4deg)" }}>
        月
      </div>
      <div style={{ width: 1, height: 260, background: "#1d1d1d", opacity: 0.5 }} />
    </div>
  );
}

/* ---------- Public components ---------- */

/** One menu page, photographed on a table. Fixed design size: SCENE_W × SCENE_H. */
export function MenuPhoto({ menu, page }: { menu: DemoMenu; page: number }) {
  const look = LOOKS[menu.theme];
  const pageInfo = menu.pages.find((p) => p.number === page);
  return (
    <div
      className={demoFontVars}
      role="img"
      aria-label={`Sample menu: ${menu.restaurantLatin}, page ${page}${pageInfo ? ` (${pageInfo.titleEnglish})` : ""}`}
      style={{ width: SCENE_W, height: SCENE_H, background: look.table, position: "relative", overflow: "hidden" }}
    >
      <div
        aria-hidden="true"
        lang={look.lang}
        dir={menu.dir}
        style={{
          position: "absolute",
          left: (SCENE_W - PAPER_W) / 2,
          top: (SCENE_H - PAPER_H) / 2,
          width: PAPER_W,
          height: PAPER_H,
          transform: `rotate(${look.tilt}deg)`,
          boxShadow: "0 22px 40px rgba(0,0,0,.45), 0 4px 10px rgba(0,0,0,.3)",
          overflow: "hidden",
          boxSizing: "border-box",
          padding: look.padding,
          ...look.paper,
          ...look.body,
        }}
      >
        {menu.theme === "izakaya" && <IzakayaSide menu={menu} />}
        <Header menu={menu} page={page} look={look} />
        {/* Short pages get bigger type so the dishes fill the paper, like a real printed menu. */}
        <div style={{ columnCount: 2, columnGap: look.columnGap, zoom: densityZoom(menu, page) }}>
          {groupsFor(menu, page).map((g) => (
            <SectionBlock key={g.key} heading={<div style={{ ...look.heading, breakAfter: "avoid" }}>{g.heading}</div>}>
              {g.dishes.map((d) => (
                <DishLine key={d.name} dish={d} look={look} />
              ))}
            </SectionBlock>
          ))}
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 14, textAlign: "center", fontSize: 11.5, opacity: 0.75 }}>
          {menu.footer}
          {menu.pages.length > 1 ? ` · ${page}/${menu.pages.length}` : ""}
        </div>
      </div>
      {/* Camera glare + vignette: what makes it read as a photo. */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "linear-gradient(115deg, rgba(255,255,255,.18) 0%, transparent 28%, transparent 70%, rgba(255,255,255,.06) 100%), radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,.35) 100%)",
        }}
      />
    </div>
  );
}

function SectionBlock({ heading, children }: { heading: ReactNode; children: ReactNode }) {
  return (
    <>
      {heading}
      {children}
    </>
  );
}
