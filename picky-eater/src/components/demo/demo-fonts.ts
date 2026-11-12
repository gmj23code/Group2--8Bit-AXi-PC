import { Alfa_Slab_One, Amiri, Cormorant_Garamond, Noto_Sans_Devanagari, Noto_Sans_JP, Permanent_Marker, Righteous, Yatra_One } from "next/font/google";

// Fonts for the sample menus. All are self-hosted by next/font (downloaded at build
// time), so they work offline and never show empty boxes for non-Latin scripts.
// None are preloaded (preload: false): the browser fetches a font (and, for Japanese,
// only the slices of it) the first time a page actually shows those characters.
// They are also the app-wide fallbacks for non-Latin dish names (see globals.css).
// Only ONE Japanese family is used: each weight is ~120 font slices to download at build time.

const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "600", "700"], style: ["normal", "italic"], variable: "--f-trattoria", preload: false });
const notoSansJP = Noto_Sans_JP({ weight: ["400", "700"], preload: false, variable: "--f-jp-sans" });
const marker = Permanent_Marker({ subsets: ["latin"], weight: "400", variable: "--f-chalk", preload: false });
const amiri = Amiri({ subsets: ["arabic", "latin"], weight: ["400", "700"], variable: "--f-arabic", preload: false });
const devanagari = Noto_Sans_Devanagari({ subsets: ["devanagari", "latin"], weight: ["400", "600"], variable: "--f-devanagari", preload: false });
const yatra = Yatra_One({ subsets: ["devanagari", "latin"], weight: "400", variable: "--f-yatra", preload: false });
const alfa = Alfa_Slab_One({ subsets: ["latin"], weight: "400", variable: "--f-diner-display", preload: false });
const righteous = Righteous({ subsets: ["latin"], weight: "400", variable: "--f-diner", preload: false });

/** Put this class on any element that renders sample menu art. */
export const demoFontVars = [cormorant, notoSansJP, marker, amiri, devanagari, yatra, alfa, righteous]
  .map((f) => f.variable)
  .join(" ");
